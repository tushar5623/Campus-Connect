import toast from 'react-hot-toast';
import { auth } from '../firebase'; 
import { signOut } from 'firebase/auth';
import { Send, LogOut, AlertTriangle, Search, UserCheck, SkipForward } from 'lucide-react';
// import { Send, LogOut, AlertTriangle, Search, UserCheck } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import socket from '../socket'; 

const Chat = () => {
  const [appState, setAppState] = useState('idle'); 
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [inputMessage, setInputMessage] = useState(''); 
  const messagesEndRef = useRef(null); 
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [isBanned, setIsBanned] = useState(false); // 🛑 NAYA STATE
  const [isStrangerTyping, setIsStrangerTyping] = useState(false); // Naya State
  const typingTimeoutRef = useRef(null); // Timeout track karne ke liye
  const [onlineUsers, setOnlineUsers] = useState(1); // Default 1 (Tum khud)
  const [userName, setUserName] = useState(''); // Naya state

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {

    const myEmail = localStorage.getItem('userEmail');
    const myName = localStorage.getItem('userName'); // <-- Name nikalo
    if (!myEmail) {
      window.location.href = '/'; // Agar bina login aaya toh bahar fenk do
      return;
    }
    if (myName) {
      setUserName(myName.split(' ')[0]); // Sirf First Name dikhayenge (e.g., "Tushar")
    }
    // 1. BULLETPROOF REGISTRATION
    const registerMe = () => {
      socket.emit('register_user', myEmail);
    };

    if (socket.connected) {
      registerMe();
    }
    socket.on('connect', registerMe);

    // 2. LIVE COUNT LISTENER
    socket.on('live_user_count', (count) => {
      console.log("🟢 Live count updated:", count); // F12 console me dekhne ke liye
      setOnlineUsers(count);
    });

    if (socket.connected) {
      socket.emit('register_user', myEmail);
    }
    // 🟢 LIVE USER COUNT LISTENER
    socket.on('online_users', (count) => {
      setOnlineUsers(count);
    });
    socket.on('connect', () => {
      console.log('Connected to backend with ID:', socket.id);
      socket.emit('register_user', myEmail);
    });

    socket.on('waiting', (msg) => {
      setAppState('searching');
    });

    socket.on('matched', (data) => {
      setRoomId(data.roomId);
      setAppState('chatting');
      setMessages([]); 
    });

    socket.on('receive_message', (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });
    socket.on('stranger_typing', () => setIsStrangerTyping(true));
    socket.on('stranger_stopped', () => setIsStrangerTyping(false));

    // 🚨 NAYA LISTENER: Jab partner chat chhod de
    socket.on('partner_left', (systemMessage) => {
      setMessages((prev) => [...prev, { text: systemMessage, sender: 'system' }]);
    });
    // 🚨 NAYA LISTENER: Agar backend ne ban message bheja
    socket.on('you_are_blocked', () => {
      setIsBanned(true); // User ko Banned screen dikhao
    });

    return () => {
      socket.off('connect');
      socket.off('waiting');
      socket.off('matched');
      socket.off('receive_message');
      socket.off('partner_left'); // Cleanup
      socket.off('you_are_blocked');
      socket.off('stranger_typing');
      socket.off('stranger_stopped');
    };
  }, []);

  const startMatching = () => {
    socket.emit('find_match');
  };
