require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { mongoose } = require('./database'); // Asumo que esta ruta a tu conexión DB es correcta

const app = express();

// Middlewares
app.use(express.json()); // Para parsear el body de las solicitudes como JSON
app.use(cors({ origin: 'http://localhost:4200' })); // Configuración de CORS para tu frontend Angular

// Cargar los módulos de rutas
// Aquí cargas todas las rutas definidas en auth.routes.js bajo el prefijo /api/auth
const authRoutes = require('./routes/auth.route');
app.use('/api/auth', authRoutes);

// Configuración del puerto
app.set('port', process.env.PORT || 3000);

// Iniciar el servidor
app.listen(app.get('port'), () => {
    console.log('Server started on port: ', app.get('port'));
    console.log('Backend URL: http://localhost:' + app.get('port'));
    console.log('Frontend URL (confirmación): http://localhost:4200'); // Solo para referencia
});

