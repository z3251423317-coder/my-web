import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const app = initializeApp({
  credential: applicationDefault(),
  projectId: "upheld-mountain-fk91c"
});

const firestoreDatabaseId = "ai-studio-alphaqubitvisual-3e69a2ec-7863-4267-90fa-728f0abaa893";
const db = getFirestore(app, firestoreDatabaseId);

const userData = JSON.parse(fs.readFileSync('./user_data.json', 'utf8'));

async function upload() {
  try {
    await db.collection('app_config').doc('master').set({
      screens: userData.screens,
      pillNavItems: userData.pillNavItems,
      marqueeCards: userData.marqueeCards,
      sphereCards: userData.sphereCards,
      domeCards: userData.domeCards,
      trialCards: userData.trialCards,
      relationshipCards: userData.relationshipCards,
      updatedAt: new Date().toISOString()
    });
    console.log("Successfully uploaded to Firestore via Admin SDK!");
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
}

upload();
