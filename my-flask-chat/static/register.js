document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
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
                return response.json().then((data) => {
                    throw new Error(data.message || 'Erreur lors de l\'inscription');
                });
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                alert('Inscription réussie ! Vous allez être redirigé vers la page de connexion.');
                window.location.href = '/login';
            } else {
                errorMessage.textContent = data.message || 'Erreur inconnue lors de l\'inscription.';
            }
        })
        .catch((error) => {
            errorMessage.textContent = error.message || 'Erreur réseau ou serveur.';
            console.error('Erreur réseau ou serveur :', error);
        });
});

