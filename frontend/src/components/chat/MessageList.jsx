import React, { useEffect, useRef } from 'react';

export const MessageList = ({ messages, isStrangerTyping }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStrangerTyping]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-1 py-2">
      {messages.length === 0 && (
        <div className="mx-auto my-auto max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 text-center text-xs font-medium text-slate-500 shadow-sm">
          Connected to partner! Send a greeting to start chatting.
        </div>
      )}

      {messages.map((msg, index) => {
        if (msg.sender === 'system') {
          return (
            <div key={index} className="flex justify-center py-1">
              <span className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shadow-sm">
                {msg.text}
              </span>
            </div>
          );
        }

        return (
          <div key={index} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
              msg.sender === 'me'
                ? 'rounded-br-xs bg-indigo-600 text-white shadow-indigo-600/10'
                : 'rounded-bl-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
            }`}>
              {msg.text}
            </div>
          </div>
        );
      })}

      {isStrangerTyping && (
        <div className="flex justify-start py-1">
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Stranger is typing</span>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
