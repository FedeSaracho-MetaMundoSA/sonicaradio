import { initializeApp } from "firebase/app";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "web-metamundo-sa",
  appId: "1:969907139354:web:219db0154efa2a8dc572a3",
  apiKey: "AIzaSyCOQ7VXdDISSwb0F_kBx4iDjAHGkDWaRU4",
  authDomain: "web-metamundo-sa.firebaseapp.com",
  storageBucket: "web-metamundo-sa.firebasestorage.app",
  messagingSenderId: "969907139354",
};

export const app = initializeApp(firebaseConfig);

const databaseId = "ai-studio-sonicaradiowebof-c3c5f78a-160a-4f09-93e2-d62ba72bb651";

let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, databaseId);
} catch {
  dbInstance = getFirestore(app, databaseId);
}

export const db = dbInstance;
export const auth = getAuth(app);

