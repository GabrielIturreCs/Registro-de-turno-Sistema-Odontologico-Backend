const express = require('express');
const router = express.Router(); 

//defino controlador para el manejo de CRUD 
const authCtrl = require('../controllers/auth.controller'); 

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - nombre
 *         - apellido
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Contraseña del usuario (mínimo 6 caracteres)
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         apellido:
 *           type: string
 *           description: Apellido del usuario
 *         rol:
 *           type: string
 *           enum: [paciente, dentista, administrador]
 *           default: paciente
 *           description: Rol del usuario
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         password:
 *           type: string
 *           description: Contraseña del usuario
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *         token:
 *           type: string
 *           description: JWT token para autenticación
 *         usuario:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             email:
 *               type: string
 *             nombre:
 *               type: string
 *             apellido:
 *               type: string
 *             rol:
 *               type: string
 *         message:
 *           type: string
 *           description: Mensaje descriptivo
 */

/**
 * @swagger
 * /api/usuario:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *           example:
 *             email: "usuario@ejemplo.com"
 *             password: "123456"
 *             nombre: "Juan"
 *             apellido: "Pérez"
 *             rol: "paciente"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos inválidos o faltantes
 *       409:
 *         description: El usuario ya existe en el sistema
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authCtrl.registerUsuario); 

/**
 * @swagger
 * /api/usuario/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Autenticación]
 *     description: Autentica un usuario y devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "usuario@ejemplo.com"
 *             password: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciales inválidas
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', authCtrl.loginUsuario); 

//exportacion del modulo de rutas 
module.exports = router;