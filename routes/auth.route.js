const express = require('express');
const router = express.Router(); 

//defino controlador para el manejo de CRUD 
const authCtrl = require('../controllers/auth.controller'); 

// definiendo rutas 
router.post('/', authCtrl.registerUsuario); 
router.post('/login', authCtrl.loginUsuario); 

//exportacion del modulo de rutas 
module.exports = router;