/***********************
 *  DENTAL SYSTEM API  *
 ***********************/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('./database');

const app = express();

/***********************
 *  CORS Configuration *
 ***********************/
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    'https://registrar-turno-sistema-clinico.onrender.com',
    'https://accounts.google.com',
    'https://www.googleapis.com',
    'http://localhost:4200'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('🚫 CORS blocked:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie']
}));

/***********************
 *  Basic Middleware   *
 ***********************/
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

/***********************
 *  Test Route         *
 ***********************/
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API funcionando correctamente',
        timestamp: new Date(),
        env: process.env.NODE_ENV || 'development'
    });
});

/***********************
 *  Payment Callbacks  *
 ***********************/
app.get('/api/payment-callback/success', (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com'}/vistaPaciente`);
});

app.get('/api/payment-callback/failure', (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com'}/vistaPaciente`);
});

app.get('/api/payment-callback/pending', (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com'}/vistaPaciente`);
});

/***********************
 *  API Routes         *
 ***********************/
try {
    console.log('🔄 Loading routes...');
    
    // Cargar rutas una por una para identificar problemas
    app.use('/api/usuario', require('./routes/auth.route.js'));
    console.log('✅ Auth routes loaded');
    
    app.use('/api/google-auth', require('./routes/google-auth.route.js'));
    console.log('✅ Google Auth routes loaded');
    
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
    
    // Comentar estas rutas por ahora para identificar el problema
    // app.use('/api/payment', require('./routes/payment.route.js'));
    // console.log('✅ Payment routes loaded');
    
    // app.use('/api/payment-callback', require('./routes/payment-callback.route.js'));
    // console.log('✅ Payment callback routes loaded');
    
    console.log('✅ All routes loaded successfully');
    
} catch (error) {
    console.error('❌ Error loading routes:', error);
    process.exit(1);
}

/***********************
 *  Start Server       *
 ***********************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`🔑 Google Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET'}`);
    console.log('✅ Server ready to accept requests');
});