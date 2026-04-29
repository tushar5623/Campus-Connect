import toast from 'react-hot-toast';
import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, LogOut, MessageSquare, Users, Zap } from 'lucide-react';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'; 

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Outfit:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Root ─────────────────────────────────────────── */
        .lp-root {
          min-height: 100dvh;
          font-family: 'Outfit', sans-serif;
          background: #f8f7f4;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem 3rem;
          position: relative;
          overflow: hidden;
        }

        /* Decorative blobs */
        .lp-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(72px);
          pointer-events: none;
          z-index: 0;
        }
        .lp-blob-1 {
          width: 520px; height: 520px;
          top: -160px; left: -180px;
          background: radial-gradient(circle, rgba(165,180,252,0.35) 0%, transparent 70%);
        }
        .lp-blob-2 {
          width: 400px; height: 400px;
          bottom: -120px; right: -140px;
          background: radial-gradient(circle, rgba(110,231,183,0.28) 0%, transparent 70%);
        }
        .lp-blob-3 {
          width: 260px; height: 260px;
          top: 55%; left: 60%;
          background: radial-gradient(circle, rgba(253,186,116,0.2) 0%, transparent 70%);
        }

        /* Subtle dot-grid texture */
        .lp-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, #c9c5bd 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.28;
          z-index: 0;
        }

        /* ── Page wrapper ─────────────────────────────────── */
        .lp-wrap {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.75rem;
          position: relative;
          z-index: 1;
          transition: opacity 0.3s, filter 0.3s;
        }
        .lp-wrap.blurred {
          opacity: 0.18;
          filter: blur(5px);
          pointer-events: none;
        }

        /* ── Top chip ─────────────────────────────────────── */
        .lp-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #e0ddd8;
          border-radius: 100px;
          padding: 5px 14px 5px 10px;
          font-size: 11.5px;
          font-weight: 600;
          color: #3d3a35;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .lp-chip-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.25);
          animation: lp-pulse 2s ease-in-out infinite;
        }
        @keyframes lp-pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
          50%       { box-shadow: 0 0 0 5px rgba(34,197,94,0.12); }
        }

        /* ── Hero heading ─────────────────────────────────── */
        .lp-hero {
          text-align: center;
        }

        .lp-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 10vw, 4.4rem);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.03em;
          color: #1a1714;
          margin-bottom: 0.15em;
          position: relative;
          display: inline-block;
        }

        /* ── Shimmer sweep on title ───────────────────────── */
        .lp-title-shimmer {
          position: relative;
          display: inline-block;
          color: #1a1714;
        }
        .lp-title-shimmer::after {
          content: 'Campus Connect';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255,255,255,0.0) 35%,
            rgba(255,255,255,0.88) 50%,
            rgba(255,255,255,0.0) 65%,
            transparent 80%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          /* NAYA FIX: linear lagaya taaki speed ekdum constant rahe */
          animation: lp-shimmer 6s linear infinite;
          pointer-events: none;
        }
        
        /* NAYA FIX: 60% wala pause hata kar seedha 0 se 100 kiya */
        @keyframes lp-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .lp-title-accent {
          font-style: italic;
          color: #4f46e5;
          position: relative;
        }
        /* Underline squiggle under "Connect" */
        .lp-title-accent::after {
          content: '';
          position: absolute;
          left: 0; bottom: -4px;
          width: 100%; height: 3px;
          background: linear-gradient(90deg, #4f46e5, #818cf8);
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: left;
          animation: lp-underline 0.6s 0.4s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes lp-underline {
          to { transform: scaleX(1); }
        }

        .lp-tagline {
          font-size: clamp(0.9rem, 2.8vw, 1.05rem);
          color: #7a7570;
          font-weight: 400;
          line-height: 1.65;
          max-width: 340px;
          margin: 1.1rem auto 0;
        }

        /* ── Stats strip ──────────────────────────────────── */
        .lp-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          width: 100%;
        }
        .lp-stat {
          background: #ffffff;
          border: 1px solid #eae8e3;
          border-radius: 18px;
          padding: 1rem 0.5rem 0.85rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .lp-stat:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.07);
        }
        .lp-stat-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 3px;
        }
        .lp-stat-icon.indigo { background: #eef2ff; color: #4338ca; }
        .lp-stat-icon.teal   { background: #f0fdf9; color: #0d9488; }
        .lp-stat-icon.amber  { background: #fffbeb; color: #b45309; }
        .lp-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1714;
          line-height: 1;
        }
        .lp-stat-label {
          font-size: 10.5px;
          font-weight: 500;
          color: #b0aa9e;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── Main card ────────────────────────────────────── */
        .lp-card {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e8e5df;
          border-radius: 28px;
          padding: 2.25rem 2rem;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.9) inset,
            0 2px 4px rgba(0,0,0,0.03),
            0 12px 36px rgba(0,0,0,0.07);
        }

        /* ── Signed-out state ─────────────────────────────── */
        .lp-signin {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          text-align: center;
        }

        .lp-icon-ring {
          width: 72px; height: 72px;
          border-radius: 22px;
          background: linear-gradient(145deg, #f5f3ff, #ede9fe);
          border: 1.5px solid #ddd6fe;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
          box-shadow: 0 4px 16px rgba(79,70,229,0.12);
        }

        .lp-signin-heading {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1a1714;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .lp-signin-sub {
          font-size: 0.875rem;
          color: #8a8278;
          line-height: 1.6;
        }

        .lp-sep {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ccc8c2;
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.06em;
        }
        .lp-sep::before, .lp-sep::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #ece9e3;
        }

        /* Google button */
        .lp-btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 20px;
          border-radius: 15px;
          border: 1.5px solid #e4e0da;
          background: #ffffff;
          color: #2d2a26;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s, box-shadow 0.18s, border-color 0.18s, transform 0.15s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05);
          letter-spacing: -0.01em;
        }
        .lp-btn-google:hover:not(:disabled) {
          background: #fafaf8;
          border-color: #c9c5be;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        .lp-btn-google:active:not(:disabled) { transform: translateY(0); }
        .lp-btn-google:disabled {
          background: #f3f2ef;
          color: #b8b4ae;
          border-color: #ece9e3;
          cursor: not-allowed;
          box-shadow: none;
        }
        .g-icon { width: 18px; height: 18px; flex-shrink: 0; }

        /* Enter button */
        .lp-btn-enter {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 15px 20px;
          border-radius: 15px;
          border: none;
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 16px rgba(79,70,229,0.32), 0 1px 3px rgba(79,70,229,0.2);
          letter-spacing: -0.01em;
          position: relative;
          overflow: hidden;
        }
        .lp-btn-enter::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
        }
        .lp-btn-enter:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(79,70,229,0.4), 0 2px 6px rgba(79,70,229,0.2);
        }
        .lp-btn-enter:active { transform: translateY(0); }

        /* Logout button */
        .lp-btn-logout {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 12px 20px;
          border-radius: 13px;
          border: 1px solid #eae8e3;
          background: #faf9f6;
          color: #8a8278;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .lp-btn-logout:hover { background: #f3f2ef; color: #3d3a35; }

        /* ── Welcome / logged-in state ────────────────────── */
        .lp-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          width: 100%;
          text-align: center;
        }
        .lp-avatar {
          width: 68px; height: 68px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c7d2fe, #a5b4fc);
          border: 3px solid #e0e7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #3730a3;
          box-shadow: 0 4px 14px rgba(99,102,241,0.2);
        }
        .lp-welcome-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1a1714;
          letter-spacing: -0.02em;
          margin-bottom: 3px;
        }
        .lp-welcome-name span { color: #4f46e5; }
        .lp-welcome-sub {
          font-size: 0.875rem;
          color: #8a8278;
          line-height: 1.55;
          margin-bottom: 6px;
        }
        .lp-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f0fdf4;
          color: #15803d;
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 13px;
          border-radius: 100px;
          border: 1px solid #bbf7d0;
        }
        .lp-action-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          margin-top: 4px;
        }

        /* ── Footer ───────────────────────────────────────── */
        .lp-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #b0aa9e;
          font-weight: 500;
        }
        .lp-footer svg { color: #22c55e; }

        /* ── Modal ────────────────────────────────────────── */
        .lp-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(20,18,16,0.48);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .lp-modal {
          background: #ffffff;
          border: 1px solid #e8e5df;
          border-radius: 26px;
          padding: 2rem 1.75rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.16);
          animation: lp-pop 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes lp-pop {
          from { opacity: 0; transform: scale(0.93) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .lp-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.55rem;
          font-weight: 700;
          color: #1a1714;
          margin-bottom: 1.1rem;
          letter-spacing: -0.02em;
        }
        .lp-alert {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 14px;
          padding: 1rem 1.1rem;
          margin-bottom: 1rem;
        }
        .lp-alert-title {
          font-size: 13px;
          font-weight: 700;
          color: #c2410c;
          margin-bottom: 4px;
        }
        .lp-alert-body {
          font-size: 13px;
          color: #9a3412;
          line-height: 1.55;
        }
        .lp-rules {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-bottom: 1.5rem;
        }
        .lp-rules li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: #57534e;
          line-height: 1.55;
        }
        .lp-rule-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #c9c5be;
          margin-top: 7px;
          flex-shrink: 0;
        }
        .lp-modal-actions { display: flex; gap: 10px; }
        .lp-btn-back {
          flex: 1;
          padding: 13px;
          border-radius: 13px;
          border: 1.5px solid #e4e0da;
          background: #faf9f6;
          color: #57534e;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .lp-btn-back:hover { background: #f3f2ef; }
        .lp-btn-agree {
          flex: 1;
          padding: 13px;
          border-radius: 13px;
          border: none;
          background: linear-gradient(135deg, #4f46e5, #3730a3);
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(79,70,229,0.3);
        }
        .lp-btn-agree:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(79,70,229,0.38);
        }

        /* ── Mobile tweaks ────────────────────────────────── */
        @media (max-width: 480px) {
          .lp-card { padding: 1.75rem 1.25rem; border-radius: 22px; }
          .lp-modal { padding: 1.5rem 1.25rem; border-radius: 20px; }
          .lp-stat { border-radius: 14px; padding: 0.85rem 0.4rem 0.75rem; }
          .lp-btn-google, .lp-btn-enter { font-size: 14px; padding: 13px 16px; }
        }
      `}</style>

      {/* Decorative blobs */}
    

      <div className="lp-root">
          <div className="lp-blob lp-blob-1" />
      <div className="lp-blob lp-blob-2" />
      <div className="lp-blob lp-blob-3" />
        <div className={`lp-wrap ${showRules ? 'blurred' : ''}`}>

          {/* Live chip */}
          <div className="lp-chip">
            <span className="lp-chip-dot" />
            Campus-wide · Text Chat
          </div>

          {/* Hero heading */}
          <div className="lp-hero">
            <h1 className="lp-title">
              <span className="lp-title-shimmer">
                Campus <span className="lp-title-accent">Connect</span>
              </span>
            </h1>
            <p className="lp-tagline">
              Meet someone new from your campus — verified, anonymous, and totally text-based.
            </p>
          </div>

          {/* Stats strip */}
          <div className="lp-stats">
            <div className="lp-stat">
              <div className="lp-stat-icon indigo"><MessageSquare size={15} /></div>
              <div className="lp-stat-value">Text</div>
              <div className="lp-stat-label">Only Chat</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-icon teal"><Users size={15} /></div>
              <div className="lp-stat-value">1-on-1</div>
              <div className="lp-stat-label">Matching</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-icon amber"><Zap size={15} /></div>
              <div className="lp-stat-value">Instant</div>
              <div className="lp-stat-label">Connect</div>
            </div>
          </div>

          {/* Main card */}
          <div className="lp-card">
            {isLoggedIn ? (
              <div className="lp-welcome">
                <div className="lp-avatar">
                  {userName ? userName[0].toUpperCase() : '?'}
                </div>
                <div>
                  <p className="lp-welcome-name">Welcome , <span>{userName}</span></p>
                  <p className="lp-welcome-sub">You're all set. Start a conversation and meet someone new.</p>
                  <div className="lp-verified-badge">
                    <ShieldCheck size={11} />
                    KIET ID Verified
                  </div>
                </div>
                <div className="lp-action-group">
                  <button onClick={() => setShowRules(true)} className="lp-btn-enter">
                    Enter the Room <ArrowRight size={17} />
                  </button>
                  <button onClick={handleLogout} className="lp-btn-logout">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="lp-signin">
                <div className="lp-icon-ring">
                  <ShieldCheck size={30} />
                </div>
                <div>
                  <p className="lp-signin-heading">Verify your identity</p>
                  <p className="lp-signin-sub">Sign in with your KIET Google account to access the platform.</p>
                </div>
                <div className="lp-sep">Secure sign-in</div>
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="lp-btn-google"
                >
                  {isLoading ? (
                    <span>Verifying ID…</span>
                  ) : (
                    <>
                      <svg className="g-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

          {/* Footer */}
          {!isLoggedIn && (
            <div className="lp-footer">
              <ShieldCheck size={13} />
              Protected by KIET verification
            </div>
          )}

        </div>

        {/* Community Guidelines Modal */}
        {showRules && (
          <div className="lp-overlay">
            <div className="lp-modal">
              <h2 className="lp-modal-title">Community Guidelines</h2>

              <div className="lp-alert">
                <p className="lp-alert-title">⚠ The 3-Report Rule</p>
                <p className="lp-alert-body">
                  Receiving 3 verified reports from different users results in a permanent block. No exceptions.
                </p>
              </div>

              <ul className="lp-rules">
                {[
                  'Strictly no abusive language, hate speech, or harassment.',
                  'Uphold the decorum and integrity of the institution.',
                  'Do not share sensitive personal information publicly.',
                  'Spamming will result in an immediate ban.',
                ].map((rule, i) => (
                  <li key={i}>
                    <span className="lp-rule-dot" />
                    {rule}
                  </li>
                ))}
              </ul>

              <div className="lp-modal-actions">
                <button onClick={() => setShowRules(false)} className="lp-btn-back">
                  Back
                </button>
                <button onClick={() => navigate('/chat')} className="lp-btn-agree">
                  I Agree, Enter →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
