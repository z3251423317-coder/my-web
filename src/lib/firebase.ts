import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, onSnapshot, query, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "upheld-mountain-fk91c",
  appId: "1:1069226029636:web:a2d7fefbe1d299ebbbc211",
  apiKey: "AIzaSyCceyO1xnOhRvx_Sf2j3eNzPRXDGU_mVqw",
  authDomain: "upheld-mountain-fk91c.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-alphaqubitvisual-3e69a2ec-7863-4267-90fa-728f0abaa893",
  storageBucket: "upheld-mountain-fk91c.firebasestorage.app",
  messagingSenderId: "1069226029636"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper to save screen data to Firestore
export const saveScreensToFirebase = async (screens: any[]) => {
  try {
    const screensRef = doc(db, 'screens', 'current');
    await setDoc(screensRef, {
      data: screens,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    throw error;
  }
};

// Helper to save sheet config to Firebase
export const saveSheetConfigToFirebase = async (spreadsheetId: string, range: string) => {
  try {
    const configRef = doc(db, 'settings', 'sheets');
    await setDoc(configRef, {
      spreadsheetId,
      range,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error saving config to Firebase:', error);
    throw error;
  }
};

// Helper to get screen data from Firebase
export const getScreensFromFirebase = async () => {
  try {
    const screensRef = doc(db, 'screens', 'current');
    const docSnap = await getDoc(screensRef);
    if (docSnap.exists()) {
      return docSnap.data().data;
    }
    return null;
  } catch (error) {
    console.error('Error getting screens from Firebase:', error);
    return null;
  }
};

// Helper to get sheet config from Firebase
export const getSheetConfigFromFirebase = async () => {
  try {
    const configRef = doc(db, 'settings', 'sheets');
    const docSnap = await getDoc(configRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting sheet config from Firebase:', error);
    return null;
  }
};
