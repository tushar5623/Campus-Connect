import toast from 'react-hot-toast';
import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Link, ShieldCheck, ArrowRight, LogOut, Sun, Moon } from 'lucide-react'; // NAYA: LogOut icon import kiya
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 


const Login = () => {
  const navigate = useNavigate();
  
  // States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRules, setShowRules] = useState(false); 
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

// 1. Auto-Login Check
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
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]); // <-- Notice: Ye 'theme' change hone par chalega

  // --- NAYA FUNCTION: Button click pe theme badalne ke liye ---
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  

  // 2. Manual Google Login
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (userEmail.endsWith('@gmail.com')) { 
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userName', result.user.displayName);
        setIsLoggedIn(true);
        setUserName(result.user.displayName.split(' ')[0]);
        setIsLoading(false); 
      } else {
        toast.error("Access Denied! Only valid college emails are allowed.");
        await signOut(auth);
        setIsLoading(false); 
      }
    } catch (error) {
      if(error.code !== 'auth/popup-closed-by-user') {
        toast.error("Something went wrong. Please try again.");
      }
      setIsLoading(false); 
    }
  };

  // 🚪 3. NAYA: Logout Function (Home Page ke liye)
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase se logout
      localStorage.removeItem('userEmail'); // Memory saaf
      localStorage.removeItem('userName');
      setIsLoggedIn(false); // UI wapas login button pe set
      setUserName('');
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Failed to sign out");
    }
  };

return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] bg-slate-50 dark:bg-slate-950 px-4 font-sans overflow-hidden transition-colors duration-500">
      
      {/* 🌓 THEME TOGGLE BUTTON */}
      <button 
        onClick={toggleTheme} 
        className="absolute top-4 right-4 md:top-6 md:right-8 z-50 p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-yellow-400 hover:scale-110 transition-transform shadow-md"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* ---------------- MAIN LOGIN SCREEN ---------------- */}
      <div className={`transition-all duration-500 w-full flex flex-col items-center ${showRules ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
        
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
            
            {/* FIX 1: Light mode mein Dark Slate (Almost Black) Gradient, Dark mode mein Neon Cyan/Blue */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-cyan-400 dark:to-blue-500 drop-shadow-sm transition-colors duration-500">
              CAMPUS CONNECT:
            </span>
            <br />
            
            {/* FIX 2: Light mode mein Deep Blue/Purple Gradient, Dark mode mein Neon Teal/Purple */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 dark:from-teal-300 dark:to-purple-400 drop-shadow-sm transition-colors duration-500">
              Meet Your Community
            </span>
            
          </h1>
          
          <p className="text-slate-800 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium md:font-light mt-4 transition-colors">
            A safe and friendly space for every student in our college. Instant connections.
          </p>
        </div>

        {/* 📦 THE MAIN CARD */}
        <div className="w-[90%] md:w-full max-w-md bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-300 dark:border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-xl dark:shadow-2xl flex flex-col items-center transition-colors duration-500">
          
          {isLoggedIn ? (
            // 🟢 LOGGED IN STATE
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="text-2xl font-bold text-slate-900 dark:text-white text-center transition-colors">
                Hi, <span className="text-cyan-700 dark:text-cyan-400">{userName}</span> 👋
              </div>
              {/* FIX 2: Stronger text color for card subtitle */}
              <p className="text-slate-700 dark:text-slate-400 text-sm text-center font-medium dark:font-normal transition-colors">
                Your college ID is verified. You are ready to join the campus chat.
              </p>
              
              <div className="w-full flex flex-col gap-3">
                <button 
                  onClick={() => setShowRules(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 text-white text-lg font-bold rounded-xl hover:scale-[1.02] transition-transform shadow-lg dark:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  Enter the Room <ArrowRight className="w-5 h-5" />
                </button>
                
                {/* FIX 3: Sign Out button colors adjusted for better contrast */}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-200 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300 text-sm font-bold dark:font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            // 🔵 LOGGED OUT STATE
            <>
              <div className="mb-8 p-5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shadow-inner border border-slate-300 dark:border-slate-700 transition-colors">
                <Link className="w-10 h-10 text-cyan-600 dark:text-cyan-400 transform -rotate-45 transition-colors" />
              </div>
              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-bold text-[17px] transition-all duration-300 transform ${
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
        
        {/* FIX 4: Footer text visibility */}
        {!isLoggedIn && (
          <p className="mt-10 text-slate-700 dark:text-slate-500 text-sm font-medium dark:font-normal tracking-wide transition-colors">
            Only validated college emails allowed.
          </p>
        )}
      </div>

      {/* ---------------- RULES POPUP (MODAL) ---------------- */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-colors duration-500">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 w-[95%] max-w-lg rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 relative transition-colors duration-500">
            
            <h2 className="text-xl md:text-2xl font-bold text-cyan-700 dark:text-cyan-400 mb-4 md:mb-6 flex items-center gap-2 transition-colors">
              <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
              Community Guidelines
            </h2>
            
            <div className="space-y-3 text-slate-800 dark:text-slate-300 text-xs md:text-sm mb-6 md:mb-8 font-medium dark:font-normal transition-colors">
              <div className="bg-pink-50 dark:bg-slate-800/50 p-3 md:p-4 rounded-xl border border-pink-300 dark:border-pink-500/20 transition-colors">
                <p className="font-bold text-pink-700 dark:text-pink-400 mb-1">🚨 The 3-Report Rule</p>
                <p>If you receive 3 verified reports from different users, your account will be permanently blocked. No exceptions.</p>
              </div>
              <ul className="list-disc list-inside space-y-1.5 md:space-y-2 px-1 md:px-2">
                <li>Strictly no abusive language, hate speech, or harassment. We maintain a zero-tolerance policy.</li>
                <li>Uphold the decorum and integrity of KIET.</li>
                <li>Do not share sensitive personal information (phone numbers, exact locations) in public chats.</li>
                <li>Any spamming or unauthorized promotions will result in an immediate ban.</li>
              </ul>
            </div>

            <div className="flex gap-3 md:gap-4">
              <button 
                onClick={() => setShowRules(false)}
                className="w-1/3 py-3 md:py-4 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700 text-sm md:text-base"
              >
                Back
              </button>
              <button 
                onClick={() => navigate('/chat')}
                className="w-2/3 py-3 md:py-4 bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 rounded-xl font-bold text-white hover:scale-[1.02] transition-transform shadow-md text-sm md:text-base"
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
