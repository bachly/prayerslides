import { initializeApp } from "firebase/app";

// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB-GAQ-B_cVEMA10dYbJZ-Lhlsk3Vr9C3M",
    authDomain: "prayer-slides-project.firebaseapp.com",
    projectId: "prayer-slides-project",
    storageBucket: "prayer-slides-project.appspot.com",
    messagingSenderId: "691345808768",
    appId: "1:691345808768:web:9b5051c203f6bcbd823565"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const auth = getAuth();
export const db = getFirestore(app);

// A function to create Auth UI Config
export const uiConfig = firebase => {
    return {
        signInFlow: 'popup',
        signInSuccessUrl: '/',
        tosUrl: '/terms-of-service',
        privacyPolicyUrl: '/privacy-policy',
        signInOptions: [
            GoogleAuthProvider.PROVIDER_ID
        ]
    }
}

