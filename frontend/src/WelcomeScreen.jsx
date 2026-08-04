import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const WelcomeScreen = ({ onFinished }) => {
  const [text, setText] = useState("");
  const fullText = "CAMPUS CONNECT";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) {
        clearInterval(interval);
        setTimeout(onFinished, 1200);
      }
    }, 100); 
    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#0F172A] text-slate-100 z-[9999] overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/15 blur-[160px] rounded-full pointer-events-none -top-20 -left-20"></div>
      <div className="absolute w-[450px] h-[450px] bg-cyan-500/15 blur-[160px] rounded-full pointer-events-none -bottom-20 -right-20"></div>

      {/* Campus Connect SaaS Badge */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-md shadow-glow-indigo"
      >
        <Sparkles size={14} className="text-cyan-400" />
        Verified Student Platform
      </motion.div>
      
      <motion.h1 
        className="z-10 text-center px-4 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-[0.2em] text-white"
      >
        {text}
        <span className="animate-pulse border-r-4 border-cyan-400 ml-2"></span>
      </motion.h1>

      <p className="mt-4 text-sm font-medium text-slate-400 tracking-wider">
        Connecting students 1-on-1 across campus
      </p>

      {/* Progress Scan Bar */}
      <div className="mt-10 w-72 h-[2px] bg-slate-800 rounded-full relative overflow-hidden">
        <div className="absolute h-full bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500 w-full animate-scan"></div>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;