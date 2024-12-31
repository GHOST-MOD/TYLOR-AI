const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCA0bpWeFyZjLK2p2GjhnTrFI9ONdbQGOo",
    authDomain: "tylor-ai.firebaseapp.com",
    projectId: "tylor-ai",
    storageBucket: "tylor-ai.firebasestorage.app",
    messagingSenderId: "321080155380",
    appId: "1:321080155380:web:fbd697da3fd8e9f1ea52a1",
    measurementId: "G-BG7JLWNE9Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Example function to create a new user
async function signUp(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up:', userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error('Error during sign up:', error.message);
    }
}

// Example function to sign in a user
async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in:', userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error('Error during sign in:', error.message);
    }
}

// Example function to load user messages
async function loadUserMessages(uid) {
    const messagesQuery = query(
        collection(db, 'messages'),
        where('uid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(10)
    );

    try {
        const querySnapshot = await getDocs(messagesQuery);
        querySnapshot.forEach((doc) => {
            const message = doc.data().message;
            const sender = doc.data().sender;
            console.log(`${sender}: ${message}`);
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Example function to save a message
async function saveMessage(uid, message, sender) {
    try {
        await addDoc(collection(db, 'messages'), {
            uid: uid,
            message: message,
            sender: sender,
            timestamp: serverTimestamp()
        });
        console.log('Message saved');
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

// Example usage
(async () => {
    const email = 'user@example.com';
    const password = 'superSecretPassword';
    
    const newUser = await signUp(email, password);
    if (newUser) {
        await saveMessage(newUser.uid, 'Hello, world!', 'user');
        await loadUserMessages(newUser.uid);
    }
})();
