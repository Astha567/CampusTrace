import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with recommended user agent
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(aiClient),
    app: 'CampusTrace',
    timestamp: new Date().toISOString(),
  });
});

// Grounded AI Chat Endpoint
app.post('/api/assistant/chat', async (req, res) => {
  const { message, retrievedContext, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // If AI client is not configured, inform client to use local grounded retrieval fallback
  if (!aiClient) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on server.',
      fallbackNeeded: true,
    });
  }

  try {
    const systemInstruction = `You are "CampusTrace" AI Assistant for Team Offshore's university campus.
IMPORTANT RULES:
1. Answer ONLY from the provided campus data context below.
2. If the requested information is missing, incomplete, or uncertain in the context, explicitly say: "I do not have verified records for that in the campus directory. Please contact the relevant official university office." and suggest the closest office or contact.
3. NEVER invent or hallucinate rooms, dates, phone numbers, email addresses, or contacts.
4. NEVER reveal private student information.
5. Format your response cleanly using concise bullet points where appropriate.
6. Clearly mention the building, room number, or event deadline if present in the data.
7. Be friendly, encouraging, and student-focused.

VERIFIED CAMPUS CONTEXT:
${retrievedContext || 'No verified campus context provided.'}
`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.2, // Low temperature for high factual accuracy
      },
    });

    const answer = response.text || "I couldn't process that query. Please check with the campus help desk.";
    return res.json({ answer });
  } catch (err: any) {
    console.error('Error generating Gemini response:', err);
    return res.status(500).json({
      error: 'Failed to contact Gemini API: ' + (err?.message || 'Unknown error'),
      fallbackNeeded: true,
    });
  }
});

// Vite or Static Production middleware
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Everywhere Door server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
