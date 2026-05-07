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
                background: '#1e293b', 
                color: '#fff',
                border: '1px solid #334155', 
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