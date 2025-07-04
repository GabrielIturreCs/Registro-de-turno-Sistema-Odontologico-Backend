const express = require('express')
const cors = require('cors')
const dotenv = require("dotenv");
const {mongoose} = require('./database')

// Cargar variables de entorno
dotenv.config();

var app = express();

app.use(express.json());
app.use(cors({origin: 'http://localhost:4200'}));
 // cargar los modulos de routes
app.use('/api/usuario', require('./routes/auth.route.js'));
app.use('/api/dentista', require('./routes/dentista.route.js'));
app.use('/api/paciente', require('./routes/paciente.route.js'));
app.use('/api/turno', require('./routes/turnos.route.js'));
app.use('/api/tratamiento', require('./routes/tratamientos.route.js'));
app.use('/api/mp', require('./routes/mp.route.js'));

app.set('port',process.env.PORT || 3000);


app.listen(app.get('port'), () =>{
console.log('Server started on port: ', app.get('port'))

});

