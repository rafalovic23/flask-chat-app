document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Redirige vers la page de chat si la connexion est réussie
            window.location.href = '/chat';
        } else {
            // Affiche le message d'erreur renvoyé par le serveur
            errorMessage.textContent = data.message || 'Identifiants incorrects';
        }
    })
    .catch(error => {
        // Affiche une erreur en cas de problème réseau ou serveur
        errorMessage.textContent = 'Erreur de connexion au serveur';
        console.error('Erreur :', error);
    });
});




