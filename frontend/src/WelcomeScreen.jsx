import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
        setTimeout(onFinished, 1500);
      }
    }, 120); 
    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#020617] z-[9999]"
    >
      <div className="absolute w-[400px] h-[400px] bg-fuchsia-600/10 blur-[150px] rounded-full"></div>
      
      <motion.h1 
  className="z-10 text-center px-4 text-4xl md:text-6xl font-black tracking-[0.25em] text-white"
  style={{ textShadow: '0 0 20px rgba(217, 70, 239, 0.5)' }}
>
        {text}
        <span className="animate-pulse border-r-4 border-fuchsia-500 ml-2"></span>
      </motion.h1>

      <div className="mt-10 w-72 h-[1px] bg-gray-800 relative overflow-hidden">
        <div className="absolute h-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent w-full animate-scan"></div>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;