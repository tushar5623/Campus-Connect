import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';

export const BannedView = ({ onFullLogout }) => {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-slate-900 text-white px-6 py-10 font-sans">
      <div className="w-full max-w-md bg-slate-800/90 border border-red-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          Account Suspended
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Your account has been permanently suspended due to multiple reports of policy violations from other verified students.
        </p>
        <button
          onClick={onFullLogout}
          className="w-full py-3.5 px-5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm transition-all"
        >
          <LogOut size={16} className="inline mr-2" />
          Sign Out & Return Home
        </button>
      </div>
    </div>
  );
};
