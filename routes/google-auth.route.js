const express = require('express');
const router = express.Router();
const googleAuthCtrl = require('../controllers/google-auth.controller');

console.log('🔗 Google Auth routes loaded');

// Ruta para obtener URL de autorización de Google
router.get('/auth-url', googleAuthCtrl.getGoogleAuthUrl);

// Ruta para verificar token de Google (usado por el frontend)
router.post('/verify-token', googleAuthCtrl.verifyGoogleToken);

// Ruta de callback de Google OAuth
router.get('/callback', googleAuthCtrl.handleGoogleCallback);

module.exports = router;
