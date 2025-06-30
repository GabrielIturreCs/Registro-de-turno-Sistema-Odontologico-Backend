const express = require('express');
const router = express.Router();
const TratamientoCtrl = require('../controllers/tratamientos.controller.js');

router.get('/', TratamientoCtrl.getTratamiento);
router.post('/', TratamientoCtrl.createTratamiento);
router.get('/:id', TratamientoCtrl.getTratamientoById);
router.put('/:id', TratamientoCtrl.updateTratamiento);
router.delete('/:id', TratamientoCtrl.deleteTratamiento);


module.exports = router;