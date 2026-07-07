const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const importLines = `
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCceyO1xnOhRvx_Sf2j3eNzPRXDGU_mVqw",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "upheld-mountain-fk91c.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "upheld-mountain-fk91c",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "upheld-mountain-fk91c.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1069226029636",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:1069226029636:web:a2d7fefbe1d299ebbbc211"
};
const fbApp = initializeApp(firebaseConfig);
const firestoreDatabaseId = "ai-studio-alphaqubitvisual-3e69a2ec-7863-4267-90fa-728f0abaa893";
const db = getFirestore(fbApp, firestoreDatabaseId);
`;

server = server.replace(/import cors from "cors";/, 'import cors from "cors";\n' + importLines);

const newApiConfig = `
  app.get("/api/config", async (req, res) => {
    try {
      const docSnap = await getDoc(doc(db, "app_config", "master"));
      if (docSnap.exists()) {
        res.json(docSnap.data());
      } else {
        res.status(404).json({ error: "Config not found in database" });
      }
    } catch (error: any) {
      console.error("Error reading config from Firebase:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/config", async (req, res) => {
    try {
      const data = req.body;
      data.updatedAt = new Date().toISOString();
      await setDoc(doc(db, "app_config", "master"), data);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error writing config to Firebase:", error);
      res.status(500).json({ error: error.message });
    }
  });
`;

server = server.replace(
  /const fs = await import\("fs"\);[\s\S]*?\} catch \(error: any\) \{\s*res\.status\(500\)\.json\(\{ error: error\.message \}\);\s*\}\s*\}\);/,
  newApiConfig
);

fs.writeFileSync('server.ts', server);
console.log("Patched server.ts with Firebase backend");
