import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase configuration
// You'll need to replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Authentication functions
export const loginAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutAdmin = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Data version management
export const getDataVersion = async () => {
  try {
    const versionDoc = await getDoc(doc(db, 'metadata', 'version'));
    if (versionDoc.exists()) {
      return versionDoc.data();
    }
    return { version: 0, lastUpdated: null };
  } catch (error) {
    console.error('Error getting data version:', error);
    return { version: 0, lastUpdated: null };
  }
};

export const updateDataVersion = async () => {
  try {
    await setDoc(doc(db, 'metadata', 'version'), {
      version: Date.now(),
      lastUpdated: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating data version:', error);
    return false;
  }
};

// Couples data management
export const getCouplesFromFirebase = async () => {
  try {
    const couplesCollection = collection(db, 'couples');
    const snapshot = await getDocs(couplesCollection);
    const couples = [];
    
    snapshot.forEach((doc) => {
      couples.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return couples;
  } catch (error) {
    console.error('Error getting couples from Firebase:', error);
    return [];
  }
};

export const addCoupleToFirebase = async (coupleData) => {
  try {
    const docRef = await addDoc(collection(db, 'couples'), {
      ...coupleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await updateDataVersion();
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding couple:', error);
    return { success: false, error: error.message };
  }
};

export const updateCoupleInFirebase = async (coupleId, coupleData) => {
  try {
    await updateDoc(doc(db, 'couples', coupleId), {
      ...coupleData,
      updatedAt: serverTimestamp()
    });
    
    await updateDataVersion();
    return { success: true };
  } catch (error) {
    console.error('Error updating couple:', error);
    return { success: false, error: error.message };
  }
};

export const deleteCoupleFromFirebase = async (coupleId) => {
  try {
    await deleteDoc(doc(db, 'couples', coupleId));
    await updateDataVersion();
    return { success: true };
  } catch (error) {
    console.error('Error deleting couple:', error);
    return { success: false, error: error.message };
  }
};

// Image management
export const uploadImageToFirebase = async (file, fileName) => {
  try {
    const imageRef = ref(storage, `couples/${fileName}`);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { success: true, url: downloadURL };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
};

export const deleteImageFromFirebase = async (fileName) => {
  try {
    const imageRef = ref(storage, `couples/${fileName}`);
    await deleteObject(imageRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
};

// Local storage helpers
export const getLocalDataVersion = () => {
  if (typeof window !== 'undefined') {
    return parseInt(localStorage.getItem('dataVersion') || '0');
  }
  return 0;
};

export const setLocalDataVersion = (version) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dataVersion', version.toString());
  }
};

export const shouldUpdateData = async () => {
  const localVersion = getLocalDataVersion();
  const remoteVersion = await getDataVersion();
  return remoteVersion.version > localVersion;
};
