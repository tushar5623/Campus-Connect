import React from 'react';
import { ShieldCheck, AlertTriangle, Search, LogOut } from 'lucide-react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

export const TextChatRoom = ({
  messages,
  inputMessage,
  isStrangerTyping,
  onTyping,
  onSendMessage,
  onOpenReportModal,
  onNext,
  onLeave,
}) => {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col">
      {/* Sticky Room Toolbar */}
      <div className="sticky top-0 z-30 mb-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Connected with stranger</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Be respectful. 1-on-1 encrypted room.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <AlertTriangle size={14} />
              <span className="hidden sm:inline">Report</span>
            </button>

            <button
              onClick={onNext}
              className="inline-flex items-center gap-1 py-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Search size={14} />
              <span>Next</span>
            </button>

            <button
              onClick={onLeave}
              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <MessageList messages={messages} isStrangerTyping={isStrangerTyping} />

      {/* Message Input Footer */}
      <MessageInput
        inputMessage={inputMessage}
        onTyping={onTyping}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};
