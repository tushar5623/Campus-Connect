import React, { useState } from 'react'; // <-- useState add kiya
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import WelcomeScreen from './WelcomeScreen'; 

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading ? (
        <WelcomeScreen onFinished={() => setIsLoading(false)} />
      ) : (
        <Router>
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.3)',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;