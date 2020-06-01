const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({ //Error de DB
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({ //Usuario no encontrado
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos.'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({ //Contraseña no coincide 
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos.'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        });

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});

//Configuraciones de google

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(err => {
            return res.status(402).json({
                ok: false,
                err
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({ //Error de DB
                ok: false,
                err
            });
        }

        if (usuarioDB) {
            if (!usuarioDB.google) {
                return res.status(400).json({ //Ya existe en la bd
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //Si el usuario no existe en la db
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'

            usuario.save((err, usuarioRes) => {
                if (err) {
                    return res.status(500).json({ //Error de DB
                        ok: false,
                        err
                    });
                }
                return res.json({
                    ok: true,
                    usuario: usuarioRes,
                    token
                });
            });
        }
    });
});

module.exports = app;