const express = require('express');
const router = express.Router();
const pacienteCtrl = require('../controllers/paciente.controller.js');
const { authenticateToken } = require('../helpers/jwtHelper');

router.put('/:id', pacienteCtrl.updatePaciente);
router.get('/', pacienteCtrl.getPacientes);
router.get('/by-user/:userId', pacienteCtrl.getPacienteByUserId);
router.get('/:id', pacienteCtrl.getPacienteById);
router.post('/', pacienteCtrl.createPaciente);
router.delete('/:id', pacienteCtrl.deletePaciente);
router.get('/:id/odontograma', authenticateToken, pacienteCtrl.getOdontograma);
router.put('/:id/odontograma', authenticateToken, pacienteCtrl.updateOdontograma);

module.exports = router;