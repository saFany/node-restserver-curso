const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//=====================
// Obtener todos los productos
//=====================

app.get('/productos', (req, res) => {
    //Traer todos los productos
    //populate: usuario categoria
    //páginado
    let desde = req.query.desde || 0;
    let hasta = req.query.hasta || 10;
    Producto.find({ disponible: true })
        .skip(Number(desde))
        .limit(Number(hasta))
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos: productosDB
            });

        });
});

//=====================
// Obtener un producto
//=====================
app.get('/productos/:id', (req, res) => {
    //Producto por ID
    //populate: usuario categoria

    let id = req.params.id
    Producto.findById(id)
        .populate('usuario', 'nombre')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: 'El producto con ID: ' + id + ' no existe.'
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

//=====================
// Buscar productos
//=====================

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    //Traer todos los productos
    //populate: usuario categoria
    //páginado

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');
    Producto.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos: productosDB
            });

        });
});

//=====================
// Crear productos
//=====================
app.post('/productos', verificaToken, (req, res) => {
    //Guardar usuario
    //Guardar categoría

    let body = req.body;

    let nuevoProducto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id,
    });

    nuevoProducto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

//=====================
// Actualizar un producto
//=====================
app.put('/productos/:id', verificaToken, (req, res) => {
    //Guardar una categoria

    let id = req.params.id;
    let body = req.body;
    let productoPut = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        categoria: body.categoria,
        disponible: body.disponible,
        descripcion: body.descripcion,
    };

    Producto.findByIdAndUpdate(id, productoPut, { new: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

//=====================
// Borrar un producto
//=====================
app.delete('/productos/:id', verificaToken, (req, res) => {
    //Cambiar disponble a falso para "eliminarlo"

    let id = req.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

module.exports = app;