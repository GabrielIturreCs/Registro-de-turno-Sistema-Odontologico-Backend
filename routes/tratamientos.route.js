const express = require('express');
const router = express.Router();
const TratamientoCtrl = require('../controllers/tratamientos.controller.js');

/**
 * @swagger
 * /tratamientos:
 *   get:
 *     summary: Obtiene todos los tratamientos
 *     tags: [Tratamientos]
 *     responses:
 *       200:
 *         description: Lista de tratamientos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

router.get('/', TratamientoCtrl.getTratamiento);
router.post('/', TratamientoCtrl.createTratamiento);

/**
 * @swagger
 * /tratamientos/{id}:
 *   get:
 *     summary: Obtiene un tratamiento por ID
 *     tags: [Tratamientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tratamiento
 *     responses:
 *       200:
 *         description: Tratamiento encontrado
 *       404:
 *         description: Tratamiento no encontrado
 */

router.get('/:id', TratamientoCtrl.getTratamientoById);

/**
 * @swagger
 * /tratamientos:
 *   post:
 *     summary: Crea un nuevo tratamiento
 *     tags: [Tratamientos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tratamiento creado exitosamente
 *       400:
 *         description: Error en los datos enviados
 */

router.put('/:id', TratamientoCtrl.updateTratamiento);

/**
 * @swagger
 * /tratamientos/{id}:
 *   put:
 *     summary: Actualiza un tratamiento existente
 *     tags: [Tratamientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tratamiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tratamiento actualizado exitosamente
 *       404:
 *         description: Tratamiento no encontrado
 */

router.delete('/:id', TratamientoCtrl.deleteTratamiento);

/**
 * @swagger
 * /tratamientos/{id}:
 *   delete:
 *     summary: Elimina un tratamiento
 *     tags: [Tratamientos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tratamiento
 *     responses:
 *       200:
 *         description: Tratamiento eliminado exitosamente
 *       404:
 *         description: Tratamiento no encontrado
 */

module.exports = router;