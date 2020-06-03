const mongoose = require('mongoose');

let leyenda = 'Este campo es requerido';
let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        required: [true, leyenda],
        unique: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, leyenda]
    }
});

module.exports = mongoose.model('Categoria', categoriaSchema);