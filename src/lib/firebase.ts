import { initializeApp, getApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getFirebaseConfig = (): FirebaseOptions => {
  if (typeof window !== 'undefined') {
    // Firebase configuration is expected to be injected into the window object.
    const config = (window as any).__firebase_config;
    if (config) {
      return config;
    }
  }
  // Return a dummy config if not found, to avoid crashing the app.
  // The app will have limited functionality without a valid config.
  return {
    apiKey: "dummy-key",
    authDomain: "dummy-project.firebaseapp.com",
    projectId: "dummy-project",
  };
};

let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;

try {
    app = !getApps().length ? initializeApp(getFirebaseConfig()) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) {
    console.error("Firebase initialization failed:", e);
    // @ts-ignore
    app = auth = db = null;
}


export { app, auth, db };
