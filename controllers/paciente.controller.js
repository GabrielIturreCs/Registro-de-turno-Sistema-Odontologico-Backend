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

pacienteCtrl.createPaciente = async (req, res) =>{
     try{
       const paciente = new Paciente(req.body);
       await paciente.save();
         res.status(201).json({
            'status':'1',
            'msg':'paciente creado correctamente',
            'paciente':paciente
         })
     }catch(err){
        res.status(400).json({
            'status':'0',
            'msg':'Error al crear el paciente'
        })
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

module.exports = pacienteCtrl;