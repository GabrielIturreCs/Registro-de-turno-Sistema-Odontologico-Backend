require('dotenv').config(); // Cargar variables de entorno
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require("dotenv");
const {mongoose} = require('./database')

// Cargar variables de entorno
dotenv.config();

var app = express();

app.use(express.json());

// Configurar cookie-parser con secret para cookies firmadas
app.use(cookieParser(process.env.COOKIE_SECRET));

// Configurar CORS con credentials habilitado
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true, // Habilitar cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
}));
 // cargar los modulos de routes
app.use('/api/usuario', require('./routes/auth.route.js'));
app.use('/api/dentista', require('./routes/dentista.route.js'));
app.use('/api/paciente', require('./routes/paciente.route.js'));
app.use('/api/turno', require('./routes/turnos.route.js'));
app.use('/api/tratamiento', require('./routes/tratamientos.route.js'));
app.use('/api/mp', require('./routes/mp.route.js'));
app.use('/api/payment-callback', require('./routes/payment-callback.route.js'));

app.set('port',process.env.PORT || 3000);


app.listen(app.get('port'), () =>{
console.log('Server started on port: ', app.get('port'))

});

