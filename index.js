let conversation = [];

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
    messageElement.textContent = message;

    // Add avatar images
    if (sender === 'user') {
        messageElement.innerHTML = `<img src="https://img.icons8.com/ios-glyphs/90/ffffff/user.png" alt="User">${message}`;
    } else {
        messageElement.innerHTML = `<img src="https://img.icons8.com/ios-glyphs/90/00a67e/bot.png" alt="Bot">${message}`;
    }

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function fetchAIResponse() {
    try {
        const response = await fetch('https://btch.us.kg/post/v2/gpt-prompt', {
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
