const socket = io();

const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (messageInput.value) {
        const message = messageInput.value;
        socket.emit('chat message', message);
        addMessage('Vous', message);
        messageInput.value = '';
    }
});

socket.on('chat message', (msg) => {
    addMessage('Autre', msg);
});

function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${sender}: ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}