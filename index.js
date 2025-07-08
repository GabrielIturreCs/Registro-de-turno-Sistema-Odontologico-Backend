/***********************
 *  DENTAL SYSTEM API  *
 ***********************/
// Configurar dotenv según el entorno
const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
require('dotenv').config({ path: envFile });
console.log(`🔧 Loading environment from: ${envFile}`);

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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

console.log('🌐 CORS Configuration:');
console.log('- Allowed Origins:', allowedOrigins);
console.log('- Frontend URL from env:', process.env.FRONTEND_URL);

app.use(cors({
    origin: function (origin, callback) {
        console.log('🔍 CORS request from origin:', origin);
        if (!origin || allowedOrigins.includes(origin)) {
            console.log('✅ CORS allowed for origin:', origin);
            callback(null, true);
        } else {
            console.log('🚫 CORS blocked:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
 *  (Handled by routes) *
 ***********************/
// Payment callbacks are handled by ./routes/payment-callback.route.js
// No duplicate routes here to avoid conflicts

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
    
    // Payment callback routes - ACTIVADAS para registrar pagos (NUEVO ARCHIVO)
    app.use('/api/payment-callback', require('./routes/payment-callback-new.route.js'));
    console.log('✅ Payment callback routes loaded (NEW VERSION)');
    
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

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema Odontológico',
      version: '1.0.0',
      description: 'Documentación de la API del sistema de gestión odontológica',
    },
    servers: [
      {
        url: 'https://registro-de-turno-sistema-odontologico.onrender.com/api',
        description: 'Servidor de producción',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));