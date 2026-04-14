import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 👇 YAHAN APNA COPY KIYA HUA CONFIG PASTE KARNA 👇
const firebaseConfig = {
  apiKey: "AIzaSyCC_ENG6khQA4phzMATtEs5pNE6clmyswM",
  authDomain: "new-omegle-68065.firebaseapp.com",
  projectId: "new-omegle-68065",
  storageBucket: "new-omegle-68065.firebasestorage.app",
  messagingSenderId: "640908739685",
  appId: "1:640908739685:web:0f03914622e9578345728c",
  measurementId: "G-XDTPSBXP6Y"
};
// 👆 ------------------------------------------- 👆

// Firebase Initialize karo
const app = initializeApp(firebaseConfig);

// Authentication aur Google Provider export karo taaki app me use kar sakein
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();