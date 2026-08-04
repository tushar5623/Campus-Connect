import React from 'react';
import { Video, AlertTriangle, RotateCcw, PhoneOff } from 'lucide-react';
import { RemoteVideoFeed } from './RemoteVideoFeed';
import { LocalVideoPIP } from './LocalVideoPIP';
import { VideoControls } from './VideoControls';

export const VideoChatRoom = ({
  webRTC,
  onOpenReportModal,
  onNext,
  onLeave,
}) => {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-4">
      {/* Toolbar Header */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Video size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Live Video Room</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">WebRTC Peer-to-peer call</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReportModal}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <AlertTriangle size={14} />
              Report
            </button>

            <button
              onClick={onNext}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 py-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <RotateCcw size={14} />
              Next
            </button>

            <button
              onClick={onLeave}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 py-1.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all"
            >
              <PhoneOff size={14} />
              Leave
            </button>
          </div>
        </div>
      </div>

      {webRTC.videoError && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/60 p-3 text-xs font-semibold text-amber-800 dark:text-amber-200">
          {webRTC.videoError}
        </div>
      )}

      {/* Video Grid */}
      <div className="grid flex-1 min-h-[360px] gap-4 lg:grid-cols-[1fr_280px]">
        <RemoteVideoFeed
          remoteVideoRef={webRTC.remoteVideoRef}
          isRemoteStreamReady={webRTC.isRemoteStreamReady}
          attachRemoteStream={webRTC.attachRemoteStream}
        />

        <div className="flex flex-col gap-4">
          <LocalVideoPIP
            localVideoRef={webRTC.localVideoRef}
            isCameraOn={webRTC.isCameraOn}
            attachLocalStream={webRTC.attachLocalStream}
          />
          <VideoControls
            isMicOn={webRTC.isMicOn}
            isCameraOn={webRTC.isCameraOn}
            onToggleMic={webRTC.toggleMic}
            onToggleCamera={webRTC.toggleCamera}
          />
        </div>
      </div>
    </div>
  );
};
