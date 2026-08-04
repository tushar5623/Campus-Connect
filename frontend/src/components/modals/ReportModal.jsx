import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ReportModal = ({
  isOpen,
  selectedReason,
  onSelectReason,
  onSubmitReport,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        
        <div className="flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <AlertTriangle size={20} className="text-red-500" />
              Report User
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select a reason for reporting. You will automatically be paired with a new match.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2.5">
          {[
            "Inappropriate/Creepy Behavior",
            "Harassment or Bullying",
            "Spam or Scams",
            "Impersonation"
          ].map((reason) => (
            <label key={reason} className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
              selectedReason === reason
                ? 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            }`}>
              <input
                type="radio"
                name="reportReason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => onSelectReason(e.target.value)}
                className="accent-red-600"
              />
              <span className="text-xs font-semibold">{reason}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmitReport}
            className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all"
          >
            Submit Report
          </button>
        </div>

      </div>
    </div>
  );
};
