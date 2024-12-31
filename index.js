const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
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

// Create an Express application
const server = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse request bodies
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the root directory
server.use(express.static(path.join(__dirname)));

// Route to serve the HTML file
server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle sign-up
server.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        res.status(200).json({ message: 'User signed up', user: userCredential.user });
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.error('Error during sign up: Email already in use. Attempting to sign in.');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            res.status(200).json({ message: 'User signed in', user: userCredential.user });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Route to handle sign-in
server.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        res.status(200).json({ message: 'User signed in', user: userCredential.user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Start the Express server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
