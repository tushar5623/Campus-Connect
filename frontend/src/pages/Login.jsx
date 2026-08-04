import toast from 'react-hot-toast';
import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, LogOut, MessageSquare, Users, Zap } from 'lucide-react';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithCredential } from 'firebase/auth'; 
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { GuidelinesModal } from '../components/modals/GuidelinesModal';

const Login = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRules, setShowRules] = useState(false); 

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize();
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith('@gmail.com')) {
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName); 
        setIsLoggedIn(true);
        setUserName(user.displayName.split(' ')[0]); 
      } else {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        setUserName('');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      let user;

      if (Capacitor.isNativePlatform()) {
        const googleUser = await GoogleAuth.signIn();
        const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
        const result = await signInWithCredential(auth, credential);
        user = result.user;
      } else {
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      }
      
      if (user.email.endsWith('@gmail.com')) {
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName);
        setIsLoggedIn(true);
        setUserName(user.displayName.split(' ')[0]);
        toast.success('Successfully verified college ID!');
      } else {
        await signOut(auth);
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        setUserName('');
        toast.error('Only @gmail.com emails are allowed. Access Denied.', { duration: 4000 });
      }
    } catch (error) {
      console.error("Login Failed:", error);
      toast.error(`Error: ${error.message || JSON.stringify(error)}`, { duration: 6000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
      }
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
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-8 overflow-y-auto transition-colors duration-300 font-sans">
      
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[130px] dark:bg-indigo-600/15" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] dark:bg-cyan-600/15" />
      </div>

      {/* Main Container */}
      <div className={`relative z-10 w-full max-w-md my-auto flex flex-col items-center gap-6 transition-all duration-300 ${showRules ? 'blur-md pointer-events-none opacity-40' : ''}`}>
        
        {/* Campus Status Chip */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Campus-wide · 1-on-1 Matching
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Connect</span>
          </h1>
          <p className="text-sm sm:text-base font-normal text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Meet someone new from your college — verified, anonymous, and text or video based.
          </p>
        </div>

        {/* Features / Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm text-center">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-1">
              <MessageSquare size={16} />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Text & Video</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Modes</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm text-center">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1">
              <Users size={16} />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">1-on-1</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Matching</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-sm text-center">
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 mb-1">
              <Zap size={16} />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Instant</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Connect</span>
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
          {isLoggedIn ? (
            /* Authenticated User View */
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-indigo-500/20">
                {userName ? userName[0].toUpperCase() : '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{userName}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You are all set to join room and chat with fellow students.
                </p>
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                  <ShieldCheck size={13} />
                  College ID Verified
                </div>
              </div>

              <div className="w-full space-y-2.5 pt-2">
                <button
                  onClick={() => setShowRules(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  Enter the Room
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated View: Google Sign In */
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                <ShieldCheck size={28} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Verify your identity
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Sign in with your official college Google account to access the platform.
                </p>
              </div>

              <div className="w-full flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Secure Sign In
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying ID…
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        {!isLoggedIn && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <ShieldCheck size={14} className="text-emerald-500" />
            Protected by official college email verification
          </div>
        )}

      </div>

      {/* Community Guidelines Modal Component */}
      <GuidelinesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        onAgree={() => navigate('/chat')}
      />

    </div>
  );
};

export default Login;