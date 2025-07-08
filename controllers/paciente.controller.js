const Paciente = require('../models/paciente');
const pacienteCtrl = {}

pacienteCtrl.getPacientes = async (req, res) => {
    var pacientes = await Paciente.find();
    res.json(pacientes);
}

pacienteCtrl.getPacienteById = async (req, res) => {
    try{
       const paciente = await Paciente.findById(req.params.id);
       res.status(200).json({
        'status':'1',
        'msg':'paciente encontrado',
        'paciente':paciente
       })
    }catch(err){
        res.status(404).json({
          'status':'0',
          'msg': 'paciente no encontrado'
        })
    }
}

pacienteCtrl.getPacienteByUserId = async (req, res) => {
    try {
        const paciente = await Paciente.findOne({ userId: req.params.userId });
        if (!paciente) {
            return res.status(404).json({
                'success': false,
                'msg': 'Paciente no encontrado para este usuario'
            });
        }
        res.status(200).json({
            'success': true,
            'msg': 'Paciente encontrado',
            'patient': paciente
        });
    } catch (err) {
        res.status(500).json({
            'success': false,
            'msg': 'Error al buscar paciente'
        });
    }
}

pacienteCtrl.createPaciente = async (req, res) =>{
     try{
       console.log('📥 Datos recibidos para crear paciente:', req.body);
       
       // Validar que todos los campos requeridos estén presentes
       const requiredFields = ['nombre', 'apellido', 'telefono', 'direccion', 'dni', 'email', 'obraSocial', 'userId'];
       for (const field of requiredFields) {
         if (!req.body[field] || req.body[field].trim() === '') {
           console.log(`❌ Campo faltante o vacío: ${field}, valor:`, req.body[field]);
           return res.status(400).json({
             'status': '0',
             'msg': `El campo ${field} es requerido y no puede estar vacío`,
             'success': false,
             'missingField': field
           });
         }
       }

       // Verificar si ya existe un paciente con el mismo userId
       const existingPaciente = await Paciente.findOne({ userId: req.body.userId });
       if (existingPaciente) {
         return res.status(400).json({
           'status': '0',
           'msg': 'Ya existe un paciente asociado a este usuario',
           'success': false
         });
       }

       // Verificar si ya existe un paciente con el mismo DNI
       const existingDni = await Paciente.findOne({ dni: req.body.dni });
       if (existingDni) {
         return res.status(400).json({
           'status': '0',
           'msg': 'Ya existe un paciente con este DNI',
           'success': false
         });
       }

       const paciente = new Paciente(req.body);
       await paciente.save();
       
       console.log('✅ Paciente creado exitosamente:', paciente._id);
       
       res.status(201).json({
         'status': '1',
         'msg': 'Paciente creado correctamente',
         'paciente': paciente,
         'success': true,
         '_id': paciente._id
       });
     }catch(err){
        console.error('❌ Error creando paciente:', err);
        console.error('❌ Error message:', err.message);
        console.error('❌ Error stack:', err.stack);
        
        let errorMessage = 'Error al crear el paciente';
        
        // Manejar errores específicos de MongoDB
        if (err.code === 11000) {
          if (err.keyPattern?.userId) {
            errorMessage = 'Ya existe un paciente asociado a este usuario';
          } else if (err.keyPattern?.dni) {
            errorMessage = 'Ya existe un paciente con este DNI';
          } else if (err.keyPattern?.email) {
            errorMessage = 'Ya existe un paciente con este email';
          } else {
            errorMessage = 'Datos duplicados encontrados';
          }
        } else if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          errorMessage = `Errores de validación: ${errors.join(', ')}`;
        } else if (err.name === 'CastError') {
          errorMessage = 'ID de usuario inválido';
        }
        
        res.status(400).json({
            'status': '0',
            'msg': errorMessage,
            'success': false,
            'error': err.message
        });
     }
}

pacienteCtrl.deletePaciente = async (req, res) => {
    try{
      await Paciente.deleteOne({_id: req.params.id});
      res.json({
          'status':'1',
          'msg':'paciente eliminado correctamente'
      })
    }catch(err){
        res.status(404).json({
            'status':'0',
            'msg':'paciente no encontrado'
        })
    }
}

pacienteCtrl.updatePaciente = async (req, res) => {
    try{
      const idPaciente = req.params.id;
      const {_id, ...datosActualizadosPaciente} = req.body;
      const pacienteActualizado = await Paciente.findByIdAndUpdate(
        idPaciente,
        {$set: datosActualizadosPaciente},
        {new: true, runValidators: true}
      );
      if(!pacienteActualizado){
        return res.status(404).json({
            'status':'0',
            'msg':'paciente no encontrado'
        });
      }
      res.json({
          'status':'1',
          'msg':'paciente actualizado correctamente',
          'paciente':pacienteActualizado
      });
    }catch(err){
        res.json({
            'status':'0',
            'msg':'Error al actualizar el paciente'
        })
    }
}

pacienteCtrl.getOdontograma = async (req, res) => {
    try {
        const paciente = await Paciente.findById(req.params.id);
        if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
        res.json(paciente.odontograma);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el odontograma' });
    }
};

pacienteCtrl.updateOdontograma = async (req, res) => {
    try {
        const { odontograma } = req.body;
        const paciente = await Paciente.findByIdAndUpdate(
            req.params.id,
            { odontograma },
            { new: true }
        );
        if (!paciente) return res.status(404).json({ error: 'Paciente no encontrado' });
        res.json(paciente.odontograma);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el odontograma' });
    }
};

module.exports = pacienteCtrl;