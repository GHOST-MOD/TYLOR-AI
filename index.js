const sessions = {}; // Store all sessions here

function generateSessionId() {
    return '_' + Math.random().toString(36).substr(2, 9); // Simple session ID generator
}

document.getElementById('start-chat-btn').addEventListener('click', () => {
    const sessionId = generateSessionId();
    sessions[sessionId] = [];
    
    document.getElementById('start-chat-btn').style.display = 'none';
    document.getElementById('user-input-container').style.display = 'flex';
    document.getElementById('user-input').focus();
    
    // Store sessionId in a way you can access later, e.g., local storage
    localStorage.setItem('sessionId', sessionId);
});

document.getElementById('send-btn').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return alert("Session ID not found!");

    appendMessage('user', userInput);

    document.getElementById('user-input').value = '';
    document.getElementById('user-input').style.height = 'auto';

    sessions[sessionId].push({ role: 'user', content: userInput });
    await fetchAIResponse(sessionId);
});

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

async function fetchAIResponse(sessionId) {
    try {
        const response = await fetch('https://api.tioo.eu.org/post/gpt-prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ messages: sessions[sessionId] })
        });
        const data = await response.json();
        
        const botMessage = data.result || 'No response received';
        sessions[sessionId].push({ role: 'assistant', content: botMessage });
        appendMessage('bot', botMessage);
    } catch (error) {
        appendMessage('bot', 'Error: Unable to connect to the API');
        console.error('API Error:', error);
    }
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
