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
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.getElementById('sign-up-btn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    loader.style.display = 'block';
    errorMessage.textContent = '';

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User signed up:', userCredential.user);
            loader.style.display = 'none';
            document.getElementById('auth-container').style.display = 'none';
            document.querySelector('.chat-container').style.display = 'flex';
        })
        .catch((error) => {
            loader.style.display = 'none';
            errorMessage.textContent = error.message;
        });
});

document.getElementById('sign-in-btn').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    loader.style.display = 'block';
    errorMessage.textContent = '';

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User signed in:', userCredential.user);
            loader.style.display = 'none';
            document.getElementById('auth-container').style.display = 'none';
            document.querySelector('.chat-container').style.display = 'flex';
            loadUserMessages(userCredential.user.uid);
        })
        .catch((error) => {
            loader.style.display = 'none';
            errorMessage.textContent = error.message;
        });
});

function loadUserMessages(uid) {
    db.collection('messages').where('uid', '==', uid).orderBy('timestamp', 'desc').limit(10).get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const message = doc.data().message;
                const sender = doc.data().sender;
                appendMessage(sender, message);
            });
        })
        .catch((error) => {
            console.error('Error fetching messages:', error);
        });
}

async function fetchAIResponse(sessionId, userId) {
    try {
        const response = await fetch('https://api.tioo.eu.org/post/gpt-prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ messages: sessions[sessionId].slice(-10) })
        });
        const data = await response.json();
        
        const botMessage = data.result || 'No response received';
        sessions[sessionId].push({ role: 'assistant', content: botMessage });
        appendMessage('bot', botMessage);
        saveMessage(userId, botMessage, 'assistant');
    } catch (error) {
        appendMessage('bot', 'Error: Unable to connect to the API');
        console.error('API Error:', error);
    }
}

function saveMessage(uid, message, sender) {
    db.collection('messages').add({
        uid: uid,
        message: message,
        sender: sender,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('Message saved');
    })
    .catch((error) => {
        console.error('Error saving message:', error);
    });
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Add avatar, message, and timestamp
    let messageContent = `
        <div>${message}</div>
        <small style="margin-left: 10px; color: #ccc;">${timestamp}</small>
    `;

    let messageContent1 = `
        <small style="margin-left: 10px; color: #ccc;">${timestamp}</small>
        <div>${message}</div>
    `;

    // Format with avatar
    if (sender === 'user') {
        messageElement.innerHTML = `<img src="https://img.icons8.com/ios-glyphs/90/ffffff/user.png" alt="User">  ${messageContent1}`;
    } else {
        messageElement.innerHTML = `<img src="https://img.icons8.com/ios-glyphs/90/00a67e/bot.png" alt="Bot">${messageContent}`;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('user-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('send-btn').click();
    } else {
        autoResizeInput(this);
    }
});

function autoResizeInput(element) {
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}
