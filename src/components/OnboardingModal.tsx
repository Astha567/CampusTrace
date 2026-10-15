import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Calendar, Sparkles, ChevronRight, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, setShowOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  if (!showOnboarding) return null;

  const steps = [
    {
      title: 'Navigate Campus & Find Any Room',
      subtitle: '2D Floor Plans & Walking Guidance',
      description:
        'Search "Room B-204" or browse departments across all 6 campus blocks. Tap any floor to inspect classrooms, labs, makerspaces, and facilities with step-by-step walking routes.',
      icon: MapPin,
      badge: 'Interactive Campus Map',
      color: 'bg-[#D94A6E] text-white',
      accentBg: 'bg-[#ECC0C2] text-[#8C203B] dark:bg-[#3D1E28] dark:text-[#F2B4C0]',
    },
    {
      title: 'Stay Ahead of Deadlines & Events',
      subtitle: 'Verified Opportunities Hub',
      description:
        'Track hackathons, workshops, club auditions, and internship drives. Bookmark events, set 24h/1h reminders, and export directly to your Google Calendar or iCal.',
      icon: Calendar,
      badge: 'Deadlines & Calendar',
      color: 'bg-[#E08A38] text-white',
      accentBg: 'bg-[#F3D3C9] text-[#7A3A00] dark:bg-[#382618] dark:text-[#F3D3C9]',
    },
    {
      title: 'Ask the Grounded Campus Assistant',
      subtitle: 'Powered by Gemini with Zero Hallucination',
      description:
        'Ask questions in natural language like "Where is the library?" or "What workshops are open this week?". Answers are strictly verified against local campus records with direct map links.',
      icon: Sparkles,
      badge: 'AI Assistant',
      color: 'bg-[#2A9D8F] text-white',
      accentBg: 'bg-[#FBEEBF] text-[#2A7268] dark:bg-[#1E302D] dark:text-[#A7D7D0]',
    },
  ];

  const handleFinish = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F2B4C0', '#ECC0C2', '#FBEEBF', '#F3D3C9', '#D94A6E'],
      });
    } catch {}
    setShowOnboarding(false);
  };

  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D1F25]/65 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-[#FFF5D6] dark:bg-[#20181D] rounded-3xl max-w-lg w-full border border-[#F2B4C0] dark:border-[#422C36] shadow-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[440px]">
        {/* Top close */}
        <button
          onClick={() => setShowOnboarding(false)}
          className="absolute top-4 right-4 p-2 text-[#8F7580] hover:text-[#2D1F25] dark:hover:text-[#FBEEBF] rounded-full transition"
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator pills */}
        <div className="flex items-center gap-1.5 mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-[#D94A6E] dark:bg-[#F2B4C0]'
                  : 'w-2 bg-[#ECC0C2] dark:bg-[#3D1E28]'
              }`}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-4 my-auto">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${step.accentBg}`}
            >
              <StepIcon className="w-3.5 h-3.5" />
              {step.badge}
            </span>
          </div>

          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 transform scale-105 ${step.color}`}>
            <StepIcon className="w-8 h-8" />
          </div>

          <div>
            <h2 id="onboarding-title" className="text-xl sm:text-2xl font-extrabold text-[#2D1F25] dark:text-[#FBEEBF]">
              {step.title}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-[#D94A6E] dark:text-[#F2B4C0] mt-1">
              {step.subtitle}
            </p>
          </div>

          <p className="text-[#5C454F] dark:text-[#D9C4CC] text-sm leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Bottom controls */}
        <div className="pt-6 border-t border-[#F2B4C0]/60 dark:border-[#38202A] flex items-center justify-between gap-3 mt-6">
          <button
            onClick={() => setShowOnboarding(false)}
            className="text-xs font-semibold text-[#8F7580] hover:text-[#2D1F25] dark:hover:text-[#FBEEBF] transition px-2 py-1"
          >
            Skip Intro
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-4 py-2 text-xs font-bold text-[#5C454F] dark:text-[#FBEEBF] bg-[#FBEEBF] dark:bg-[#2A1F26] hover:bg-[#F3D3C9] rounded-xl transition"
              >
                Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="inline-flex items-center gap-1 px-5 py-2.5 text-xs font-bold text-white bg-[#D94A6E] hover:bg-[#BF3659] active:scale-95 rounded-xl transition shadow-md shadow-[#D94A6E]/20"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-[#D94A6E] hover:bg-[#BF3659] active:scale-95 rounded-xl transition shadow-md shadow-[#D94A6E]/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                Explore CampusTrace
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
