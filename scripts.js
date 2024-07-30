document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const placesList = document.getElementById('places-list');
    const countryFilter = document.getElementById('country-filter');

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

    checkAuthentication();
    if (countryFilter) {
        setupCountryFilter();
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
        window.location.href = 'index.html';
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

    if (loginLink) {
        if (!token) {
            loginLink.style.display = 'block';
        } else {
            loginLink.style.display = 'none';
            const placesList = document.getElementById('places-list');
            if (placesList) {
                fetchPlaces(token);
            }
        }
    }
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
