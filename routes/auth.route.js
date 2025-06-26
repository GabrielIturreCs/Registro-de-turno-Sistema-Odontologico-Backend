const express = require('express');
const router = express.Router(); 
const { verifyToken } = require('../middleware/auth.middleware');

//defino controlador para el manejo de CRUD 
const authCtrl = require('../controllers/auth.controller'); 

// definiendo rutas 
router.post('/register', authCtrl.registerUsuario); 
router.post('/login', authCtrl.loginUsuario);
router.get('/confirmar-email', authCtrl.confirmarEmail); 

router.get('/profile', verifyToken, authCtrl.getProfile);
router.post('/google-login', authCtrl.googleLogin);
//exportacion del modulo de rutas 
module.exports = router;