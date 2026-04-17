import toast from 'react-hot-toast';
import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Link, ShieldCheck } from 'lucide-react';
import { auth, provider } from '../firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showRules, setShowRules] = useState(false); // Naya state popup ke liye

  // 1. Auto-Login Check (Radar)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith('@gmail.com')) {
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName); 
        // FIX: Yahan se navigate hataya, popup show kiya
        setShowRules(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Manual Google Login
  const handleLogin = async () => {
    setIsLoading(true); 
    
    try {
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (userEmail.endsWith('@gmail.com')) { 
        console.log("Access Granted:", result.user.displayName);
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userName', result.user.displayName);
        
        // FIX: Loading roko aur Popup show karo (navigate hata diya)
        setIsLoading(false); 
        setShowRules(true); 
      } else {
        toast.error("Access Denied! Only valid college emails are allowed.");
        await signOut(auth); 
        setIsLoading(false); 
      }
    } catch (error) {
      console.error("Login Error:", error);
      if(error.code !== 'auth/popup-closed-by-user') {
        toast.error("Something went wrong. Please try again.");      
      }
      setIsLoading(false); 
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4 font-sans overflow-hidden">
      
      {/* ---------------- MAIN LOGIN SCREEN ---------------- */}
      <div className={`transition-all duration-500 w-full flex flex-col items-center ${showRules ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-sm">
              CAMPUS CONNECT:
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-purple-400 drop-shadow-sm">
              Meet Your Community
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light mt-4">
            A safe and friendly space for every student in our college. Instant connections.
          </p>
        </div>

        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          <div className="mb-8 p-5 bg-slate-800/80 rounded-2xl shadow-inner border border-slate-700">
            <Link className="w-10 h-10 text-cyan-400 transform -rotate-45" />
          </div>
          
          <button 
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-bold text-[17px] transition-all duration-300 transform ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 hover:shadow-[0_0_25px_rgba(236,72,153,0.4)]'
            } bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600`}
          >
            {isLoading ? (
              <span>Verifying Campus ID... ⏳</span>
            ) : (
              <>
                <ShieldCheck className="w-6 h-6 opacity-90" />
                Sign In with @gmail.com
              </>
            )}
          </button>
        </div>
        <p className="mt-10 text-slate-500 text-sm tracking-wide">
          Only validated college emails allowed.
        </p>
      </div>

      {/* ---------------- RULES POPUP (MODAL) ---------------- */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300 relative">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8" />
              Community Guidelines
            </h2>
            
            <div className="space-y-4 text-slate-300 text-sm md:text-base mb-8">
              {/* The 3-Report Rule Highlighted */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-pink-500/20">
                <p className="font-bold text-pink-400 mb-1">🚨 The 3-Report Rule</p>
                <p>If you receive 3 verified reports from different users, your account will be permanently blocked. No exceptions.</p>
              </div>
              
              {/* General Rules */}
              <ul className="list-disc list-inside space-y-2 px-2">
                <li>Strictly no abusive language, hate speech, or harassment. We maintain a zero-tolerance policy.</li>
                <li>Uphold the decorum and integrity of KIET.</li>
                <li>Do not share sensitive personal information (phone numbers, exact locations) in public chats.</li>
                <li>Any form of spamming, soliciting, or unauthorized promotions will result in an immediate ban.</li>
              </ul>
            </div>

            <button 
              onClick={() => navigate('/chat')} // SIRF YAHAN NAVIGATE HAI AB
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              I Agree, Enter Room
            </button>
          </div>
        </div >
      )}      
    </div>
  );
};

export default Login;