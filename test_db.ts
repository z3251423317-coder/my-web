import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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

async function run() {
  const d = await getDoc(doc(db, 'app_config', 'master'));
  console.log(d.exists() ? "Exists" : "Does not exist");
  process.exit(0);
}
run();
