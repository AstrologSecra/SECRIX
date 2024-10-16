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

    function savePostsToLocalStorage() {
        localStorage.setItem('posts', JSON.stringify(Array.from(postsContainer.children).map(post => post.outerHTML)));
    }

    function loadPostsFromLocalStorage() {
        const posts = JSON.parse(localStorage.getItem('posts'));
        if (posts) {
            postsContainer.innerHTML = posts.join('');
        }
    }

    async function login(username, password) {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            currentProfile = await response.json();
            updateProfileUI();
            loginModal.style.display = 'none';
            loginBtn.style.display = 'none';
            alert('Вход выполнен успешно!');
        } else {
            alert('Неверный ник или пароль.');
        }
    }

    async function register(username, password) {
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            alert('Регистрация выполнена успешно!');
        } else {
            alert('Пользователь с таким ником уже существует.');
        }
    }

    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burger.classList.toggle('active');
    });

    postBtn.addEventListener('click', () => {
        const postContent = postInput.value.trim();
        if (!currentProfile.username) {
            alert('Пожалуйста, войдите или зарегистрируйтесь.');
            return;
        }
        if (postContent || mediaInput.files.length > 0) {
            const postElement = createPostElement(postContent);
            postsContainer.prepend(postElement);
            postInput.value = '';
            mediaInput.value = '';
            savePostsToLocalStorage();
        }
    });

    function createPostElement(content) {
        const post = document.createElement('div');
        post.classList.add('post');

        const postHeader = document.createElement('div');
        postHeader.classList.add('post-header');

        const postAuthor = document.createElement('div');
        postAuthor.classList.add('post-author');
        postAuthor.textContent = currentProfile.username;
        postAuthor.addEventListener('click', () => {
            showUserProfile(currentProfile.username);
        });

        const postTime = document.createElement('div');
        postTime.classList.add('post-time');
        postTime.textContent = new Date().toLocaleString();

        postHeader.appendChild(postAuthor);
        postHeader.appendChild(postTime);

        const postContent = document.createElement('div');
        postContent.classList.add('post-content');
        postContent.textContent = content;

        if (mediaInput.files.length > 0) {
            const mediaElement = document.createElement(mediaInput.files[0].type.startsWith('image') ? 'img' : 'video');
            mediaElement.src = URL.createObjectURL(mediaInput.files[0]);
            mediaElement.controls = true;
            postContent.appendChild(mediaElement);
        }

        const postActions = document.createElement('div');
        postActions.classList.add('post-actions');

        const likeIcon = document.createElement('i');
        likeIcon.classList.add('fas', 'fa-heart');
        likeIcon.addEventListener('click', () => {
            likeIcon.classList.toggle('liked');
            const likeCount = likeIcon.nextElementSibling;
            likeCount.textContent = parseInt(likeCount.textContent) + (likeIcon.classList.contains('liked') ? 1 : -1);
        });

        const likeCount = document.createElement('span');
        likeCount.classList.add('like-count');
        likeCount.textContent = '0';

        const commentIcon = document.createElement('i');
        commentIcon.classList.add('fas', 'fa-comment');
        commentIcon.addEventListener('click', () => {
            const commentForm = post.querySelector('.comment-form');
            commentForm.style.display = commentForm.style.display === 'flex' ? 'none' : 'flex';
        });

        const commentCount = document.createElement('span');
        commentCount.classList.add('comment-count');
        commentCount.textContent = '0';

        const editIcon = document.createElement('i');
        editIcon.classList.add('fas', 'fa-edit');
        editIcon.addEventListener('click', () => {
            const newContent = prompt('Редактировать пост:', postContent.textContent);
            if (newContent !== null) {
                postContent.textContent = newContent;
                savePostsToLocalStorage();
            }
        });

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fas', 'fa-trash');
        deleteIcon.addEventListener('click', () => {
            if (confirm('Удалить пост?')) {
                post.remove();
                savePostsToLocalStorage();
            }
        });

        const banIcon = document.createElement('i');
        banIcon.classList.add('fas', 'fa-ban', 'ban-icon');
        banIcon.addEventListener('click', () => {
            const username = postAuthor.textContent;
            if (confirm(`Забанить пользователя ${username}?`)) {
                banUser(username);
            }
        });

        postActions.appendChild(likeIcon);
        postActions.appendChild(likeCount);
        postActions.appendChild(commentIcon);
        postActions.appendChild(commentCount);
        postActions.appendChild(editIcon);
        postActions.appendChild(deleteIcon);
        if (currentProfile.isAdmin) {
            postActions.appendChild(banIcon);
        }

        const comments = document.createElement('div');
        comments.classList.add('comments');

        const commentForm = document.createElement('div');
        commentForm.classList.add('comment-form');

        const commentInput = document.createElement('input');
        commentInput.type = 'text';
        commentInput.placeholder = 'Напишите комментарий...';

        const commentBtn = document.createElement('button');
        commentBtn.textContent = 'Отправить';
        commentBtn.addEventListener('click', () => {
            const commentContent = commentInput.value.trim();
            if (commentContent) {
                const commentElement = createCommentElement(commentContent);
                comments.appendChild(commentElement);
                commentInput.value = '';
                commentCount.textContent = parseInt(commentCount.textContent) + 1;
                savePostsToLocalStorage();
            }
        });

        commentForm.appendChild(commentInput);
        commentForm.appendChild(commentBtn);

        post.appendChild(postHeader);
        post.appendChild(postContent);
        post.appendChild(postActions);
        post.appendChild(comments);
        post.appendChild(commentForm);

        return post;
    }

    function createCommentElement(content) {
        const comment = document.createElement('div');
        comment.classList.add('comment');

        const commentAuthor = document.createElement('div');
        commentAuthor.classList.add('comment-author');
        commentAuthor.textContent = currentProfile.username;

        const commentContent = document.createElement('div');
        commentContent.classList.add('comment-content');
        commentContent.textContent = content;

        comment.appendChild(commentAuthor);
        comment.appendChild(commentContent);

        return comment;
    }

    function showUserProfile(username) {
        profileUsername.textContent = username;
        profilePostsContainer.innerHTML = '';
        const userPosts = Array.from(postsContainer.children).filter(post => post.querySelector('.post-author').textContent === username);
        userPosts.forEach(post => profilePostsContainer.appendChild(post.cloneNode(true)));
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

    saveProfileBtn.addEventListener('click', () => {
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

    loginSubmitBtn.addEventListener('click', () => {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();
        if (username && password) {
            login(username, password);
        } else {
            alert('Пожалуйста, заполните все поля.');
        }
    });

    registerSubmitBtn.addEventListener('click', () => {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();
        if (username && password) {
            register(username, password);
        } else {
            alert('Пожалуйста, заполните все поля.');
        }
    });

    function banUser(username) {
        const userIndex = users.findIndex(user => user.username === username);
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            saveUsersToLocalStorage();
            alert(`Пользователь ${username} забанен.`);
            location.reload();
        }
    }

    loadPostsFromLocalStorage();
    updateProfileUI();
});
