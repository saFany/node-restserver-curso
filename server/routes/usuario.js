const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken, verificaRol } = require('../middlewares/autenticacion');

app.get('/usuario', verificaToken, function(req, res) {

    let desde = req.query.desde || 0;
    let limite = req.query.limite || 5;
    desde = Number(desde);
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    total: conteo
                });
            });
        });
});

app.post('/usuario', [verificaToken, verificaRol], function(req, res) {
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
})

app.put('/usuario/:id', [verificaToken, verificaRol], function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

})

app.delete('/usuario/:id', [verificaToken, verificaRol], function(req, res) {

    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    };

    //Actualiza estado/estatus
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: `El usuario con ID: {id} no existe o ha sido eliminado`
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
    //Actualiza estado/estatus

    //Elimina totalmente
    /*Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if(!usuarioBorrado)
        {
            return res.status(400).json({
                ok: false,
                err:`El usuario con ID: {id} no existe o ha sido eliminado`
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });*/
})

module.exports = app;