import toast from 'react-hot-toast';
import { useEffect } from 'react'; // <-- YE ADD KIYA
import { useNavigate } from 'react-router-dom';
import { Link, ShieldCheck } from 'lucide-react';
import { auth, provider } from '../firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; // <-- onAuthStateChanged ADD KIYA

const Login = () => {
  const navigate = useNavigate();

  // 👇 NAYA BLOCK: Auto-Login Check (Radar) 👇
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email.endsWith('@kiet.edu')) {
        // Agar user pehle se logged in hai, toh name aur email save karke aage bhej do
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName); // Name bhi save kar rahe hain UI ke liye
        navigate('/chat');
      }
    });

    // Cleanup listener
    return () => unsubscribe();
  }, [navigate]);
  // 👆 --------------------------------------- 👆

 const handleLogin = async () => {
    try {
      // 🛑 NAYA FIX: Button dabte hi Google ko FORCE karo popup dikhane ke liye
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Ab popup open karo
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (userEmail.endsWith('@kiet.edu')) { // Ise apne college domain se replace karna mat bhoolna
        console.log("Access Granted:", result.user.displayName);
        
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('userName', result.user.displayName);
        
        navigate('/chat');
      } else {
        toast.error("Access Denied! Only valid college emails are allowed.");
        await signOut(auth); 
      }
    } catch (error) {
      console.error("Login Error:", error);
      if(error.code !== 'auth/popup-closed-by-user') {
        toast.error("Something went wrong. Please try again.");      }
    }
  };

  // ... (Baaki poora return wala UI code waise hi rahega)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4 font-sans">
      {/* Headlines & Taglines */}
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

      {/* Center Glassmorphism Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        <div className="mb-8 p-5 bg-slate-800/80 rounded-2xl shadow-inner border border-slate-700">
          <Link className="w-10 h-10 text-cyan-400 transform -rotate-45" />
        </div>
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-white font-bold text-[17px] transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600"
        >
          <ShieldCheck className="w-6 h-6 opacity-90" />
          Sign In with @kiet.edu
        </button>
      </div>
      <p className="mt-10 text-slate-500 text-sm tracking-wide">
        Only validated college emails allowed.
      </p>
    </div>
  );
};

export default Login;