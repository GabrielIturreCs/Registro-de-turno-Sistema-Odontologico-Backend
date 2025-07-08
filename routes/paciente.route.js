const express = require('express');
const router = express.Router();
const pacienteCtrl = require('../controllers/paciente.controller.js');
const { authenticateToken } = require('../helpers/jwtHelper');

/**
 * @swagger
 * /pacientes:
 *   get:
 *     summary: Obtiene todos los pacientes
 *     tags: [Pacientes]
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

/**
 * @swagger
 * /pacientes/{id}:
 *   get:
 *     summary: Obtiene un paciente por ID
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Paciente encontrado
 *       404:
 *         description: Paciente no encontrado
 */

/**
 * @swagger
 * /pacientes:
 *   post:
 *     summary: Crea un nuevo paciente
 *     tags: [Pacientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente creado exitosamente
 *       400:
 *         description: Error en los datos enviados
 */

/**
 * @swagger
 * /pacientes/{id}:
 *   put:
 *     summary: Actualiza un paciente existente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paciente actualizado exitosamente
 *       404:
 *         description: Paciente no encontrado
 */

/**
 * @swagger
 * /pacientes/{id}:
 *   delete:
 *     summary: Elimina un paciente
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Paciente eliminado exitosamente
 *       404:
 *         description: Paciente no encontrado
 */

router.put('/:id', pacienteCtrl.updatePaciente);
router.get('/', pacienteCtrl.getPacientes);
router.get('/by-user/:userId', pacienteCtrl.getPacienteByUserId);
router.get('/:id', pacienteCtrl.getPacienteById);
router.post('/', pacienteCtrl.createPaciente);
router.delete('/:id', pacienteCtrl.deletePaciente);
router.get('/:id/odontograma', authenticateToken, pacienteCtrl.getOdontograma);
router.put('/:id/odontograma', authenticateToken, pacienteCtrl.updateOdontograma);

module.exports = router;