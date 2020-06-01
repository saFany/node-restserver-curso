require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//Habilitar public
app.use(express.static(path.resolve(__dirname, '../public')));

// parse application/json
app.use(bodyParser.json());

//Configuración global de rutas
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, (err, res) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando en el puerto: ', process.env.PORT);
});