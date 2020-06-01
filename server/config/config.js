//===============
//Puerto
//===============
process.env.PORT = process.env.PORT || 3000;

//===============
//Entorno
//===============

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//===============
//Expiración token
//===============

process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//===============
//Seed
//===============

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

//===============
//Google ClientID
//===============

process.env.CLIENT_ID = process.env.CLIENT_ID || '725178665333-dsfsuonrjddgssfvai1i13juc5d8gbfh.apps.googleusercontent.com';

//===============
//Base de datos
//===============

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;