import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// ==========================================
// 🔴 IMPORTANT: REPLACE THIS CONFIGURATION 🔴
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAjbvdkin6Wb28Smf64hAqcLlWpRANO3dI",
  authDomain: "zypher-549b2.firebaseapp.com",
  projectId: "zypher-549b2",
  storageBucket: "zypher-549b2.firebasestorage.app",
  messagingSenderId: "381454771415",
  appId: "1:381454771415:web:a4b6064046bfab730abc92",
  measurementId: "G-MN4EQ2EQDR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ==========================================
// AUTHENTICATION LOGIC
// ==========================================
window.fbLogin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Login Error:", error.message);
        throw error;
    }
};

window.fbSignup = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Signup Error:", error.message);
        throw error;
    }
};

window.fbLogout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error.message);
    }
};

window.fbResetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Password Reset Error:", error.message);
        throw error;
    }
};

const googleProvider = new GoogleAuthProvider();

window.fbGoogleSignIn = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error("Google Sign-In Error:", error.message);
        throw error;
    }
};

onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById('openLoginBtn');
    if (user) {
        if(loginBtn) loginBtn.textContent = 'LOGOUT';
        console.log("User is logged in:", user.email);
    } else {
        if(loginBtn) loginBtn.textContent = 'LOGIN';
        console.log("User is logged out");
    }
});

// ==========================================
// DATABASE & STORAGE LOGIC
// ==========================================
window.fbShareLink = async (assetName, driveLink) => {
    if (!auth.currentUser) {
        throw new Error("You must be logged in to share assets.");
    }
    
    try {
        const docRef = await addDoc(collection(db, "assets"), {
            title: assetName,
            info: "Google Drive Link",
            fileUrl: driveLink,
            uploaderId: auth.currentUser.uid,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch(e) {
        console.error("Share Error:", e);
        throw e;
    }
};

window.fbGetAssets = async () => {
    try {
        const q = query(collection(db, "assets"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const assets = [];
        querySnapshot.forEach((doc) => {
            assets.push({ id: doc.id, ...doc.data() });
        });
        return assets;
    } catch (error) {
        console.error("Error fetching assets:", error);
        return [];
    }
};

window.fbAddSupporter = async (name) => {
    try {
        await addDoc(collection(db, "supporters"), {
            name: name || "Anonymous",
            approved: false,
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding supporter:", error);
        throw error;
    }
};

window.fbGetSupporters = async () => {
    try {
        const q = query(collection(db, "supporters"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const supporters = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.approved === true) {
                supporters.push({ id: doc.id, ...data });
            }
        });
        return supporters;
    } catch (error) {
        console.error("Error fetching supporters:", error);
        return [];
    }
};
