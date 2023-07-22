const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'admin001',
    password: 'admin002',
    database: 'favolist'
});
let transporter;
if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
        host: "smtp.mailgun.org",
        port: 587,
        auth: {
            user: process.env.MAILGUN_USER,
            pass: process.env.MAILGUN_PASS
        }
    });
} else {
    transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.f199eb10a8cc1d,
            pass: process.env.dd586688adb6ab
        }
    });
}


//ここにメモ

app.post('/register', async (req, res) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const values = [req.body.email];

    connection.query(query, values, async (error, results) => {
        if (error) return res.status(400).send('Database query failed: ' + error.message);
        if (results.length > 0) return res.status(400).send('User already registered.');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
        const insertValues = [req.body.email, hashedPassword];

        connection.query(insertQuery, insertValues, function (error, results) {
            if (error) return res.status(400).send('Database query failed: ' + error.message);
            res.status(200).send('Registration successful!');
        });
    });
});


app.get('/confirmation/:token', function (req, res) {
    const query = 'SELECT * FROM verification_tokens WHERE token = ?';
    const values = [req.params.token];

    connection.query(query, values, function (error, results) {
        if (error) return res.status(400).send('Database query failed.');

        if (results.length === 0) {
            return res.status(400).send('This verification token is invalid.');
        }

        const updateQuery = 'UPDATE users SET isActive = true WHERE user_id = ?';
        const updateValues = [results[0].user_id];

        connection.query(updateQuery, updateValues, function (error, results) {
            if (error) return res.status(400).send('Database query failed.');

            // Delete verification token
            const deleteQuery = 'DELETE FROM verification_tokens WHERE token = ?';
            const deleteValues = [req.params.token];

            connection.query(deleteQuery, deleteValues, function (error, results) {
                if (error) return res.status(400).send('Database query failed.');

                res.status(200).send("Your account has been verified. Please log in.");
            });
        });
    });
});

app.get('/allfavorites', function (req, res) {
    const query = 'SELECT * FROM favorites ORDER BY post_id DESC LIMIT 50';

    connection.query(query, function (error, results, fields) {
        if (error) {
            res.json({ success: false, error: error });
        } else {
            res.json({ success: true, data: results });
        }
    });
});

app.post('/login', (req, res) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const values = [req.body.email];

    connection.query(query, values, async (error, results) => {
        if (error) return res.status(400).send('Database query failed.');
        if (results.length === 0) return res.status(400).send('Invalid email or password.');

        const validPassword = await bcrypt.compare(req.body.password, results[0].password);
        if (!validPassword) return res.status(400).send('Invalid email or password.');

        const token = jwt.sign({ user_id: results[0].user_id }, 'jwtPrivateKey');
        console.log('Generated token:', token);
        res.json({ token: token }); // Change from res.send(token) to res.json({ token: token })

    });
});

app.get('/favorites', function (req, res) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    let userId;
    try {
        const decoded = jwt.verify(token, 'jwtPrivateKey');
        userId = decoded.user_id;
    }
    catch (ex) {
        return res.status(400).send('Invalid token.');
    }

    const query = 'SELECT * FROM favorites WHERE userId = ? ORDER BY post_id DESC LIMIT 50';
    const values = [userId];

    connection.query(query, values, function (error, results, fields) {
        if (error) {
            res.json({ success: false, error: error });
        } else {
            res.json({ success: true, data: results });
        }
    });
});




app.post('/favorites', function (req, res) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    let userId;
    try {
        const decoded = jwt.verify(token, 'jwtPrivateKey');
        userId = decoded.user_id;
    }
    catch (ex) {
        console.error(ex);  // ログステートメントを追加
        return res.status(400).send('Invalid token.');
    }

    const favorite = req.body;
    const query = 'INSERT INTO favorites (userId, url, time, memo) VALUES (?, ?, ?, ?)';
    const values = [userId, favorite.url, favorite.time, favorite.memo];

    connection.query(query, values, function (error, results, fields) {
        if (error) {
            res.json({ success: false, error: error });
        } else {
            res.json({ success: true });
        }
    });
});


app.listen(3000, function () {
    console.log('App is listening on port 3000');
});