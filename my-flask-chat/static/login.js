document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Empêche le rechargement de la page

    const username = document.getElementById('username').value; // Récupération du nom d'utilisateur
    const password = document.getElementById('password').value; // Récupération du mot de passe
    const errorMessage = document.getElementById('error-message'); // Élément pour afficher les erreurs

    console.log('Données envoyées :', { username, password });

    // Envoi de la requête POST à la route Flask
    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Déclare que les données envoyées sont JSON
        body: JSON.stringify({ username, password }), // Transforme les données en JSON
    })
        .then((response) => {
            console.log('Réponse brute :', response); // Log de la réponse HTTP brute
            if (!response.ok) {
                // Si la réponse n'est pas OK (par exemple, statut 401 ou 404)
                return response.json().then((data) => {
                    throw new Error(data.message || 'Erreur d\'authentification');
                });
            }
            return response.json(); // Convertit la réponse en JSON
        })
        .then((data) => {
            console.log('Réponse JSON :', data); // Log des données JSON renvoyées par le serveur

            if (data.success) {
                // Si connexion réussie, redirection vers /chat
                window.location.href = '/chat';
            } else {
                // Si la réponse JSON indique un échec
                errorMessage.textContent = data.message || 'Erreur inconnue'; // Affiche le message d'erreur
            }
        })
        .catch((error) => {
            // En cas d'erreur réseau ou serveur
            errorMessage.textContent = error.message || 'Erreur réseau ou serveur.';
            console.error('Erreur réseau ou serveur :', error);
        });
});




