import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD5TM1O1F1T49UKMbUG0nI7k19FHk6Cvr0",
    authDomain: "mentor-app-238c6.firebaseapp.com",
    projectId: "mentor-app-238c6",
    storageBucket: "mentor-app-238c6.appspot.com", // Fixed the storageBucket URL
    messagingSenderId: "943754909900",
    appId: "1:943754909900:web:cef25346ffae73d2e20a69",
    measurementId: "G-8T3CMHE740"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
