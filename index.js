let conversation = [];

document.getElementById('start-chat-btn').addEventListener('click', () => {
    document.getElementById('start-chat-btn').style.display = 'none';
    document.getElementById('user-input-container').style.display = 'flex';
    document.getElementById('user-input').focus();
});

document.getElementById('send-btn').addEventListener('click', async () => {
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;

    appendMessage('user', userInput);
    document.getElementById('user-input').value = '';
    document.getElementById('user-input').style.height = 'auto';

    conversation.push({ role: 'user', content: userInput });
    await fetchAIResponse();
});

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
        <div>${message}</div>
        <small style="margin-left: 10px; color: #ccc;">${timestamp}</small>
    `;

    // Add avatar images
    if (sender === 'user') {
        messageElement.innerHTML = `<img src="https://img.icons8.com/ios-glyphs/90/ffffff/user.png" alt="User">${messageElement.innerHTML}`;
    } else {
        messageElement.innerHTML = `<img src="https://img.icons8.com/ios-glyphs/90/00a67e/bot.png" alt="Bot">${messageElement.innerHTML}`;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function fetchAIResponse() {
    try {
        const response = await fetch('https://api.tioo.eu.org/post/gpt-prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ messages: conversation })
        });
        const data = await response.json();
        
        const botMessage = data.result || 'No response received';
        conversation.push({ role: 'assistant', content: botMessage });
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
