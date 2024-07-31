document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const placesList = document.getElementById('places-list');
    const countryFilter = document.getElementById('country-filter');
    const logoutLink = document.getElementById('logout-link');

    // Gestion du formulaire de connexion
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await loginUser(email, password);
            } catch (error) {
                if (errorMessage) {
                    errorMessage.textContent = "Erreur de connexion : " + error.message;
                    errorMessage.style.display = 'block';
                }
            }
        });
    }

    // Vérification de l'authentification et gestion du lien de déconnexion
    const token = checkAuthentication();
    if (countryFilter) {
        setupCountryFilter();
    }

    if (logoutLink) {
        // Afficher le lien de déconnexion seulement si l'utilisateur est connecté
        if (token) {
            logoutLink.style.display = 'block';
            logoutLink.addEventListener('click', () => {
                logoutUser();
            });
        } else {
            logoutLink.style.display = 'none';
        }
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
        document.cookie = `token=${data.access_token}; path=/`;
        window.location.href = 'index.html'; // Redirection après connexion
    } else {
        const error = await response.json();
        throw new Error(error.message || 'Erreur inconnue');
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');

    if (loginLink) {
        if (!token) {
            loginLink.style.display = 'block';
            if (logoutLink) {
                logoutLink.style.display = 'none';
            }
        } else {
            loginLink.style.display = 'none';
            if (logoutLink) {
                logoutLink.style.display = 'block';
            }
            const placesList = document.getElementById('places-list');
            if (placesList) {
                fetchPlaces(token);
            }
        }
    }
    return token;
}

async function fetchPlaces(token) {
    try {
        const response = await fetch('http://localhost:3000/places', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const places = await response.json();
            displayPlaces(places);
        } else {
            console.error('Failed to fetch places');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    if (placesList) {
        placesList.innerHTML = '';

        const countries = new Set();

        places.forEach(place => {
            const placeDiv = document.createElement('div');
            placeDiv.className = 'place';
            placeDiv.innerHTML = `
                <h2>${place.name}</h2>
                <p><strong>Description:</strong> ${place.description}</p>
                <p><strong>Location:</strong> ${place.location}</p>
                <p><strong>Country:</strong> ${place.country}</p>
                <a href="place.html?place_id=${place.id}">Voir Détails</a>
            `;
            placeDiv.dataset.country = place.country;

            placesList.appendChild(placeDiv);
            countries.add(place.country);
        });

        populateCountryFilter(countries);
    }
}

function populateCountryFilter(countries) {
    const countryFilter = document.getElementById('country-filter');
    if (countryFilter) {
        countryFilter.innerHTML = '<option value="">All Countries</option>';

        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countryFilter.appendChild(option);
        });
    }
}

function setupCountryFilter() {
    const countryFilter = document.getElementById('country-filter');
    if (countryFilter) {
        countryFilter.addEventListener('change', (event) => {
            const selectedCountry = event.target.value;
            const places = document.querySelectorAll('#places-list .place');

            places.forEach(place => {
                if (selectedCountry === '' || place.dataset.country === selectedCountry) {
                    place.style.display = 'block';
                } else {
                    place.style.display = 'none';
                }
            });
        });
    }
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('place_id');
}

async function fetchPlaceDetails(token, placeId) {
    try {
        const response = await fetch(`http://localhost:3000/places/${placeId}`, {
            method: 'GET',
            headers: token ? {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            } : {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const place = await response.json();
            displayPlaceDetails(place);
        } else {
            console.error('Failed to fetch place details');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayPlaceDetails(place) {
    const placeDetailsSection = document.getElementById('place-details');
    if (placeDetailsSection) {
        placeDetailsSection.innerHTML = ''; // Clear existing content

        const nameElement = document.createElement('h1');
        nameElement.textContent = place.name;

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = place.description;

        const locationElement = document.createElement('p');
        locationElement.textContent = `Localisation : ${place.location}`;

        placeDetailsSection.appendChild(nameElement);
        placeDetailsSection.appendChild(descriptionElement);
        placeDetailsSection.appendChild(locationElement);

        // Adding images
        if (place.images && place.images.length > 0) {
            const imagesContainer = document.createElement('div');
            place.images.forEach(imageUrl => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = place.name;
                imagesContainer.appendChild(imgElement);
            });
            placeDetailsSection.appendChild(imagesContainer);
        }
    }
}

function logoutUser() {
    // Supprimer le cookie du jeton
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

    // Rediriger vers la page de connexion ou d'accueil
    window.location.href = 'login.html'; // ou 'index.html' selon votre besoin
}
