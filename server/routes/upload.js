const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: 'Ningún archivo fue seleccionado.'
        });
    }

    //Valida tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(', '),
                tipoRecibido: tipo
            }
        });
    }

    // Nombre del campo
    let archivo = req.files.archivo;
    //Nombre archivo 
    let nombreArchivo = archivo.name.split('.');
    //Extensión del archivo
    let extensionArchivo = nombreArchivo[nombreArchivo.length - 1];
    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'El archivo no tiene un formato permitido, las extensiones validas son: ' + extensionesValidas.join(', '),
                extensionRecibida: '.' + extensionArchivo
            }
        });
    }

    //Cambiar nombre al archivo
    let newNombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    // Funcion mv para mover el archivo
    archivo.mv(`uploads/${tipo}/${newNombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (tipo === 'usuarios') {
            imagen_usuarios(id, res, newNombreArchivo);
        } else {
            imagen_productos(id, res, newNombreArchivo);
        }

    });
});


function imagen_usuarios(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');

            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El usuario no existe'
                    }
                });
            }
            return res.status(500).json({
                ok: false,
                err
            });
        }


        borrarArchivo(usuarioDB.img, 'usuarios');
        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioPut) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                usuario: usuarioPut,
                img: nombreArchivo
            });
        });
    });
}

function imagen_productos(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'productos');

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                });
            }
            return res.status(500).json({
                ok: false,
                err
            });
        }

        borrarArchivo(productoDB.img, 'productos');
        productoDB.img = nombreArchivo;

        productoDB.save((err, productoPut) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            return res.json({
                ok: true,
                producto: productoPut,
                img: nombreArchivo
            });
        });
    });
}

function borrarArchivo(nombreImg, tipo) {
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImg}`);
    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
    }
}
module.exports = app;