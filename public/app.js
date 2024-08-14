let currentUser = null;

function updateNavMenu() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');

    if (currentUser) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'inline';
    } else {
        loginLink.style.display = 'inline';
        registerLink.style.display = 'inline';
        logoutLink.style.display = 'none';
    }
}

function showLoginForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <h2>Login</h2>
        <form id="login-form">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit">Login</button>
        </form>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                currentUser = data.user;
                updateNavMenu();
                showHomePage();
            } else {
                alert('Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

function showRegisterForm() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <h2>Register</h2>
        <form id="register-form">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" required>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit">Register</button>
        </form>
    `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                alert('Registration successful. Please login.');
                showLoginForm();
            } else {
                alert('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}

async function logout() {
    try {
        const response = await fetch('/api/users/logout');
        if (response.ok) {
            currentUser = null;
            updateNavMenu();
            showHomePage();
        } else {
            alert('Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function showHomePage() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Welcome to the Image Comment Website</h2>';

    if (currentUser && currentUser.isAdmin) {
        mainContent.innerHTML += `
            <h3>Upload Image</h3>
            <form id="upload-form" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="image-name">Image Name:</label>
                    <input type="text" id="image-name" required>
                </div>
                <div class="form-group">
                    <label for="image-file">Image File:</label>
                    <input type="file" id="image-file" accept="image/*" required>
                </div>
                <button type="submit">Upload</button>
            </form>
        `;

        document.getElementById('upload-form').addEventListener('submit', uploadImage);
    }

    mainContent.innerHTML += `
        <h3>Search Images</h3>
        <form id="search-form">
            <div class="form-group">
                <label for="search-query">Search:</label>
                <input type="text" id="search-query" required>
            </div>
            <button type="submit">Search</button>
        </form>
        <div id="image-results" class="image-grid"></div>
    `;

    document.getElementById('search-form').addEventListener('submit', searchImages);
}

async function uploadImage(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('image-name').value);
    formData.append('image', document.getElementById('image-file').files[0]);

    try {
        const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Image uploaded successfully');
            showHomePage();
        } else {
            alert('Image upload failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function searchImages(e) {
    e.preventDefault();
    const query = document.getElementById('search-query').value;

    try {
        const response = await fetch(`/api/images/search?query=${encodeURIComponent(query)}`);
        if (response.ok) {
            const images = await response.json();
            displayImages(images);
        } else {
            alert('Image search failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayImages(images) {
    const imageResults = document.getElementById('image-results');
    imageResults.innerHTML = '';

    images.forEach(image => {
        const imageElement = document.createElement('div');
        imageElement.className = 'image-item';
        imageElement.innerHTML = `
            <img src="/uploads/${image.filename}" alt="${image.name}">
            <p>${image.name}</p>
        `;
        imageResults.appendChild(imageElement);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('home-link').addEventListener('click', (e) => {
        e.preventDefault();
        showHomePage();
    });

    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    document.getElementById('register-link').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });

    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    showHomePage();
});
