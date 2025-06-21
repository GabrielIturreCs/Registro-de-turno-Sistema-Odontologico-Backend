const express = require('express')
const cors = require('cors')
const {mongoose} = require('./database.js')

var app = express();

app.use(express.json());
app.use(cors({origin: 'http://localhost:4200'}));
 // cargar los modulos de routes

 app.set('port', 3000);

 app.listen(app.get('port'), () =>{
    console.log('Server started on port: ', app.get('port'))
 });