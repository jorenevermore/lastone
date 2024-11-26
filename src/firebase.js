// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, GeoPoint } from 'firebase/firestore'; // Updated import for v9+ Firestore
import { getStorage } from 'firebase/storage';
import * as geofire from 'geofire-common'; // geofire-common import

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDJz7-i1wKxVYzAT8HOar_UYZw34dZpNSw",
  authDomain: "alot-83545.firebaseapp.com",
  projectId: "alot-83545",
  storageBucket: "alot-83545.appspot.com",
  messagingSenderId: "343816077312",
  appId: "1:343816077312:web:4d0ad356c862fe559658e5",
  measurementId: "G-H6R0SVK742"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
const db = getFirestore(app); // Use Firestore v9+

// Initialize Firebase Storage
const storage = getStorage(app);

// Export Firebase services and geofire
export { auth, googleProvider, db, storage, geofire, GeoPoint, collection, doc, setDoc };
