import React, { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

export const RemoteVideoFeed = ({ remoteVideoRef, isRemoteStreamReady, attachRemoteStream }) => {
  useEffect(() => {
    attachRemoteStream?.();
  }, [attachRemoteStream]);

  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl flex items-center justify-center">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />
      {!isRemoteStreamReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-white p-4 text-center">
          <LoaderCircle className="mb-3 animate-spin text-cyan-400" size={32} />
          <p className="text-sm font-bold">Connecting video feed...</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">Establishing encrypted WebRTC connection.</p>
        </div>
      )}
      <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
        Stranger
      </div>
    </div>
  );
};
