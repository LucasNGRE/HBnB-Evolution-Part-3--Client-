const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Clé secrète pour signer les jetons JWT
const SECRET_KEY = 'votre_clé_secrète';

// Middleware pour parser les données JSON
app.use(bodyParser.json());

// Middleware CORS
app.use(cors());

// Liste simulée des lieux
const places = [
    { name: 'Eiffel Tower', description: 'Iconic Parisian landmark.', location: 'Paris', country: 'France' },
    { name: 'Statue of Liberty', description: 'Famous statue in New York City.', location: 'New York', country: 'USA' },
    { name: 'Colosseum', description: 'Ancient Roman gladiatorial arena.', location: 'Rome', country: 'Italy' },
    // Ajoutez d'autres lieux ici
];

// Middleware pour vérifier les jetons JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Endpoint de connexion
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === 'user@example.com' && password === 'password123') {
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ access_token: token });
    } else {
        res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
});

// Endpoint pour obtenir la liste des lieux (protégé par JWT)
app.get('/places', authenticateToken, (req, res) => {
    res.json(places);
});

app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
