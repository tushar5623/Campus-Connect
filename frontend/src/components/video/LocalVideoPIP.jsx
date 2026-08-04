import React, { useEffect } from 'react';
import { VideoOff } from 'lucide-react';

export const LocalVideoPIP = ({ localVideoRef, isCameraOn, attachLocalStream }) => {
  useEffect(() => {
    attachLocalStream?.();
  }, [attachLocalStream]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-md">
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="aspect-video w-full object-cover"
      />
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400">
          <VideoOff size={28} />
        </div>
      )}
      <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
        You
      </div>
    </div>
  );
};
