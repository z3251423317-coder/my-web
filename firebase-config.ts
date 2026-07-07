import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCceyO1xnOhRvx_Sf2j3eNzPRXDGU_mVqw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "upheld-mountain-fk91c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "upheld-mountain-fk91c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "upheld-mountain-fk91c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1069226029636",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1069226029636:web:a2d7fefbe1d299ebbbc211"
};

const app = initializeApp(firebaseConfig);
const firestoreDatabaseId = "ai-studio-alphaqubitvisual-3e69a2ec-7863-4267-90fa-728f0abaa893";
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, firestoreDatabaseId);
