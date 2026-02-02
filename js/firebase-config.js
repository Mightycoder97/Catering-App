// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Config provided by user
const firebaseConfig = {
    apiKey: "AIzaSyB8Q_FtcbZnL09yRMzHBZg-_56VR2xVaco",
    authDomain: "catering-app-9d21a.firebaseapp.com",
    projectId: "catering-app-9d21a",
    storageBucket: "catering-app-9d21a.firebasestorage.app",
    messagingSenderId: "933662738862",
    appId: "1:933662738862:web:bf59cdfccc35aa4f67203f",
    measurementId: "G-88N2TMDPV2"
};

let db;
let storage;
let app;

try {
    if (!firebaseConfig.apiKey) {
        console.warn("Firebase config is missing. App will run in mock mode or fail gracefully.");
        throw new Error("Missing Firebase Config");
    }
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully");
} catch (e) {
    console.error("Firebase initialization failed:", e);
}

// Helper to check if DB is ready
export const isDbReady = () => !!db;
export { db, storage, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, ref, uploadBytes, getDownloadURL };