// ✍️ JAB USER TYPE KARE
  const handleTyping = (e) => {
    setInputMessage(e.target.value); // Input update karo

    if (roomId) {
      socket.emit('typing', roomId); // Backend ko batao main type kar raha hu

      // Agar 2 second tak kuch type nahi kiya, toh stop bhej do
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

  // 🏃‍♂️ NAYA FUNCTION: Chat se bahar nikalne ke liye
 const handleLeave = () => {
    if (roomId) {
      socket.emit('leave_chat', roomId); 
    }
    setAppState('idle'); 
    setRoomId(null);
    setMessages([]);
  };
  // 🚨 REPORT FUNCTION
  // 🚨 REPORT FUNCTION
  const handleReportSubmit = () => {
    if (!selectedReason) {
      // ❌ PURANA: alert("Please select a reason first!");
      // ✅ NAYA:
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
    
    // ❌ PURANA: alert("User reported successfully. Finding a new mate...");
    // ✅ NAYA: (Isme hum success wala hara (green) toast use karenge)
    toast.success("Report submitted. Finding a new mate...");
  };
  // ⏭️ NEXT FUNCTION: Purani chat chhod kar turant naya match dhundhna
  const handleNext = () => {
    if (roomId) {
      socket.emit('leave_chat', roomId); // Pehle purane partner ko bye bolo
    }
    setAppState('searching'); // Turant loader dikhao
    setRoomId(null);
    setMessages([]);
    socket.emit('find_match'); // Backend ko naya match dhundhne ka order do
  };
  // 🛑 CANCEL SEARCH FUNCTION
  const cancelSearch = () => {
    socket.emit('cancel_search'); // Backend se kaho ki line se nikal de
    setAppState('idle'); // Wapas Home screen pe bhej do
  };
  // 🚪 ASLI LOGOUT FUNCTION
// 🚪 ASLI LOGOUT FUNCTION
  const handleFullLogout = async () => {
    try {
      if (roomId) {
        socket.emit('leave_chat', roomId); 
      }
      
      // Pehle Firebase se bye-bye karo
      await signOut(auth); 
      
      // Fir Browser ki memory saaf karo
      localStorage.removeItem('userEmail'); 
      localStorage.removeItem('userName');
      
      // Thoda sa (100ms) delay dekar redirect karo taaki browser database clean kar sake
      setTimeout(() => {
        window.location.href = '/'; 
      }, 100);
      
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  // 🛑 AGAR USER BANNED HAI TOH YE SCREEN DIKHEGI
  if (isBanned) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4 text-center font-sans">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <AlertTriangle size={48} className="text-red-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          ACCOUNT <span className="text-red-500">BANNED</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto mb-8">
          Your account has been permanently suspended due to multiple reports of policy violations from other students.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
        >
          Go Back to Home
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      
     {/* Top Navigation Bar */}
      {/* Top Navigation Bar */}
     {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-sm z-10">
        <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Campus Connect
        </h1>
        
        <div className="flex items-center gap-3">
          {/* 🟢 CONDITION 1: AGAR CHAT CHAL RAHI HAI (Show Chat Controls) */}
          {appState === 'chatting' ? (
            <>
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-xl hover:bg-red-400/20 border border-red-500/20 transition-colors"
              >
                <AlertTriangle size={18} /> <span className="hidden md:inline">Report</span>
              </button>
              
              <button 
                onClick={handleNext}
                className="px-4 py-2 text-sm font-bold text-slate-900 bg-cyan-400 rounded-xl hover:bg-cyan-300 transition-colors"
              >
                Next
              </button>

              <button 
                onClick={handleLeave}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors"
              >
                Exit
              </button>
            </>
          ) : (
            /* 🔵 CONDITION 2: AGAR IDLE/SEARCHING HAI (Show Logout Controls) */
            <>
              <span className="hidden md:inline text-slate-300 font-medium mr-2">
                Welcome, <strong className="text-white">{userName}</strong>
              </span>
              <button 
                onClick={handleFullLogout} 
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 rounded-xl hover:bg-red-500/20 hover:text-red-400 border border-slate-700 transition-colors"
              >
                <LogOut size={18} /> <span className="hidden md:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
        
        {appState === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-lg border border-slate-700">
              <UserCheck size={48} className="text-cyan-400" />
            </div>
            {/* 👇 🟢 NAYA LIVE USER BADGE 👇 */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-full shadow-inner">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-emerald-400 tracking-wide">
                {onlineUsers} Student{onlineUsers !== 1 ? 's' : ''} Online Now
              </span>
            </div>
            {/* 👆 ---------------------- 👆 */}
            <h2 className="text-3xl font-bold mb-2">Ready to Mingle?</h2>
            <p className="text-slate-400 mb-8 max-w-md">Click the button below to connect with a random verified student from your campus.</p>
            <button onClick={startMatching} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-2xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              Find a Campus Mate
            </button>
          </div>
        )}

      {/* STATE 2: SEARCHING (Loader) */}
        {appState === 'searching' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Search size={48} className="text-cyan-400 animate-pulse mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Looking for a match...</h2>
            <p className="text-slate-400 mb-8">Please wait while we connect you to someone.</p>
            
            {/* 🛑 CANCEL BUTTON */}
            <button 
              onClick={cancelSearch}
              className="px-6 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-colors border border-slate-700 flex items-center gap-2"
            >
              <LogOut size={18} /> Cancel Search
            </button>
          </div>
        )}

        {appState === 'chatting' && (
          <div className="flex-1 space-y-4 flex flex-col">
             <div className="flex justify-center my-4">
                <span className="bg-cyan-900/40 text-cyan-300 text-xs px-4 py-1.5 rounded-full border border-cyan-800/50">
                  You are now connected with a stranger! Say Hi 👋
                </span>
             </div>
             
             <div className="flex-1 flex flex-col space-y-3">
               {messages.map((msg, index) => {
                 // 🚨 NAYA DESIGN: Agar system message hai (jaise disconnect)
                 if (msg.sender === 'system') {
                   return (
                     <div key={index} className="flex justify-center my-2">
                       <span className="bg-slate-800 text-slate-400 text-xs px-4 py-1 rounded-full border border-slate-700">
                         {msg.text}
                       </span>
                     </div>
                   );
                 }

                 // Normal messages (Me or Stranger)
                 return (
                   <div key={index} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`px-4 py-3 rounded-2xl max-w-[80%] md:max-w-md shadow-sm ${
                       msg.sender === 'me' 
                       ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-sm' 
                       : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50'
                     }`}>
                       {msg.text}
                     </div>
                   </div>
                 );
               })}
               {/* ✍️ TYPING INDICATOR BUBBLE */}
               {isStrangerTyping && (
                 <div className="flex justify-start my-2 animate-pulse">
                   <div className="px-4 py-3 bg-slate-800 text-slate-400 rounded-2xl rounded-tl-sm border border-slate-700/50 flex items-center gap-2 shadow-sm">
                     <span className="text-sm italic">Stranger is typing</span>
                     <span className="flex gap-1">
                       <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                       <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                       <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                     </span>
                   </div>
                 </div>
               )}
               <div ref={messagesEndRef} />
             </div>
          </div>
        )}

      </main>

      {appState === 'chatting' && (
        <footer className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={sendMessage} className="max-w-5xl mx-auto flex gap-2 md:gap-4">
            <input
              type="text"
              value={inputMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 px-4 md:px-6 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-slate-800"
            />
            <button 
              type="submit"
              className="p-3 md:px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl hover:opacity-90 flex items-center justify-center"
            >
              <Send size={20} className="md:mr-2" />
              <span className="hidden md:inline font-semibold">Send</span>
            </button>
          </form>
        </footer>
      )}
      {/* 🛑 REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="text-red-500" /> Report Stranger
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Why are you reporting this user? (They will be skipped automatically)
            </p>

            <div className="space-y-3 mb-6">
              {[
                "Inappropriate/Creepy Behavior",
                "Harassment or Bullying",
                "Spam or Scams",
                "Impersonation"
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors">
                  <input 
                    type="radio" 
                    name="reportReason" 
                    value={reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-red-500 bg-slate-900 border-slate-700 focus:ring-red-500 focus:ring-2"
                  />
                  <span className="text-slate-200">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReportSubmit}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]"
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