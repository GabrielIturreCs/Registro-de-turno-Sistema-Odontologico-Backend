const express = require('express');
const router = express.Router();
const TurnoCtrl = require('../controllers/turnos.controller.js')

/**
 * @swagger
 * /turnos:
 *   get:
 *     summary: Obtiene todos los turnos
 *     tags: [Turnos]
 *     responses:
 *       200:
 *         description: Lista de turnos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

router.get('/',TurnoCtrl.getTurnos);
router.get('/:id',TurnoCtrl.getTurnosById);
router.delete('/:id',TurnoCtrl.deleteTurno);

/**
 * @swagger
 * /turnos/{id}:
 *   put:
 *     summary: Actualiza un turno existente
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Turno actualizado exitosamente
 *       404:
 *         description: Turno no encontrado
 */

router.put('/:id',TurnoCtrl.updateTurno);

/**
 * @swagger
 * /turnos:
 *   post:
 *     summary: Crea un nuevo turno
 *     tags: [Turnos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pacienteId:
 *                 type: string
 *               dentistaId:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               motivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *       400:
 *         description: Error en los datos enviados
 */

router.post('/',TurnoCtrl.createTurno);
router.delete('/:id/cancelar', TurnoCtrl.cancelarTurnoYReembolso);

module.exports = router;