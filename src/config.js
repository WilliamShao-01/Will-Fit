import { initializeApp } from "firebase/app";
import { initializeAuth, GoogleAuthProvider, browserLocalPersistence, browserPopupRedirectResolver } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCg759ipaxfp_tu9kkpIfm67cIN8s7TxGw",
  authDomain: "will-fit.firebaseapp.com",
  projectId: "will-fit",
  storageBucket: "will-fit.firebasestorage.app",
  messagingSenderId: "118493032",
  appId: "1:118493032:web:6459cd14214abef6c1d0dd",
  measurementId: "G-Q1TDXRXNQN"
};

const app = initializeApp(firebaseConfig);

// 必須在初始化時就指定 LocalStorage，否則跳轉回來時會找不到憑證
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver
});

export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Cloudinary config
export const CLOUDINARY_CLOUD_NAME = 'torbtpr4';
export const CLOUDINARY_UPLOAD_PRESET = 'WilliamShao';
