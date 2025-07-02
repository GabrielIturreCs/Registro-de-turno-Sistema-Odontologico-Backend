const Turno = require('../models/turno.js')
const Tratamiento = require('../models/tratamiento.js')
const Paciente = require('../models/paciente.js')
const TurnoCtrl = {}

TurnoCtrl.getTurnos = async(req, res) => {
    try {
        var turnos = await Turno.find().sort({ fechaCreacion: -1 });
        res.json(turnos);
    } catch(err) {
        res.status(500).json({
            'status': '0',
            'msg': 'Error al obtener turnos',
            'error': err.message
        });
    }
}

TurnoCtrl.getTurnosById = async(req, res) => {
    try {
        const turno = await Turno.findById(req.params.id);
        if (!turno) {
            return res.status(404).json({
                'status': '0',
                'msg': 'Turno no encontrado'
            });
        }
        res.json(turno);
    } catch(err) {
        res.status(404).json({
            'status': '0',
            'msg': 'Turno no encontrado'
        });
    }
}

TurnoCtrl.createTurno = async(req, res) => {
    try {
        // Generar número de turno automáticamente
        const ultimoTurno = await Turno.findOne({ nroTurno: { $exists: true } }).sort({ nroTurno: -1 });
        const nroTurno = ultimoTurno && ultimoTurno.nroTurno ? ultimoTurno.nroTurno + 1 : 1;

        // Validar campos requeridos
        if (!req.body.pacienteId || !req.body.tratamientoId) {
            return res.status(400).json({
                'status': '0',
                'msg': 'pacienteId y tratamientoId son requeridos'
            });
        }

        // Buscar información del tratamiento
        let tratamientoInfo = null;
        if(req.body.tratamientoId) {
            tratamientoInfo = await Tratamiento.findById(req.body.tratamientoId);
            if (!tratamientoInfo) {
                return res.status(400).json({
                    'status': '0',
                    'msg': 'Tratamiento no encontrado'
                });
            }
        }

        // Buscar información del paciente
        let pacienteInfo = null;
        if(req.body.pacienteId) {
            pacienteInfo = await Paciente.findById(req.body.pacienteId);
            if (!pacienteInfo) {
                return res.status(400).json({
                    'status': '0',
                    'msg': 'Paciente no encontrado'
                });
            }
        }

        const turnoData = {
            nroTurno: nroTurno,
            fecha: req.body.fecha,
            hora: req.body.hora,
            estado: req.body.estado || 'reservado',
            pacienteId: req.body.pacienteId,
            tratamientoId: req.body.tratamientoId,
            observaciones: req.body.observaciones || ''
        };

        // Agregar información del tratamiento
        if(tratamientoInfo) {
            turnoData.tratamiento = tratamientoInfo.descripcion || tratamientoInfo.nombre || 'Sin descripción';
            turnoData.precioFinal = tratamientoInfo.precio || tratamientoInfo.historial || 0;
            turnoData.duracion = tratamientoInfo.duracion || '30 min';
        } else {
            turnoData.tratamiento = 'Sin descripción';
            turnoData.precioFinal = 0;
            turnoData.duracion = '30 min';
        }

        // Agregar información del paciente
        if(pacienteInfo) {
            turnoData.nombre = pacienteInfo.nombre || 'Sin nombre';
            turnoData.apellido = pacienteInfo.apellido || 'Sin apellido';
        } else {
            turnoData.nombre = 'Sin nombre';
            turnoData.apellido = 'Sin apellido';
        }

        console.log('Datos del turno a crear:', turnoData);

        const turno = new Turno(turnoData);
        await turno.save();
        res.status(201).json({
            'status': '1',
            'msg': 'Turno creado correctamente',
            'turno': turno
        });
    } catch(err) {
        console.error('Error al crear turno:', err);
        console.error('Stack trace:', err.stack);
        res.status(400).json({
            'status': '0',
            'msg': 'Error al crear el turno',
            'error': err.message
        });
    }
}

TurnoCtrl.updateTurno = async(req, res) => {
    try {
        const turnoId = req.params.id;
        const { _id, ...datosActualizadoTurno } = req.body;
        const turnoActualizado = await Turno.findByIdAndUpdate(
            turnoId,
            { $set: datosActualizadoTurno },
            { new: true, runValidators: true }
        );
        
        if(!turnoActualizado) {
            return res.status(404).json({
                'status': '0',
                'msg': 'Turno no encontrado'
            });
        }
        
        res.json({
            'status': '1',
            'msg': 'Turno actualizado correctamente',
            'turno': turnoActualizado
        });
    } catch(err) {
        res.status(404).json({
            'status': '0',
            'msg': 'Error al actualizar turno',
            'error': err.message
        });
    }
}

TurnoCtrl.deleteTurno = async(req, res) => {
    try {
        await Turno.deleteOne({ _id: req.params.id });
        res.json({
            'status': '1',
            'msg': 'Turno eliminado correctamente'
        });
    } catch(err) {
        res.status(404).json({
            'status': '0',
            'msg': 'Turno no encontrado'
        });
    }
}

module.exports = TurnoCtrl;