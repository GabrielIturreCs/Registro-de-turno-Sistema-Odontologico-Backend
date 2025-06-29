const express = require('express');
const router = express.Router();
const TurnoCtrl = require('../controllers/turnos.controller.js')

router.get('/',TurnoCtrl.getTurnos);
router.get('/:id',TurnoCtrl.getTurnosById);
router.delete('/:id',TurnoCtrl.deleteTurno);
router.put('/:id',TurnoCtrl.updateTurno);
router.post('/',TurnoCtrl.createTurno);

module.exports = router;