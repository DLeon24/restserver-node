const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

app.post('/login', (req, res) => {
    let body = req.body;
    User.findOne({ email: body.email }, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'user or password incorrect.'
            });
        }
        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(400).json({
                ok: false,
                message: 'user or password incorrect.'
            });
        }
        let token = jwt.sign({
            user
        }, process.env.SEED, { expiresIn: process.env.EXPIRATION_TOKEN });
        res.json({
            ok: true,
            user,
            token
        });
    })
});

module.exports = app;