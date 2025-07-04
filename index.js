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
console.log('🔄 Loading routes...');
app.use('/api/usuario', require('./routes/auth.route.js'));
console.log('✅ Auth routes loaded');
app.use('/api/dentista', require('./routes/dentista.route.js'));
console.log('✅ Dentista routes loaded');
app.use('/api/paciente', require('./routes/paciente.route.js'));
console.log('✅ Paciente routes loaded');
app.use('/api/turno', require('./routes/turnos.route.js'));
console.log('✅ Turno routes loaded');
app.use('/api/tratamiento', require('./routes/tratamientos.route.js'));
console.log('✅ Tratamiento routes loaded');
app.use('/api/mp', require('./routes/mp.route.js'));
console.log('✅ MercadoPago routes loaded');
app.use('/api/payment-callback', require('./routes/payment-callback.route.js'));
console.log('✅ Payment callback routes loaded');

app.set('port',process.env.PORT || 3000);


app.listen(app.get('port'), () =>{
console.log('Server started on port: ', app.get('port'))

});

