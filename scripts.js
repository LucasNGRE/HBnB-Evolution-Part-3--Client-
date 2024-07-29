document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await loginUser(email, password);
            } catch (error) {
                errorMessage.textContent = "Erreur de connexion : " + error.message;
                errorMessage.style.display = 'block';
            }
        });
    }
});

async function loginUser(email, password) {
    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const data = await response.json();
        document.cookie = `token=${data.access_token}; path=/; HttpOnly`; // Notez que HttpOnly empêche l'accès JavaScript au cookie
        window.location.href = 'index.html'; // Redirection après connexion réussie
    } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur inconnue');
    }
}
