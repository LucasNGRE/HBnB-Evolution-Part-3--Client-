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

app.listen(port, () => {
    console.log(`Serveur en écoute sur http://localhost:${port}`);
});
