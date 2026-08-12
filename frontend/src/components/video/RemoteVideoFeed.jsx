import React from 'react';
import { LoaderCircle } from 'lucide-react';

// Bug #2 Fix: Added `muted` to the remote video element.
//   iOS Safari and Chrome Android REFUSE to autoPlay any video that is not muted,
//   even when initiated by a user gesture. Without `muted`, the remote stream is
//   assigned to srcObject but .play() is rejected by the browser silently — the
//   video element stays black. Audio is carried independently through WebRTC tracks
//   and is NOT affected by the `muted` attribute on the DOM element.
//
// Bug #3 Fix: Same callback ref pattern as LocalVideoPIP — ensures attachRemoteStream
//   is called only after the DOM element is mounted, eliminating the race condition.
export const RemoteVideoFeed = ({ remoteVideoRef, isRemoteStreamReady, attachRemoteStream }) => {
  // Callback ref: fires when the <video> node is inserted into the DOM tree.
  const setVideoRef = (node) => {
    remoteVideoRef.current = node;
    if (node) {
      attachRemoteStream?.();
    }
  };

  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl flex items-center justify-center">
      <video
        ref={setVideoRef}
        autoPlay
        muted
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
