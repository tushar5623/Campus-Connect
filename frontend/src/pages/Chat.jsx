import toast from 'react-hot-toast';
import { auth } from '../firebase'; 
import { signOut } from 'firebase/auth';
import { Send, LogOut, AlertTriangle, Search, UserCheck, Sun, Moon,ArrowLeft } from 'lucide-react';
import { useEffect, useState, useRef, useContext } from 'react';
import socket from '../socket'; 
import { ThemeContext } from '../ThemeContext'; 
import { useNavigate } from 'react-router-dom'; // 🟢 YE LINE ADD KARO

const Chat = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [appState, setAppState] = useState('idle'); 
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [inputMessage, setInputMessage] = useState(''); 
  const messagesEndRef = useRef(null); 
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [isBanned, setIsBanned] = useState(false); 
  const [isStrangerTyping, setIsStrangerTyping] = useState(false); 
  const typingTimeoutRef = useRef(null); 
  const [onlineUsers, setOnlineUsers] = useState(1); 
  const [userName, setUserName] = useState(''); 
  const navigate = useNavigate(); 


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const myEmail = localStorage.getItem('userEmail');
    const myName = localStorage.getItem('userName');
    
    if (!myEmail) {
      window.location.href = '/';
      return;
    }
    if (myName) setUserName(myName.split(' ')[0]);

    const handleRegister = () => {
      console.log("🚀 Attempting to register with backend...");
      socket.emit('register_user', myEmail);
    };

    if (socket.connected) {
      handleRegister();
    }

    socket.on('connect', handleRegister);
    
    socket.on('live_user_count', (count) => {
      console.log("🟢 Live count updated:", count);
      setOnlineUsers(count);
    });

    socket.on('waiting', () => setAppState('searching'));
    
    socket.on('matched', (data) => {
      setRoomId(data.roomId);
      setAppState('chatting');
      setMessages([]); 
    });

    socket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));
    
    socket.on('stranger_typing', () => setIsStrangerTyping(true));
    socket.on('stranger_stopped', () => setIsStrangerTyping(false));
    
    socket.on('partner_left', (msg) => {
      setMessages(prev => [...prev, { text: msg, sender: 'system' }]);
    });

    socket.on('you_are_blocked', () => {
      console.log("🚨 BAN HAMMER RECEIVED!");
      setIsBanned(true);
    });

    return () => {
      socket.off('connect', handleRegister);
      socket.off('live_user_count');
      socket.off('waiting');
      socket.off('matched');
      socket.off('receive_message');
      socket.off('partner_left');
      socket.off('you_are_blocked');
      socket.off('stranger_typing');
      socket.off('stranger_stopped');
    };
  }, []); 

  const startMatching = () => {
    socket.emit('find_match');
  };

  const handleTyping = (e) => {
    setInputMessage(e.target.value); 

    if (roomId) {
      socket.emit('typing', roomId); 

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', roomId);
      }, 2000);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault(); 
    if (inputMessage.trim() === '') return; 

    const myMessage = { text: inputMessage, sender: 'me' };
    setMessages((prev) => [...prev, myMessage]);
    
    socket.emit('send_message', { roomId: roomId, message: inputMessage });
    setInputMessage('');
  };

  const handleLeave = () => {
    if (roomId) {
      socket.emit('leave_chat', roomId); 
    }
    setAppState('idle'); 
    setRoomId(null);
    setMessages([]);
  };

  const handleReportSubmit = () => {
    if (!selectedReason) {
      toast.error("Please select a reason first!");
      return;
    }

    socket.emit('report_user', { 
      roomId: roomId, 
      reason: selectedReason 
    });

    setIsReportModalOpen(false);
    setSelectedReason('');
    handleNext(); 
    
    toast.success("Report submitted. Finding a new mate...");
  };

  const handleNext = () => {
    if (roomId) {
      socket.emit('leave_chat', roomId); 
    }
    setAppState('searching'); 
    setRoomId(null);
    setMessages([]);
    socket.emit('find_match'); 
  };

  const cancelSearch = () => {
    socket.emit('cancel_search'); 
    setAppState('idle'); 
  };

  const handleFullLogout = async () => {
    try {
      if (roomId) {
        socket.emit('leave_chat', roomId); 
      }
      await signOut(auth); 
      localStorage.removeItem('userEmail'); 
      localStorage.removeItem('userName');
      
      setTimeout(() => {
        window.location.href = '/'; 
      }, 100);
      
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (isBanned) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-200 dark:border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)] dark:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-colors">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight transition-colors">
            ACCOUNT <span className="text-red-500">BANNED</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto mb-8 transition-colors">
            Your account has been permanently suspended due to multiple reports of policy violations from other students.
          </p>
          <button 
            onClick={handleFullLogout} 
            className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
          >
            Sign Out & Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    // FIX 1: Root container background colors for Light/Dark
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
      
      {/* Top Navigation Bar */}
     {/* Top Navigation Bar */}
      <header className="flex justify-between items-center px-4 md:px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-500 shadow-sm dark:shadow-none z-10">
        <h1 className="text-xl md:text-2xl font-bold text-cyan-600 dark:text-cyan-400">Campus Connect</h1>
        
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:scale-110 transition-transform"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <span className="hidden md:inline text-slate-600 dark:text-slate-300">
            Welcome, <strong className="text-slate-900 dark:text-white">{userName}</strong>
          </span>
          
          {/* 🟢 FIX 1: Logout button sirf tab dikhega jab user chat nahi kar raha ho */}
          {appState !== 'chatting' && (
            <button 
              onClick={handleFullLogout} 
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors text-sm md:text-base font-medium"
            >
              <LogOut size={18} /> <span className="hidden md:inline">Logout</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col pb-24 md:pb-4 transition-colors duration-500">
          
          {/* STATE 1: IDLE */}
          {appState === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-md border border-slate-200 dark:border-slate-700 transition-colors">
                <UserCheck size={48} className="text-cyan-600 dark:text-cyan-400 transition-colors" />
              </div>
              
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-slate-900/50 border border-emerald-200 dark:border-slate-700/50 rounded-full shadow-sm dark:shadow-inner transition-colors">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600 dark:bg-emerald-500"></span>
                </span>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide transition-colors">
                  {onlineUsers} Student{onlineUsers !== 1 ? 's' : ''} Online Now
                </span>
              </div>
              
              <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white transition-colors">Ready to Mingle?</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md transition-colors">Click the button below to connect with a random verified student from your campus.</p>
              
              <button onClick={startMatching} className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 text-white text-lg font-bold rounded-2xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.3)] dark:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                Find a Campus Mate
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="mt-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors font-medium"
              >
                <ArrowLeft size={18} /> Back to Home
              </button>
            </div>
          )}

          {/* STATE 2: SEARCHING */}
          {appState === 'searching' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Search size={48} className="text-cyan-600 dark:text-cyan-400 animate-pulse mb-6 transition-colors" />
              <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white transition-colors">Looking for a match...</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 transition-colors">Please wait while we connect you to someone.</p>
              
              <button 
                onClick={cancelSearch}
                className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors border border-slate-300 dark:border-slate-700 flex items-center gap-2 font-medium"
              >
                <LogOut size={18} /> Cancel Search
              </button>
            </div>
          )}

          {/* STATE 3: CHATTING */}
          {appState === 'chatting' && (
            <div className="flex-1 space-y-4 flex flex-col relative">
               
               {/* Fixed Header Options in Chat */}
               <div className="sticky top-0 z-10 flex justify-between items-center bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md py-2 border-b border-slate-200 dark:border-slate-800 mb-4 transition-colors">
                  <span className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 text-xs px-4 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-800/50 transition-colors font-medium">
                    Connected with a stranger 👋
                  </span>
                  <div className="flex gap-2">
                     <button onClick={() => setIsReportModalOpen(true)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors border border-red-200 dark:border-red-500/20 flex items-center gap-1">
                        <AlertTriangle size={14}/> Report
                     </button>
                     <button onClick={handleNext} className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 dark:text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-300 dark:border-slate-700">
                        Next
                     </button>
                  </div>
               </div>
               
               <div className="flex-1 flex flex-col space-y-3">
                 {messages.map((msg, index) => {
                   if (msg.sender === 'system') {
                     return (
                       <div key={index} className="flex justify-center my-2">
                         <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-xs px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 transition-colors font-medium">
                           {msg.text}
                         </span>
                       </div>
                     );
                   }

                   return (
                     <div key={index} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`px-4 py-3 rounded-2xl max-w-[85%] md:max-w-md shadow-sm transition-colors ${
                         msg.sender === 'me' 
                         ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-sm' 
                         : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700/50'
                       }`}>
                         {msg.text}
                       </div>
                     </div>
                   );
                 })}
                 
                 {isStrangerTyping && (
                   <div className="flex justify-start my-2 animate-pulse">
                     <div className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700/50 flex items-center gap-2 shadow-sm transition-colors">
                       <span className="text-sm italic">Stranger is typing</span>
                       <span className="flex gap-1">
                         <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                         <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                         <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                       </span>
                     </div>
                   </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>
            </div>
          )}

      </main>

      {/* FIX 2: Footer / Input Box Colors */}
      {appState === 'chatting' && (
        <footer className="fixed bottom-0 left-0 right-0 p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe md:relative transition-colors duration-500 z-20">
          <form onSubmit={sendMessage} className="max-w-5xl mx-auto flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-500 px-4 md:px-6 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-slate-300 dark:border-slate-800 transition-colors"
            />
            <button 
              type="submit"
              className="p-3 md:px-6 bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 text-white rounded-2xl hover:opacity-90 flex items-center justify-center transition-colors shadow-md"
            >
              <Send size={20} className="md:mr-2" />
              <span className="hidden md:inline font-semibold">Send</span>
            </button>
          </form>
        </footer>
      )}

      {/* FIX 3: REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors duration-500">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl transition-colors duration-500">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 transition-colors">
              <AlertTriangle className="text-red-500" /> Report Stranger
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 transition-colors">
              Why are you reporting this user? (They will be skipped automatically)
            </p>

            <div className="space-y-3 mb-6">
              {[
                "Inappropriate/Creepy Behavior",
                "Harassment or Bullying",
                "Spam or Scams",
                "Impersonation"
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input 
                    type="radio" 
                    name="reportReason" 
                    value={reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-red-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-red-500 focus:ring-2"
                  />
                  <span className="text-slate-700 dark:text-slate-200 transition-colors font-medium">{reason}</span>
                </label>
              ))}
            </div>


            <div className="flex gap-3">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-transparent"
              >
                Cancel
              </button>
              <button 
                onClick={handleReportSubmit}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)] dark:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Chat;