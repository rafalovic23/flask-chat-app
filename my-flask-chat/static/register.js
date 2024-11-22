document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMessage = document.getElementById('error-message');

    // Vérification côté client des mots de passe
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Les mots de passe ne correspondent pas';
        return;
    }

    // Envoi des données d'inscription au serveur
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                // Redirection vers la page de connexion si l'inscription réussit
                alert('Inscription réussie ! Vous allez être redirigé vers la page de connexion.');
                window.location.href = '/login';
            } else {
                // Affiche le message d'erreur envoyé par le serveur
                errorMessage.textContent = data.message || 'Erreur lors de l\'inscription';
            }
        })
        .catch((error) => {
            // Affiche une erreur en cas de problème réseau ou serveur
            errorMessage.textContent = 'Erreur de connexion au serveur';
            console.error('Erreur :', error);
        });
});
