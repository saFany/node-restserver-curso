const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let leyenda = 'Este campo es requerido';
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un ROL válido'
};
let Schema = mongoose.Schema;
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, leyenda]
    },
    email: {
        type: String,
        required: [true, leyenda],
        unique: true
    },
    password: {
        type: String,
        required: [true, leyenda]
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: [true, leyenda],
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = this.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe de ser único'
});
module.exports = mongoose.model('Usuario', usuarioSchema);