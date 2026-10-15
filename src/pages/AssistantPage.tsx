import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { askCampusAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';
import {
  Sparkles,
  Send,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  ChevronDown,
  Info,
  RefreshCw,
} from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const { navigateToRoomOnMap, navigateToEvent, navigateToContact } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Hello! I am your CampusTrace AI Assistant. I am strictly grounded in our verified campus directory to help you find classrooms, track events, discover club recruitment dates, and locate verified faculty contacts.\n\nHow can I help you navigate campus today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Where is the library and study rooms?',
    'Find Room B-204 in Tesla Hall',
    'What workshops and hackathons are happening this week?',
    'When does Formula Racing recruitment close?',
    'Who should I contact about the Computer Science department?',
    'How do I connect to campus Wi-Fi?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await askCampusAssistant(prompt, messages);

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sourcesUsed: response.sourcesUsed,
        suggestedAction: response.suggestedAction,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          sender: 'assistant',
          text: "I encountered an error querying the model. Please check the Single-Window Student Services Desk in Block F, Room F-001 for verified assistance.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (source: NonNullable<ChatMessage['sourcesUsed']>[0]) => {
    if (source.type === 'room') {
      if (source.id.includes('b-')) {
        navigateToRoomOnMap('blk-b', source.id);
      } else if (source.id.includes('a-')) {
        navigateToRoomOnMap('blk-a', source.id);
      } else if (source.id.includes('d-')) {
        navigateToRoomOnMap('blk-d', source.id);
      } else if (source.id.includes('c-')) {
        navigateToRoomOnMap('blk-c', source.id);
      } else if (source.id.includes('e-')) {
        navigateToRoomOnMap('blk-e', source.id);
      } else {
        navigateToRoomOnMap('blk-f', source.id);
      }
    } else if (source.type === 'building') {
      navigateToRoomOnMap(source.id, 'room-a-001');
    } else if (source.type === 'event') {
      navigateToEvent(source.id);
    } else if (source.type === 'contact') {
      navigateToContact(source.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D1F25] dark:text-[#FFF4DE]">
              CampusTrace AI Assistant
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFDDDD] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#FFCED8] border border-[#FFCED8]">
              <ShieldCheck className="w-3 h-3 text-[#D94A6E]" />
              Grounded Retrieval
            </span>
          </div>
          <p className="text-xs text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
            Strict factual adherence to verified campus records. No external web hallucinations.
          </p>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'msg-welcome',
                sender: 'assistant',
                text: "Chat cleared. What campus location or event can I help you find?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="p-2 text-[#8F7580] hover:text-[#2D1F25] rounded-xl hover:bg-[#FFF4DE] transition"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Feed Box with Palette */}
      <div className="bg-white dark:bg-[#20181D] rounded-3xl border border-[#FFCED8] dark:border-[#422C36] shadow-sm flex flex-col h-[65vh] sm:h-[70vh] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D94A6E] via-[#FFCED8] to-[#FFE8C4] text-[#4A1422] flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Sparkles className="w-4 h-4 text-[#5A1527]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-3 ${
                    isUser
                      ? 'bg-[#D94A6E] text-white rounded-tr-sm shadow-md shadow-[#D94A6E]/20'
                      : 'bg-[#FFF9F2] dark:bg-[#2A1F26] text-[#2D1F25] dark:text-[#FFF4DE] rounded-tl-sm border border-[#FFCED8]/70 dark:border-[#422C36]'
                  }`}
                >
                  <div className="whitespace-pre-line space-y-1">
                    {msg.text}
                  </div>

                  {/* Sources Used Badges */}
                  {!isUser && msg.sourcesUsed && msg.sourcesUsed.length > 0 && (
                    <div className="pt-2 border-t border-[#FFCED8]/50 dark:border-[#38202A] space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C203B] dark:text-[#FFCED8] flex items-center gap-1">
                        <Info className="w-3 h-3 text-[#D94A6E]" />
                        Verified Sources Used:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sourcesUsed.map((source, i) => (
                          <button
                            key={i}
                            onClick={() => handleChipClick(source)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#FFF4DE] dark:bg-[#382618] text-[#8C3A00] dark:text-[#FFE8C4] hover:bg-[#FFE8C4] border border-[#FFE8C4] shadow-xs transition"
                          >
                            {source.type === 'room' || source.type === 'building' ? (
                              <MapPin className="w-3 h-3 text-[#D94A6E]" />
                            ) : source.type === 'event' ? (
                              <Calendar className="w-3 h-3 text-[#F59E38]" />
                            ) : (
                              <Users className="w-3 h-3 text-[#8C203B]" />
                            )}
                            <span>{source.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Action Button */}
                  {!isUser && msg.suggestedAction && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          const action = msg.suggestedAction!;
                          if (action.type === 'navigate_map') {
                            if (action.targetId.includes('b-') || action.targetId.includes('room-b')) {
                              navigateToRoomOnMap('blk-b', action.targetId);
                            } else {
                              navigateToRoomOnMap('blk-a', action.targetId);
                            }
                          } else if (action.type === 'view_event') {
                            navigateToEvent(action.targetId);
                          } else if (action.type === 'view_contact') {
                            navigateToContact(action.targetId);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#D94A6E] hover:bg-[#BF3659] transition shadow-sm"
                      >
                        <span>{msg.suggestedAction.label}</span>
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[10px] text-right font-medium ${
                      isUser ? 'text-[#FFDDDD]' : 'text-[#8F7580]'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-[#D94A6E] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-[#FFE8C4]" />
              </div>
              <div className="rounded-3xl rounded-tl-sm p-4 bg-[#FFF9F2] dark:bg-[#2A1F26] border border-[#FFCED8] dark:border-[#422C36] text-xs text-[#7A616B] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D94A6E] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#D94A6E] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#D94A6E] animate-bounce [animation-delay:0.4s]" />
                <span>Searching verified campus records & generating grounded answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Shelf with Palette */}
        <div className="px-4 py-2 border-t border-[#FFCED8]/50 dark:border-[#38202A] bg-[#FFF9F2] dark:bg-[#1A1217] overflow-x-auto no-scrollbar flex items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-[#8C203B] dark:text-[#FFCED8] shrink-0">Try:</span>
          {suggestedPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#261E23] text-[#2D1F25] dark:text-[#FFF4DE] hover:text-[#D94A6E] border border-[#FFCED8] dark:border-[#422C36] shrink-0 transition text-xs font-medium disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#20181D] border-t border-[#FFCED8] dark:border-[#422C36] flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask a campus question (e.g. 'Where is the library?' or 'What workshops are open?')..."
            className="flex-1 bg-[#FFF9F2] dark:bg-[#1A1217] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#2D1F25] dark:text-[#FFF4DE] placeholder:text-[#A8929B] focus:outline-none focus:ring-2 focus:ring-[#D94A6E] border border-[#FFCED8]/60 transition"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || isLoading}
            className="p-3 bg-[#D94A6E] hover:bg-[#BF3659] text-white rounded-2xl transition disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-[#D94A6E]/20 shrink-0"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
