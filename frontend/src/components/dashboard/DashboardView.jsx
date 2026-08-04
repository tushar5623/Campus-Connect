import React from 'react';
import { Sparkles, AlertTriangle, MessageCircle, CheckCircle2, Video, ArrowLeft } from 'lucide-react';

export const DashboardView = ({
  videoError,
  onStartMatching,
  onStartVideoMatching,
  onNavigateWelcome,
}) => {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-6 pb-20 sm:pb-8">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
          <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span>Private 1-on-1 Campus Matching</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-2xl mx-auto leading-tight">
          Connect with verified students instantly.
        </h2>
        
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Choose text chat or start a peer-to-peer video call with another verified student from your institution.
        </p>
      </div>

      {/* Error Callout */}
      {videoError && (
        <div className="mb-6 mx-auto max-w-xl w-full p-4 rounded-2xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <span>{videoError}</span>
        </div>
      )}

      {/* Mode Selection Cards */}
      <div className="grid sm:grid-cols-2 gap-5 w-full max-w-2xl mx-auto">
        
        {/* Text Chat Card */}
        <div className="group relative flex flex-col justify-between p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Text Chat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Fast, anonymous text-based matching. Ideal for quiet study sessions and casual conversations.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 size={14} className="text-indigo-500" />
                Instant 1-on-1 text pairing
              </li>
              <li className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 size={14} className="text-indigo-500" />
                Typing indicators & instant send
              </li>
            </ul>
          </div>

          <button
            onClick={onStartMatching}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <MessageCircle size={16} />
            Start Text Chat
          </button>
        </div>

        {/* Video Chat Card */}
        <div className="group relative flex flex-col justify-between p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-black/20 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Video size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Video Call
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              High-quality WebRTC video and audio pairing. Perfect for face-to-face interaction and collaboration.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Peer-to-peer encrypted stream
              </li>
              <li className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Camera & Mic toggle controls
              </li>
            </ul>
          </div>

          <button
            onClick={onStartVideoMatching}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Video size={16} />
            Start Video Call
          </button>
        </div>

      </div>

      {/* Back Link */}
      <div className="text-center mt-8">
        <button
          onClick={onNavigateWelcome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Welcome Screen
        </button>
      </div>

    </div>
  );
};
