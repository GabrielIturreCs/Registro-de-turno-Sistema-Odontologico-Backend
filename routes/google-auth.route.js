const express = require('express');
const router = express.Router();
const googleAuthCtrl = require('../controllers/google-auth.controller');

console.log('🔗 Google Auth routes loaded');

/**
 * @swagger
 * components:
 *   schemas:
 *     GoogleTokenRequest:
 *       type: object
 *       required:
 *         - token
 *       properties:
 *         token:
 *           type: string
 *           description: Token de Google OAuth
 *     GoogleAuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *           description: JWT token del sistema
 *         usuario:
 *           type: object
 *           description: Datos del usuario autenticado
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/google-auth/auth-url:
 *   get:
 *     summary: Obtener URL de autorización de Google
 *     tags: [Google Auth]
 *     description: Genera la URL para iniciar el flujo de autenticación con Google
 *     responses:
 *       200:
 *         description: URL de autorización generada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authUrl:
 *                   type: string
 *                   description: URL para redirigir al usuario a Google
 *       500:
 *         description: Error al generar la URL de autorización
 */
router.get('/auth-url', googleAuthCtrl.getGoogleAuthUrl);

/**
 * @swagger
 * /api/google-auth/verify-token:
 *   post:
 *     summary: Verificar token de Google
 *     tags: [Google Auth]
 *     description: Verifica un token de Google OAuth y autentica al usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleTokenRequest'
 *           example:
 *             token: "google_oauth_token_here"
 *     responses:
 *       200:
 *         description: Token verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoogleAuthResponse'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/verify-token', googleAuthCtrl.verifyGoogleToken);

/**
 * @swagger
 * /api/google-auth/callback:
 *   get:
 *     summary: Callback de Google OAuth
 *     tags: [Google Auth]
 *     description: Maneja el callback de Google OAuth después de la autorización
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Código de autorización de Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Estado de la solicitud
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GoogleAuthResponse'
 *       400:
 *         description: Código de autorización inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/callback', googleAuthCtrl.handleGoogleCallback);

module.exports = router;
