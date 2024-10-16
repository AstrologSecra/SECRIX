const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/secrix', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    photo: String,
    lastUsernameChange: Date,
    isAdmin: Boolean
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).send('Пользователь с таким ником уже существует.');
    }
    const newUser = new User({ username, password, photo: '', isAdmin: username === 'admin' });
    await newUser.save();
    res.status(201).send('Регистрация выполнена успешно!');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(401).send('Неверный ник или пароль.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});