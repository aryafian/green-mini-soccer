// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrlg5ewCFfJXNljmArVMiw6X2BH-iItyg",
  authDomain: "green-mini-soccer.firebaseapp.com",
  projectId: "green-mini-soccer",
  storageBucket: "green-mini-soccer.firebasestorage.app",
  messagingSenderId: "521115529368",
  appId: "1:521115529368:web:400b630831e4d71b2ce0ed",
  measurementId: "G-W29Y91KN8N"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
