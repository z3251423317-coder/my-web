import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import cors from "cors";

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


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Proxy for PDF to bypass CORS
  app.get("/api/proxy-pdf", async (req, res) => {
    const pdfUrl = req.query.url as string;
    if (!pdfUrl) {
      return res.status(400).send("Missing url parameter");
    }

    let finalUrl = pdfUrl;
    try {
      finalUrl = encodeURI(decodeURI(pdfUrl));
    } catch (e) {
      console.warn("[Proxy] URI decode/encode failed, keeping original:", e);
    }

    // Auto-correct missing "构石文档/" folder in Tencent COS urls
    if (
      finalUrl.includes("wangzhan-1379786748.cos") && 
      !finalUrl.includes("构石文档") && 
      !finalUrl.includes("%E6%9E%84%E7%9F%B3%E6%96%87%E6%A1%A3") && 
      !finalUrl.includes("%e6%9e%84%e7%9f%b3%e6%96%87%e6%a1%a3")
    ) {
      const domainIndex = finalUrl.indexOf("myqcloud.com/");
      if (domainIndex !== -1) {
        const insertPos = domainIndex + "myqcloud.com/".length;
        finalUrl = finalUrl.slice(0, insertPos) + "%E6%9E%84%E7%9F%B3%E6%96%87%E6%A1%A3/" + finalUrl.slice(insertPos);
        console.log(`[Proxy] Auto-corrected missing subfolder path: ${finalUrl}`);
      }
    }

    console.log(`[Proxy] Attempting to fetch: ${finalUrl}`);

    try {
      const response = await axios.get(finalUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      console.log(`[Proxy] Success: ${finalUrl} (Size: ${response.data.byteLength})`);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(response.data);
    } catch (error: any) {
      console.error(`[Proxy] Error fetching ${finalUrl}:`, error.message);
      if (error.response) {
        console.error(`[Proxy] Status: ${error.response.status}`);
      }
      res.status(500).send(`Error fetching PDF: ${error.message}`);
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  
  app.get("/api/config", async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
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


  

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
