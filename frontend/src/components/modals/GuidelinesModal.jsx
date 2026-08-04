import React from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const GuidelinesModal = ({ isOpen, onClose, onAgree }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Community Guidelines
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Warning Callout Box */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex gap-3">
          <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-100">The 3-Report Rule</p>
            <p className="leading-relaxed opacity-90">
              Receiving 3 verified reports from different users results in a permanent account block. Please remain respectful.
            </p>
          </div>
        </div>

        {/* Rules List */}
        <ul className="space-y-3">
          {[
            'Strictly no abusive language, hate speech, or harassment.',
            'Uphold the decorum and integrity of the institution.',
            'Do not share sensitive personal information publicly.',
            'Spamming will result in an immediate ban.',
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Back
          </button>
          <button
            onClick={onAgree}
            className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
          >
            I Agree, Enter →
          </button>
        </div>

      </div>
    </div>
  );
};
