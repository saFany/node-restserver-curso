const express = require('express');

let { verificaToken, verificaRol } = require('../middlewares/autenticacion');
let app = express();
let Categoria = require('../models/categoria'); //Schema

//=====================
// Mostrar todas la categorias
//=====================
app.get('/categorias', (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoriasDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias: categoriasDB
            });
        });
});

//=====================
// Mostrar la categoria por ID
//=====================
app.get('/categoria/:id', (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, function(err, categoriaDB) {
        if (err) {
            return res.status(404).json({
                ok: false,
                err: 'El usuario con ID: ' + id + ' no existe o ha sido eliminado'
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

//=====================
// Crear categoría
//=====================
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
}); //Regresa la categoría, necesita el id para verificar token

//=====================
// Actualizar categoría
//=====================
app.put('/categoria/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    Categoria.findByIdAndUpdate(id, body, { new: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriasDB) {
            return res.status(500).json({
                ok: false,
                err: 'El usuario con ID: ' + id + ' no existe o ha sido eliminado'
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

//=====================
// Eliminar categoría
//=====================

app.delete('/categoria/:id', [verificaToken, verificaRol], function(req, res) {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada
        });
    });
}); //Solo Admin puede borrar, requiere token, se debe borrar de la bd

module.exports = app;