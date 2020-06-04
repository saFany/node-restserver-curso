const jwt = require('jsonwebtoken');
//====================
//Verifica token
//====================

let verificaToken = (req, rest, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return rest.status(401).json({
                ok: false,
                err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
};
//====================
//Verifica rol
//====================

let verificaRol = (req, res, next) => {
        let usuario = req.usuario;
        if (usuario.role === 'ADMIN_ROLE') {
            next();
        } else {
            return res.json({
                ok: false,
                err: {
                    message: 'El usuario no es administrador'
                }
            });
        }
    }
    //====================
    //Verifica token por imagen
    //====================

let verificaTokenImg = (req, rest, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return rest.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido',
                    err
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
};
module.exports = {
    verificaToken,
    verificaRol,
    verificaTokenImg
}