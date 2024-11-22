const socket = io();

const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messagesBox = document.getElementById('messages-box');

// Supprimé le chargement initial des messages depuis une base de données
document.addEventListener('DOMContentLoaded', () => {
    console.log("Chat loaded, ready to send and receive messages!");
});

// Gestion de l'envoi des messages
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat message', { text: message });
        messageInput.value = '';
    }
});

// Gestion de la réception des messages
socket.on('chat message', (msg) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <span class="timestamp">[${msg.timestamp}]</span> 
        <span class="username">${msg.username}</span>: ${msg.text}
    `;
    messagesBox.appendChild(messageElement);
    messagesBox.scrollTop = messagesBox.scrollHeight;
;


    // Ajoute l'horodatage à gauche du pseudo
    messageElement.innerHTML = `
        <span class="timestamp">[${msg.timestamp}]</span>
        <strong>${msg.username}</strong>: ${msg.text}
    `;

    messagesBox.appendChild(messageElement);
    messagesBox.scrollTop = messagesBox.scrollHeight;
});

document.addEventListener('mouseover', (event) => {
    if (event.target.classList.contains('username')) {
        const username = event.target.textContent;
        const tooltip = document.createElement('div');
        tooltip.classList.add('profile-tooltip');
        tooltip.style.position = 'absolute';
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
        tooltip.innerHTML = 'Chargement...';
        document.body.appendChild(tooltip);

        fetch(`/user/${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const { username, bio, profile_picture } = data.profile;
                    tooltip.innerHTML = `
                        <img src="/static/${profile_picture}" alt="${username}" style="width: 50px; height: 50px; border-radius: 50%;">
                        <p><strong>${username}</strong></p>
                        <p>${bio}</p>
                    `;
                } else {
                    tooltip.innerHTML = 'Utilisateur introuvable.';
                }
            })
            .catch(() => {
                tooltip.innerHTML = 'Erreur lors du chargement.';
            });

        event.target.addEventListener('mouseleave', () => {
            tooltip.remove();
        });
    }
});
