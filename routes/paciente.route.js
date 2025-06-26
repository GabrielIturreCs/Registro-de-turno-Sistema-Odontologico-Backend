const express = require('express');
const router = express.Router();
const pacienteCtrl = require('../controllers/paciente.controller.js');

router.put('/:id', pacienteCtrl.updatePaciente);
router.get('/', pacienteCtrl.getPacientes);
router.get('/:id', pacienteCtrl.getPacienteById);
router.post('/', pacienteCtrl.createPaciente);
router.delete('/:id', pacienteCtrl.deletePaciente);


module.exports = router;