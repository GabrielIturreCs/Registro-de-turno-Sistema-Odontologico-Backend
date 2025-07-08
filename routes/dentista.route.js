const express = require('express');
const router = express.Router();
const DentistaCtrl = require('../controllers/dentista.controller.js');

/**
 * @swagger
 * /dentistas:
 *   get:
 *     summary: Obtiene todos los dentistas
 *     tags: [Dentistas]
 *     responses:
 *       200:
 *         description: Lista de dentistas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

/**
 * @swagger
 * /dentistas/{id}:
 *   get:
 *     summary: Obtiene un dentista por ID
 *     tags: [Dentistas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del dentista
 *     responses:
 *       200:
 *         description: Dentista encontrado
 *       404:
 *         description: Dentista no encontrado
 */

/**
 * @swagger
 * /dentistas:
 *   post:
 *     summary: Crea un nuevo dentista
 *     tags: [Dentistas]
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
 *               especialidad:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dentista creado exitosamente
 *       400:
 *         description: Error en los datos enviados
 */

/**
 * @swagger
 * /dentistas/{id}:
 *   put:
 *     summary: Actualiza un dentista existente
 *     tags: [Dentistas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del dentista
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
 *               especialidad:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dentista actualizado exitosamente
 *       404:
 *         description: Dentista no encontrado
 */

/**
 * @swagger
 * /dentistas/{id}:
 *   delete:
 *     summary: Elimina un dentista
 *     tags: [Dentistas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del dentista
 *     responses:
 *       200:
 *         description: Dentista eliminado exitosamente
 *       404:
 *         description: Dentista no encontrado
 */

router.put('/:id', DentistaCtrl.updateDentista);
router.get('/:id', DentistaCtrl.getDentistaById);
router.delete('/:id', DentistaCtrl.deleteDentista);
router.get('/', DentistaCtrl.getDentistas);
router.post('/', DentistaCtrl.createDentista);

module.exports = router;