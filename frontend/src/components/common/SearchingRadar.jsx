import React from 'react';
import { LoaderCircle, X } from 'lucide-react';

export const SearchingRadar = ({ activeMode, onCancelSearch }) => {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center text-center py-8">
      
      {/* Concentric Radar Rings */}
      <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-indigo-400/30 dark:border-indigo-500/20 bg-indigo-500/5 animate-radar" />
        <div className="absolute inset-4 rounded-full border border-cyan-400/40 dark:border-cyan-500/30 animate-ping" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
          <LoaderCircle size={36} className="animate-spin" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm mb-4">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Searching for online campus mates
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
        Finding your next {activeMode === 'video' ? 'video partner' : 'conversation'}
      </h2>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        {activeMode === 'video'
          ? 'Connecting camera room with another verified student. Please ensure your microphone and camera permissions are allowed.'
          : 'Searching for an active verified student ready to chat.'}
      </p>

      <button
        onClick={onCancelSearch}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <X size={15} />
        Cancel Search
      </button>
    </div>
  );
};
