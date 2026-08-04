import React from 'react';
import { Send } from 'lucide-react';

export const MessageInput = ({ inputMessage, onTyping, onSendMessage }) => {
  return (
    <footer className="relative z-20 border-t border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-3 shadow-sm backdrop-blur-md transition-colors duration-300">
      <form onSubmit={onSendMessage} className="mx-auto flex max-w-4xl items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1.5">
        <input
          type="text"
          value={inputMessage}
          onChange={onTyping}
          placeholder="Type your message..."
          className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Send size={15} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </footer>
  );
};
