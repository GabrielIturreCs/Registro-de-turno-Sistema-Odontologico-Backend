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

// Ruta de prueba simple
app.get('/api/test', (req, res) => {
    res.json({ message: 'Test route working', timestamp: new Date() });
});

// Ruta de callback básica SIN dependencias
app.get('/api/payment-callback/failure', (req, res) => {
    console.log('❌ Payment FAILURE - Basic route');
    res.redirect(`${process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com'}/vistaPaciente`);
});

app.get('/api/payment-callback/success', (req, res) => {
    console.log('🎉 Payment SUCCESS - Basic route');
    res.redirect(`${process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com'}/vistaPaciente`);
});

app.get('/api/payment-callback/pending', (req, res) => {
    console.log('⏳ Payment PENDING - Basic route');
    res.redirect(`${process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com'}/vistaPaciente`);
});

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

app.set('port',process.env.PORT || 3000);


app.listen(app.get('port'), () =>{
console.log('Server started on port: ', app.get('port'))

});

