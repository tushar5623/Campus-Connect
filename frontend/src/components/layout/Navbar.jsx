import React, { useContext } from 'react';
import { MessageCircle, Sun, Moon, LogOut } from 'lucide-react';
import { ThemeContext } from '../../ThemeContext';

export const Navbar = ({ onlineUsers, userName, appState, onFullLogout, onNavigateHome }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="relative z-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-4 py-3 shadow-sm backdrop-blur-md transition-colors duration-300 md:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        
        {/* Logo Mark & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <MessageCircle size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Campus Connect
            </h1>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              Verified Student Platform
            </span>
          </div>
        </div>

        {/* Right Header Items */}
        <div className="flex items-center gap-2.5">
          {/* Live Online Badge */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{onlineUsers} Online</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-600" />}
          </button>

          {/* User Greeting Pill */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              {userName ? userName[0].toUpperCase() : 'S'}
            </div>
            <span>{userName || 'Student'}</span>
          </div>

          {/* Sign Out Button */}
          {!['chatting', 'videoChatting'].includes(appState) && (
            <button
              onClick={onFullLogout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
