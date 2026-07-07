import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = {
  apiKey: "AIzaSyCceyO1xnOhRvx_Sf2j3eNzPRXDGU_mVqw",
  authDomain: "upheld-mountain-fk91c.firebaseapp.com",
  projectId: "upheld-mountain-fk91c",
  storageBucket: "upheld-mountain-fk91c.firebasestorage.app",
  messagingSenderId: "1069226029636",
  appId: "1:1069226029636:web:a2d7fefbe1d299ebbbc211"
};

const app = initializeApp(firebaseConfig);
const firestoreDatabaseId = "ai-studio-alphaqubitvisual-3e69a2ec-7863-4267-90fa-728f0abaa893";
const db = getFirestore(app, firestoreDatabaseId);

const userData = JSON.parse(fs.readFileSync('./user_data.json', 'utf8'));

async function upload() {
  try {
    await setDoc(doc(db, 'app_config', 'master'), {
      screens: userData.screens,
      pillNavItems: userData.pillNavItems,
      marqueeCards: userData.marqueeCards || [],
      sphereCards: userData.sphereCards || [],
      domeCards: userData.domeCards || [],
      trialCards: userData.trialCards || [],
      relationshipCards: userData.relationshipCards || [],
      updatedAt: new Date().toISOString()
    });
    console.log("Successfully uploaded to Firestore!");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

upload();
