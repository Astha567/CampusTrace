import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { dataService } from '../services/dataService';
import { X, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ReportModal: React.FC = () => {
  const { reportModal, closeReportModal, showToast } = useApp();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!reportModal.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    await dataService.submitReport({
      targetType: reportModal.targetType,
      targetId: reportModal.targetId,
      targetName: reportModal.targetName || 'General Feedback',
      message: message.trim(),
      email: email.trim() || undefined,
    });

    setIsSubmitting(false);
    setSubmitted(true);
    showToast('Report submitted for CampusTrace admin verification');

    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      setEmail('');
      closeReportModal();
    }, 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D1F25]/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-[#FFF5D6] dark:bg-[#20181D] rounded-3xl max-w-md w-full border border-[#F2B4C0] dark:border-[#422C36] shadow-2xl p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F2B4C0]/60 dark:border-[#38202A]">
          <div className="flex items-center gap-2 text-[#D94A6E] dark:text-[#F2B4C0]">
            <ShieldAlert className="w-5 h-5" />
            <h3 id="report-modal-title" className="font-bold text-[#2D1F25] dark:text-[#FBEEBF] text-lg">
              Report Incorrect Detail
            </h3>
          </div>
          <button
            onClick={closeReportModal}
            className="p-1 text-[#8F7580] hover:text-[#2D1F25] dark:hover:text-[#FBEEBF] rounded-lg transition"
            aria-label="Close report modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#ECC0C2] dark:bg-[#3D1E28] text-[#8C203B] dark:text-[#F2B4C0] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-[#2D1F25] dark:text-[#FBEEBF] text-base">
              Thank You for Keeping CampusTrace Accurate
            </h4>
            <p className="text-xs text-[#7A616B] dark:text-[#BFA5AF] max-w-xs mx-auto">
              Your note has been queued for verification by the student affairs data team.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {reportModal.targetName && (
              <div className="bg-[#FBEEBF] dark:bg-[#2A1F26] p-3 rounded-2xl border border-[#F3D3C9] dark:border-[#422C36] text-xs space-y-1">
                <div className="text-[#8C521E] dark:text-[#F3D3C9] font-medium uppercase tracking-wider text-[10px]">
                  Target Item ({reportModal.targetType})
                </div>
                <div className="font-semibold text-[#2D1F25] dark:text-[#FBEEBF] text-sm">
                  {reportModal.targetName}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="report-message" className="block text-xs font-semibold text-[#5C454F] dark:text-[#E8D1DB] mb-1">
                What detail is incorrect or outdated? <span className="text-[#D94A6E]">*</span>
              </label>
              <textarea
                id="report-message"
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Room B-204 projector was replaced, or the hackathon deadline was extended."
                className="w-full text-sm rounded-2xl border border-[#F2B4C0] dark:border-[#4A2D39] bg-white dark:bg-[#1A1217] p-3 text-[#2D1F25] dark:text-[#FBEEBF] placeholder:text-[#A8929B] focus:outline-none focus:ring-2 focus:ring-[#D94A6E] transition"
              />
            </div>

            <div>
              <label htmlFor="report-email" className="block text-xs font-semibold text-[#5C454F] dark:text-[#E8D1DB] mb-1">
                Your Email (Optional, for verification follow-up)
              </label>
              <input
                id="report-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@offshore-univ.edu"
                className="w-full text-sm rounded-2xl border border-[#F2B4C0] dark:border-[#4A2D39] bg-white dark:bg-[#1A1217] px-3 py-2 text-[#2D1F25] dark:text-[#FBEEBF] placeholder:text-[#A8929B] focus:outline-none focus:ring-2 focus:ring-[#D94A6E] transition"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeReportModal}
                className="px-4 py-2 text-xs font-semibold text-[#7A616B] dark:text-[#BFA5AF] hover:bg-[#FBEEBF] dark:hover:bg-[#2A1F26] rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#D94A6E] hover:bg-[#BF3659] active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition shadow-md shadow-[#D94A6E]/20"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Correction'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
