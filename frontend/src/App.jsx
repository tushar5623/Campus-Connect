import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast'; // <-- YE IMPORT KIYA
import Login from "./pages/Login";
import Chat from "./pages/Chat";

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1e293b', // Tailwind slate-800
            color: '#fff',
            border: '1px solid #334155', // Tailwind slate-700
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;