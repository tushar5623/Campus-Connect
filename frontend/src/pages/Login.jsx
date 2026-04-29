import toast from 'react-hot-toast';
import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Link, ShieldCheck, ArrowRight, LogOut } from 'lucide-react';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 
import Radar from '../Radar'; 
import BorderGlow from '../BorderGlow';
import ShinyText from '../ShinyText';

const Login = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRules, setShowRules] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith('@gmail.com')) {
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName); 
        setIsLoggedIn(true);
        setUserName(user.displayName.split(' ')[0]); 
      }
    });
    return () => unsubscribe();
  }, []); 

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (user.email.endsWith('@gmail.com')) {
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName);
        setIsLoggedIn(true);
        setUserName(user.displayName.split(' ')[0]);
        toast.success('Successfully verified KIET ID!');
      } else {
        await signOut(auth);
        toast.error('Only @gmail.com emails are allowed. Access Denied.', { duration: 4000 });
      }
    } catch (error) {
      console.error("Login Failed:", error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      setIsLoggedIn(false);
      setUserName('');
      toast.success('Logged out safely');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    /* Forced Dark Mode Background */
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 px-4 font-sans overflow-hidden">
      
      {/* 🟢 PERMANENT DARK RADAR */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Radar 
          speed={1.2} 
          scale={0.5} 
          ringCount={10} 
          spokeCount={10} 
          color="#d946ef" 
          backgroundColor="#020617" 
          enableMouseInteraction={true}
          mouseInfluence={0.05}
        />
      </div>

      {/* Toggle button removed as requested */}

      <div className={`relative z-10 transition-all duration-500 w-full flex flex-col items-center ${showRules ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
        
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
            <ShinyText 
              text="CAMPUS CONNECT:" 
              speed={3} 
              className="drop-shadow-sm" 
              color="#22d3ee" 
              shineColor="#ffffff" 
            />
            <br />
            <div className="mt-2 md:mt-3">
              <ShinyText 
                text="Meet Your Community" 
                speed={3} 
                delay={1}
                className="drop-shadow-sm text-3xl md:text-5xl" 
                color="#c084fc" 
                shineColor="#ffffff" 
              />
            </div>
          </h1>
          <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto font-medium mt-4 drop-shadow-md">
            A safe and friendly space for every student in our college. Instant connections.
          </p>
        </div>

        {/* 🟢 PERMANENT DARK BORDER GLOW */}
        <BorderGlow
          className="w-[90%] md:w-full max-w-md shadow-2xl"
          backgroundColor="#0f172a" 
          glowColor="192 100 50" 
          borderRadius={24}
          glowRadius={30}
          glowIntensity={1.2}
          coneSpread={30}
          colors={['#0ea5e9', '#8b5cf6', '#ec4899']}
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-[inherit] p-6 md:p-8 flex flex-col items-center w-full h-full">
            
            {isLoggedIn ? (
              <div className="flex flex-col items-center gap-6 w-full">
                <div className="text-2xl font-bold text-white text-center">
                  Hi, <span className="text-cyan-400">{userName}</span> 👋
                </div>
                <p className="text-slate-300 text-sm text-center font-normal">
                  Your college ID is verified. You are ready to join the campus chat.
                </p>
                
                <div className="w-full flex flex-col gap-3">
                  <button 
                    onClick={() => setShowRules(true)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    Enter the Room <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800/50 text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-800 border border-slate-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 p-5 bg-slate-800/80 rounded-2xl shadow-inner border border-slate-700">
                  <ShieldCheck className="w-10 h-10 text-cyan-400" />
                </div>
                <button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`relative overflow-hidden w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-bold text-[17px] transition-all duration-300 transform ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-[0_0_25px_rgba(236,72,153,0.4)]'
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
              </>
            )}
          </div>
        </BorderGlow>
        
        {!isLoggedIn && (
          <p className="mt-10 text-slate-500 text-sm font-normal tracking-wide">
            Only validated college emails allowed.
          </p>
        )}
      </div>

      {/* RULES POPUP */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-[95%] max-w-lg rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 relative">
            <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-4 md:mb-6 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
              Community Guidelines
            </h2>
            
            <div className="space-y-3 text-slate-300 text-xs md:text-sm mb-6 md:mb-8 font-normal">
              <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-pink-500/20">
                <p className="font-bold text-pink-400 mb-1">🚨 The 3-Report Rule</p>
                <p>If you receive 3 verified reports from different users, your account will be permanently blocked. No exceptions.</p>
              </div>
              <ul className="list-disc list-inside space-y-1.5 md:space-y-2 px-1 md:px-2">
                <li>Strictly no abusive language, hate speech, or harassment.</li>
                <li>Uphold the decorum and integrity of the institution.</li>
                <li>Do not share sensitive personal information in public chats.</li>
                <li>Any spamming will result in an immediate ban.</li>
              </ul>
            </div>

            <div className="flex gap-3 md:gap-4">
              <button 
                onClick={() => setShowRules(false)}
                className="w-1/3 py-3 md:py-4 bg-slate-800 rounded-xl font-bold text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700 text-sm md:text-base"
              >
                Back
              </button>
              <button 
                onClick={() => navigate('/chat')}
                className="w-2/3 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white hover:scale-[1.02] transition-transform shadow-md text-sm md:text-base"
              >
                I Agree, Enter Room
              </button>
            </div>
          </div>
        </div>
      )}      
    </div>
  );
};

export default Login;