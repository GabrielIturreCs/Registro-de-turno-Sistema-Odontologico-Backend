const mongoose = require('mongoose');

// Obtener la URI de MongoDB desde las variables de entorno
const URI = process.env.MONGODB_URI || 'mongodb://localhost/consultorio';

// Configurar opciones de conexión para MongoDB Atlas
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout después de 5s en lugar de 30s
  socketTimeoutMS: 45000, // Cerrar sockets después de 45s de inactividad
  family: 4 // Usar IPv4, evitar IPv6
};

// Conectar a MongoDB
mongoose.connect(URI, options)
  .then(db => {
    console.log('✅ Database is connected to MongoDB Atlas');
    console.log('📍 Database name:', mongoose.connection.db.databaseName);
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// Manejar eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB Atlas');
});

// Cerrar la conexión cuando la aplicación se cierre
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB Atlas connection closed due to application termination');
  process.exit(0);
});

module.exports = mongoose;