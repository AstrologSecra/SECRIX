const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let users = [];
let posts = [];

// Загрузка данных из файлов
try {
    users = JSON.parse(fs.readFileSync('users.json'));
    posts = JSON.parse(fs.readFileSync('posts.json'));
} catch (err) {
    console.error('Error loading data:', err);
}

// Регистрация пользователя
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'Пользователь с таким ником уже существует.' });
    }
    users.push({ username, password, photo: '', isAdmin: username === 'admin' });
    fs.writeFileSync('users.json', JSON.stringify(users));
    res.status(201).json({ message: 'Регистрация выполнена успешно!' });
});

// Вход пользователя
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        res.status(200).json({ message: 'Вход выполнен успешно!', user });
    } else {
        res.status(401).json({ message: 'Неверный ник или пароль.' });
    }
});

// Создание поста
app.post('/posts', (req, res) => {
    const { username, content, media } = req.body;
    const post = { username, content, media, timestamp: new Date().toISOString() };
    posts.push(post);
    fs.writeFileSync('posts.json', JSON.stringify(posts));
    res.status(201).json({ message: 'Пост создан успешно!', post });
});

// Получение всех постов
app.get('/posts', (req, res) => {
    res.status(200).json(posts);
});

// Получение постов пользователя
app.get('/posts/:username', (req, res) => {
    const userPosts = posts.filter(post => post.username === req.params.username);
    res.status(200).json(userPosts);
});

// Редактирование профиля
app.put('/profile', (req, res) => {
    const { username, newUsername, photo } = req.body;
    const user = users.find(user => user.username === username);
    if (user) {
        user.username = newUsername;
        user.photo = photo;
        fs.writeFileSync('users.json', JSON.stringify(users));
        res.status(200).json({ message: 'Профиль обновлен успешно!', user });
    } else {
        res.status(404).json({ message: 'Пользователь не найден.' });
    }
});

// Бан пользователя
app.delete('/ban/:username', (req, res) => {
    const { username } = req.params;
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        fs.writeFileSync('users.json', JSON.stringify(users));
        res.status(200).json({ message: `Пользователь ${username} забанен.` });
    } else {
        res.status(404).json({ message: 'Пользователь не найден.' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});