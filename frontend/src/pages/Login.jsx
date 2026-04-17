import toast from 'react-hot-toast';
import { useEffect, useState } from 'react'; // Ek hi line mein import kar diya
import { useNavigate } from 'react-router-dom';
import { Link, ShieldCheck } from 'lucide-react';
import { auth, provider } from '../firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 

const Login = () => {
  const navigate = useNavigate();
  
  // NAYA: Loading state ab component ke ANDAR hai
  const [isLoading, setIsLoading] = useState(false);

  // Auto-Login Check (Radar)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith('@kiet.edu')) {
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName); 
        navigate('/chat');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    setIsLoading(true); // 1. Button dabte hi loading SHURU
    
    try {
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (userEmail.endsWith('@kiet.edu')) { 
        console.log("Access Granted:", result.user.displayName);
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userName', result.user.displayName);
        
        // Agar success hua toh page change ho jayega, toh loading rokne ki zaroorat nahi
        navigate('/chat');
      } else {
        toast.error("Access Denied! Only valid college emails are allowed.");
        await signOut(auth); 
        setIsLoading(false); // 2. Galat email par loading ROK do
      }
    } catch (error) {
      console.error("Login Error:", error);
      if(error.code !== 'auth/popup-closed-by-user') {
        toast.error("Something went wrong. Please try again.");      
      }
      setIsLoading(false); // 3. Error aane par ya popup close hone par loading ROK do
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4 font-sans">
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
        
        {/* NAYA BUTTON LOGIC */}
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
              Sign In with @kiet.edu
            </>
          )}
        </button>

      </div>
      <p className="mt-10 text-slate-500 text-sm tracking-wide">
        Only validated college emails allowed.
      </p>
    </div>
  );
};

export default Login;