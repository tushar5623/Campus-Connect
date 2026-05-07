import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCC_ENG6khQA4phzMATtEs5pNE6clmyswM",
  authDomain: "new-omegle-68065.firebaseapp.com",
  projectId: "new-omegle-68065",
  storageBucket: "new-omegle-68065.firebasestorage.app",
  messagingSenderId: "640908739685",
  appId: "1:640908739685:web:0f03914622e9578345728c",
  measurementId: "G-XDTPSBXP6Y"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();