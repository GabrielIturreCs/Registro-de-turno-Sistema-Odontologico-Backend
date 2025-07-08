const express = require('express')
const router = express.Router();
const mpCtrl = require('../controllers/mp.controller.js')

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentRequest:
 *       type: object
 *       required:
 *         - amount
 *         - description
 *       properties:
 *         amount:
 *           type: number
 *           description: Monto del pago
 *         description:
 *           type: string
 *           description: Descripción del pago
 *         payer_email:
 *           type: string
 *           format: email
 *           description: Email del pagador
 *     SubscriptionRequest:
 *       type: object
 *       required:
 *         - amount
 *         - description
 *       properties:
 *         amount:
 *           type: number
 *           description: Monto de la suscripción
 *         description:
 *           type: string
 *           description: Descripción de la suscripción
 *         payer_email:
 *           type: string
 *           format: email
 *           description: Email del suscriptor
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         payment_url:
 *           type: string
 *           description: URL de pago de MercadoPago
 *         payment_id:
 *           type: string
 *           description: ID del pago
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/mp/payment:
 *   post:
 *     summary: Crear enlace de pago
 *     tags: [MercadoPago]
 *     description: Genera un enlace de pago único en MercadoPago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *           example:
 *             amount: 1000
 *             description: "Pago por consulta odontológica"
 *             payer_email: "paciente@ejemplo.com"
 *     responses:
 *       200:
 *         description: Enlace de pago creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/payment', mpCtrl.getPaymentLink);

/**
 * @swagger
 * /api/mp/subscription:
 *   post:
 *     summary: Crear enlace de suscripción
 *     tags: [MercadoPago]
 *     description: Genera un enlace de suscripción recurrente en MercadoPago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionRequest'
 *           example:
 *             amount: 500
 *             description: "Suscripción mensual"
 *             payer_email: "paciente@ejemplo.com"
 *     responses:
 *       200:
 *         description: Enlace de suscripción creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/subscription', mpCtrl.getSubscriptionLink);

module.exports = router;