import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { FAQ } from '../types';
import {
  ShieldCheck,
  Lock,
  CheckSquare,
  Square,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Sparkles,
  Rocket,
  Compass,
  FileCheck,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { openReportModal } = useApp();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // University deployment checklist interactive check states
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved =
        localStorage.getItem('campustrace_checklist') ||
        localStorage.getItem('everywhere_door_checklist');
      return saved
        ? JSON.parse(saved)
        : {
            item1: true,  // Floor plans CAD verified
            item2: false, // Event verification committee assigned
            item3: true,  // Student lead consent forms gathered
            item4: false, // Official ERP API integration
            item5: false, // Web Push Service Worker deployment
            item6: true,  // AI Assistant Grounding boundaries audited
          };
    } catch {
      return {};
    }
  });

  useEffect(() => {
    dataService.getFAQs().then(setFaqs);
  }, []);

  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('campustrace_checklist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const checklistItems = [
    {
      id: 'item1',
      title: 'Campus CAD Floor Plans & Publication Permissions',
      description:
        'Written sign-off from University Estates & Physical Facilities Directorate authorizing public rendering of building layouts and emergency exits.',
    },
    {
      id: 'item2',
      title: 'Event Verification Committee & Publishing Workflow',
      description:
        'Designation of primary student union moderators and faculty advisors responsible for approving hackathons, workshops, and audition dates.',
    },
    {
      id: 'item3',
      title: 'Contact-Publishing Consent (Faculty & Student Leads)',
      description:
        'Digital consent records ensuring WhatsApp numbers and personal emails are only rendered when explicit consent is provided.',
    },
    {
      id: 'item4',
      title: 'Official Feeds & ERP Integration Feasibility',
      description:
        'Assessment of read-only LDAP/CAS student directory feeds, room reservation database APIs, or university RSS circulars.',
    },
    {
      id: 'item5',
      title: 'Calendar & Push Notification Architecture',
      description:
        'Evaluation of iCalendar (.ics) exports vs. Apple/Google Calendar Web Add URLs vs. browser push notification infrastructure.',
    },
    {
      id: 'item6',
      title: 'AI Assistant Grounded Context Boundaries',
      description:
        'Rigorous prompt engineering and verification testing guaranteeing that the assistant strictly admits missing records rather than hallucinating campus facts.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
            About & Trust Policy
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ECC0C2] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#F2B4C0] border border-[#F2B4C0] dark:border-[#5C2B3C]">
            CampusTrace
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#7A616B] dark:text-[#BFA5AF] mt-1">
          Designed and built by <strong>Team Offshore</strong> as an open, accessible, student-friendly digital companion to university life.
        </p>
      </div>

      {/* Core Principles Grid using Palette */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#FFF5D6] dark:bg-[#20181D] border border-[#F2B4C0]/70 dark:border-[#422C36] space-y-2.5 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#ECC0C2] dark:bg-[#3D1E28] text-[#D94A6E] dark:text-[#F2B4C0] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#2D1F25] dark:text-[#FBEEBF] text-sm">
            Accuracy First
          </h3>
          <p className="text-xs text-[#5C454F] dark:text-[#C7B0BA] leading-relaxed">
            Every room, event, and contact card explicitly displays a "Last updated" date and an official source or registration link. No phantom dates or unverified listings.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFF5D6] dark:bg-[#20181D] border border-[#F2B4C0]/70 dark:border-[#422C36] space-y-2.5 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#F3D3C9] dark:bg-[#382618] text-[#8C3A00] dark:text-[#F3D3C9] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#2D1F25] dark:text-[#FBEEBF] text-sm">
            Zero Tracking Privacy
          </h3>
          <p className="text-xs text-[#5C454F] dark:text-[#C7B0BA] leading-relaxed">
            No mandatory student accounts required for browsing. Saved bookmarks and calendar items reside exclusively in your browser's local storage.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFF5D6] dark:bg-[#20181D] border border-[#F2B4C0]/70 dark:border-[#422C36] space-y-2.5 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#FBEEBF] dark:bg-[#302521] text-[#8C5200] dark:text-[#FBEEBF] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#2D1F25] dark:text-[#FBEEBF] text-sm">
            Grounded AI Guardrails
          </h3>
          <p className="text-xs text-[#5C454F] dark:text-[#C7B0BA] leading-relaxed">
            Our assistant retrieves only verified local campus facts using fuzzy matching before prompting Gemini. If records are absent, it directs you to official desks.
          </p>
        </div>
      </section>

      {/* "WHAT NEEDS TO BE CONFIRMED" CHECKLIST */}
      <section className="bg-[#FFF5D6] dark:bg-[#20181D] rounded-3xl border border-[#F2B4C0]/70 dark:border-[#422C36] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#F2B4C0]/40 dark:border-[#38202A]">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#D94A6E] dark:text-[#F2B4C0]" />
              <h2 className="text-lg font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
                What Needs to be Confirmed (Production Checklist)
              </h2>
            </div>
            <p className="text-xs text-[#7A616B] dark:text-[#BFA5AF] mt-0.5">
              Items to resolve with university administration before switching from sample data to full production deployment.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {checklistItems.map((item) => {
            const isChecked = Boolean(checklist[item.id]);
            return (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'border-[#F2B4C0] dark:border-[#5C2B3C] bg-[#ECC0C2]/30 dark:bg-[#3D1E28]/40'
                    : 'border-[#F2B4C0]/50 dark:border-[#422C36] bg-[#FFF5D6]/60 dark:bg-[#1E171C]/50'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-[#D94A6E] dark:text-[#F2B4C0] shrink-0"
                  aria-label={isChecked ? `Uncheck ${item.title}` : `Check ${item.title}`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-[#D94A6E] dark:text-[#F2B4C0]" />
                  ) : (
                    <Square className="w-5 h-5 text-[#A8929B]" />
                  )}
                </button>
                <div className="space-y-0.5">
                  <h4
                    className={`text-xs font-bold ${
                      isChecked
                        ? 'text-[#8C203B] dark:text-[#F2B4C0] line-through opacity-70'
                        : 'text-[#2D1F25] dark:text-[#FBEEBF]'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#5C454F] dark:text-[#BFA5AF] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ROADMAP & STRETCH GOALS */}
      <section className="bg-[#FFF5D6] dark:bg-[#20181D] rounded-3xl border border-[#F2B4C0]/70 dark:border-[#422C36] p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-[#D94A6E] dark:text-[#F3D3C9]" />
          <h2 className="text-lg font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
            Roadmap & Extension Points
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FFF5D6] dark:bg-[#261B21] border border-[#F2B4C0]/60 dark:border-[#422C36] space-y-1">
            <span className="font-bold text-[#2D1F25] dark:text-[#FBEEBF]">Full 3D Campus Digital Twin</span>
            <p className="text-[#5C454F] dark:text-[#BFA5AF] text-[11px]">
              Expand beyond the current experimental 3D block prototype into full WebGL/Three.js interactive campus walkthrough.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF5D6] dark:bg-[#261B21] border border-[#F2B4C0]/60 dark:border-[#422C36] space-y-1">
            <span className="font-bold text-[#2D1F25] dark:text-[#FBEEBF]">Multi-Source Event Sync</span>
            <p className="text-[#5C454F] dark:text-[#BFA5AF] text-[11px]">
              Automated ingestion pipelines connecting student portal circulars, Devfolio hackathons, and Google Calendar feeds.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF5D6] dark:bg-[#261B21] border border-[#F2B4C0]/60 dark:border-[#422C36] space-y-1">
            <span className="font-bold text-[#2D1F25] dark:text-[#FBEEBF]">Native Push & SMS Reminders</span>
            <p className="text-[#5C454F] dark:text-[#BFA5AF] text-[11px]">
              Optional WhatsApp or email reminder integration with opt-in user consent to notify 2h before registration closures.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFF5D6] dark:bg-[#261B21] border border-[#F2B4C0]/60 dark:border-[#422C36] space-y-1">
            <span className="font-bold text-[#2D1F25] dark:text-[#FBEEBF]">Universal Accessibility Routing</span>
            <p className="text-[#5C454F] dark:text-[#BFA5AF] text-[11px]">
              Dedicated step-free, tactile pavement, and elevator-only paths across all 6 blocks for students with mobility needs.
            </p>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS (15 Sample Entries) */}
      <section className="bg-[#FFF5D6] dark:bg-[#20181D] rounded-3xl border border-[#F2B4C0]/70 dark:border-[#422C36] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#F2B4C0]/40 dark:border-[#38202A]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#D94A6E] dark:text-[#F2B4C0]" />
            <h2 className="text-lg font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
              Freshman Campus Guide & FAQs ({faqs.length})
            </h2>
          </div>
          <span className="text-xs text-[#8F7580] dark:text-[#BFA5AF]">Verified official handbook</span>
        </div>

        <div className="divide-y divide-[#F2B4C0]/40 dark:divide-[#38202A]">
          {faqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div key={faq.id} className="py-3">
                <button
                  onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  className="w-full text-left flex items-start justify-between gap-3 group focus:outline-none"
                >
                  <span className="font-bold text-xs sm:text-sm text-[#2D1F25] dark:text-[#FBEEBF] group-hover:text-[#D94A6E] dark:group-hover:text-[#F2B4C0] transition-colors">
                    {faq.question}
                  </span>
                  <span className="p-1 text-[#8F7580] group-hover:text-[#D94A6E] shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-2 text-xs text-[#5C454F] dark:text-[#D9C4CC] leading-relaxed space-y-2 animate-in fade-in duration-150">
                    <p>{faq.answer}</p>
                    <div className="text-[10px] text-[#8F7580] dark:text-[#A8929B] flex items-center justify-between pt-1 border-t border-[#F2B4C0]/30 dark:border-[#38202A]">
                      <span>Source: {faq.sourceLabel}</span>
                      <span>Verified: {faq.lastUpdated}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Community Report Prompt Callout with Palette */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#F2B4C0]/40 via-[#ECC0C2]/30 to-[#FBEEBF]/40 dark:from-[#3D1E28] dark:to-[#2A1820] border border-[#F2B4C0] dark:border-[#5C2B3C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#8C203B] dark:text-[#F2B4C0] font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-[#D94A6E]" />
            Spot an outdated room number or postponed event?
          </div>
          <p className="text-xs text-[#5C454F] dark:text-[#C7B0BA]">
            Submit a correction and help keep CampusTrace accurate for every student on campus.
          </p>
        </div>

        <button
          onClick={() => openReportModal('general', undefined, 'General Campus Information Update')}
          className="px-4 py-2 text-xs font-bold text-white bg-[#D94A6E] hover:bg-[#BF3659] rounded-xl shrink-0 transition shadow-md shadow-[#D94A6E]/25"
        >
          Report Incorrect Information
        </button>
      </div>
    </div>
  );
};
