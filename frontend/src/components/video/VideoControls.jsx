import React from 'react';
import { Mic, MicOff, Video, VideoOff, Lock } from 'lucide-react';

export const VideoControls = ({ isMicOn, isCameraOn, onToggleMic, onToggleCamera }) => {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col justify-between gap-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onToggleMic}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all ${
            isMicOn
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700'
              : 'bg-red-600 text-white'
          }`}
        >
          {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
          {isMicOn ? 'Mic On' : 'Muted'}
        </button>

        <button
          onClick={onToggleCamera}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all ${
            isCameraOn
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700'
              : 'bg-red-600 text-white'
          }`}
        >
          {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
          {isCameraOn ? 'Cam On' : 'Cam Off'}
        </button>
      </div>

      <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 p-3 text-[11px] text-indigo-900 dark:text-indigo-200">
        <Lock size={12} className="inline mr-1 text-indigo-500" />
        WebRTC direct peer-to-peer call enabled.
      </div>
    </div>
  );
};
