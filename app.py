from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO, emit
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import os

# Initialisation Flask et configurations
app = Flask(__name__)
app.config['SECRET_KEY'] = 'votre_clé_secrète'
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# Initialisation de la base de données et de Socket.IO
db = SQLAlchemy(app)
socketio = SocketIO(app)

# Initialisation de Flask-Migrate
migrate = Migrate(app, db)

# Modèles de la base de données
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

# Routes principales
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login_page():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # Vérification de l'utilisateur dans la base de données
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['username'] = user.username
            return jsonify(success=True)
        return jsonify(success=False, message="Identifiants incorrects"), 401
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register_page():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # Vérifie si l'utilisateur existe déjà
        if User.query.filter_by(username=username).first():
            return jsonify(success=False, message="Nom d'utilisateur déjà pris"), 400

        # Création d'un nouvel utilisateur
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify(success=True)
    return render_template('register.html')

@app.route('/chat')
def chat_page():
    if 'user_id' not in session:  # Vérifie que l'utilisateur est connecté
        return redirect(url_for('login_page'))  # Redirige vers la page de login si non connecté
    return render_template('chat.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route('/user/<username>', methods=['GET'])
def get_user_profile(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify(success=False, message="Utilisateur introuvable"), 404

    return jsonify(success=True, profile={
        "username": user.username,
        "bio": user.bio or "Pas de biographie",
        "profile_picture": user.profile_picture or "default.png"
    })


# Socket.IO : Gestion des messages
@socketio.on('chat message')
def handle_message(data):
    username = session.get('username', 'Utilisateur anonyme')
    text = data.get('text', None)

    if not text:  # Vérifie que le message n'est pas vide
        return

    # Ajoute l'heure et la date
    timestamp = datetime.utcnow().strftime('%d/%m/%Y %H:%M')

    # Émet le message à tous les clients connectés
    emit('chat message', {
        'username': username,
        'text': text,
        'timestamp': timestamp
    }, broadcast=True)


# Route pour afficher et modifier le profil
@app.route('/profile', methods=['GET', 'POST'])
def profile_page():
    if 'user_id' not in session:  # Vérifie que l'utilisateur est connecté
        return redirect(url_for('login_page'))  # Redirige vers la page de login si non connecté
    
    user = User.query.get(session['user_id'])
    if request.method == 'POST':
        new_username = request.form.get('username')
        bio = request.form.get('bio')
        profile_picture = request.files.get('profile_picture')

        # Mise à jour des informations utilisateur
        if new_username:
            user.username = new_username
            session['username'] = new_username
        if bio:
            user.bio = bio
        if profile_picture:
            filename = secure_filename(profile_picture.filename)
            picture_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            profile_picture.save(picture_path)
            user.profile_picture = f'uploads/{filename}'
        
        db.session.commit()
    return render_template('profile.html', user=user)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)


