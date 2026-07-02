import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// In AI Studio, the config is provided in firebase-applet-config.json
// which we can import if we use a build tool that supports JSON imports,
// or we can hardcode the values from the file we just read.
// Using the values from firebase-applet-config.json:

const firebaseConfig = {
  projectId: "upheld-mountain-fk91c",
  appId: "1:1069226029636:web:a2d7fefbe1d299ebbbc211",
  apiKey: "AIzaSyCceyO1xnOhRvx_Sf2j3eNzPRXDGU_mVqw",
  authDomain: "upheld-mountain-fk91c.firebaseapp.com",
  storageBucket: "upheld-mountain-fk91c.firebasestorage.app",
  messagingSenderId: "1069226029636",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
