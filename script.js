const API_URL = 'http://localhost:3000'; // Измените на ваш IP-адрес и порт

async function fetchData(url, options = {}) {
    const response = await fetch(url, options);
    return await response.json();
}

document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const postBtn = document.getElementById('post-btn');
    const postInput = document.getElementById('post-input');
    const mediaInput = document.getElementById('media-input');
    const postsContainer = document.getElementById('posts');
    const userProfileSection = document.getElementById('user-profile');
    const profilePostsContainer = document.getElementById('profile-posts');
    const profileUsername = document.getElementById('profile-username');
    const profilePhoto = document.getElementById('profile-photo');
    const profileInitials = document.getElementById('profile-initials');
    const profilePhotoContainer = document.getElementById('profile-photo-container');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeModal = document.querySelector('.close');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const newUsernameInput = document.getElementById('new-username');
    const newPhotoInput = document.getElementById('new-photo');
    const profileBtn = document.getElementById('profile-btn');
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const registerSubmitBtn = document.getElementById('register-submit-btn');

    let currentProfile = {
        name: 'Имя пользователя',
        username: '',
        photo: '',
        lastUsernameChange: null,
        isAdmin: false
    };

    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];

    function getRandomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function canChangeUsername() {
        if (!currentProfile.lastUsernameChange) return true;
        const now = new Date();
        return now - new Date(currentProfile.lastUsernameChange) >= oneWeekInMilliseconds;
    }

    function updateProfileUI() {
        profileUsername.textContent = currentProfile.username;
        if (currentProfile.photo) {
            profilePhoto.src = currentProfile.photo;
            profilePhoto.style.display = 'block';
            profileInitials.style.display = 'none';
        } else {
            profilePhoto.style.display = 'none';
            profileInitials.textContent = currentProfile.username[0].toUpperCase();
            profileInitials.style.display = 'block';
            profilePhotoContainer.style.backgroundColor = getRandomColor();
        }
        if (currentProfile.isAdmin) {
            profileUsername.classList.add('admin');
        } else {
            profileUsername.classList.remove('admin');
        }
        userProfileSection.style.display = currentProfile.username ? 'block' : 'none';
    }

    async function loadPosts() {
        const posts = await fetchData(`${API_URL}/posts`);
        postsContainer.innerHTML = posts.map(createPostElement).join('');
    }

    async function loadUserPosts(username) {
        const userPosts = await fetchData(`${API_URL}/posts/${username}`);
        profilePostsContainer.innerHTML = userPosts.map(createPostElement).join('');
    }

    function createPostElement(post) {
        return `
            <div class="post">
                <div class="post-header">
                    <div class="post-author">${post.username}</div>
                    <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
                </div>
                <div class="post-content">${post.content}</div>
                ${post.media ? `<img src="${post.media}" alt="Media">` : ''}
                <div class="post-actions">
                    <i class="fas fa-heart"></i>
                    <span class="like-count">0</span>
                    <i class="fas fa-comment"></i>
                    <span class="comment-count">0</span>
                    <i class="fas fa-edit"></i>
                    <i class="fas fa-trash"></i>
                    ${currentProfile.isAdmin ? '<i class="fas fa-ban ban-icon"></i>' : ''}
                </div>
                <div class="comments"></div>
                <div class="comment-form">
                    <input type="text" placeholder="Напишите комментарий...">
                    <button>Отправить</button>
                </div>
            </div>
        `;
    }

    async function showUserProfile(username) {
        profileUsername.textContent = username;
        await loadUserPosts(username);
        userProfileSection.style.display = 'block';
        document.getElementById('home').style.display = 'none';
    }

    document.getElementById('user-profile').addEventListener('click', () => {
        userProfileSection.style.display = 'none';
        document.getElementById('home').style.display = 'block';
    });

    editProfileBtn.addEventListener('click', () => {
        if (!canChangeUsername()) {
            alert('Вы можете изменить ник только раз в неделю.');
            return;
        }
        editProfileModal.style.display = 'block';
        newUsernameInput.value = currentProfile.username;
    });

    closeModal.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
        loginModal.style.display = 'none';
    });

    saveProfileBtn.addEventListener('click', async () => {
        const newUsername = newUsernameInput.value.trim();
        if (newUsername) {
            currentProfile.username = newUsername;
            currentProfile.lastUsernameChange = new Date();
            if (newPhotoInput.files.length > 0) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    currentProfile.photo = e.target.result;
                    updateProfileUI();
                };
                reader.readAsDataURL(newPhotoInput.files[0]);
            } else {
                currentProfile.photo = '';
                updateProfileUI();
            }
            await fetchData(`${API_URL}/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentProfile.username, newUsername, photo: currentProfile.photo })
            });
            editProfileModal.style.display = 'none';
        } else {
            alert('Ник не может быть пустым.');
        }
    });

    profileBtn.addEventListener('click', () => {
        showUserProfile(currentProfile.username);
    });

    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    loginSubmitBtn.addEventListener('click', async () => {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();
        if (username && password) {
            const response = await fetchData(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (response.user) {
                currentProfile = response.user;
                updateProfileUI();
                loginModal.style.display = 'none';
                loginBtn.style.display = 'none';
                alert('Вход выполнен успешно!');
            } else {
                alert(response.message);
            }
        } else {
            alert('Пожалуйста, заполните все поля.');
        }
    });

    registerSubmitBtn.addEventListener('click', async () => {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();
        if (username && password) {
            const response = await fetchData(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            alert(response.message);
        } else {
            alert('Пожалуйста, заполните все поля.');
        }
    });

    postBtn.addEventListener('click', async () => {
        const postContent = postInput.value.trim();
        if (!currentProfile.username) {
            alert('Пожалуйста, войдите или зарегистрируйтесь.');
            return;
        }
        if (postContent || mediaInput.files.length > 0) {
            const media = mediaInput.files.length > 0 ? URL.createObjectURL(mediaInput.files[0]) : '';
            const response = await fetchData(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: currentProfile.username, content: postContent, media })
            });
            if (response.post) {
                postsContainer.prepend(createPostElement(response.post));
                postInput.value = '';
                mediaInput.value = '';
            }
        }
    });

    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burger.classList.toggle('active');
    });

    loadPosts();
    updateProfileUI();
});
