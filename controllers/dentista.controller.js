const Dentista = require('../models/dentista.js');
const DentistaCtrl = {};

DentistaCtrl.getDentistas = async(req,res) => {
    var dentistas = await Dentista.find();
    res.json(dentistas);
}

DentistaCtrl.getDentistaById = async (req, res) =>{
    try{
      const dentistaEncontrado = await Dentista.findById(req.params.id);
      res.json(dentistaEncontrado);
    }catch(err){
        res.status(404).json({
            'status':'0',
            'msg':'Dentista no encontrado'
        })
    }
}

DentistaCtrl.createDentista = async(req,res) => {
    try{
    const dentista = new Dentista(req.body);
    await dentista.save();
    res.status(201).json({
         'status':'1',
         'msg':'Dentista creado correctamente',
         'dentista':dentista
    });
    }catch(err){
        res.status(400).json({
            'status':'0',
            'msg': 'Error al crear el dentista'
        }
        );
    }
}

DentistaCtrl.deleteDentista = async (req,res) => {
    try{
        await Dentista.deleteOne({_id: req.params.id});
        res.json({
            'status':'1',
            'msg':'Dentista eliminado correctamente'
        })
    }catch(err){
        res.json({
            'status':'0',
            'msg':'Dentista no encontrado'
        })
    }
}

DentistaCtrl.updateDentista = async (req, res) => {
    try{
      const dentistaId = req.params.id;
      const {_id, ...datosActualizadosDentista} = req.body;
      const dentistaActualizado = await Dentista.findByIdAndUpdate(
        dentistaId,
        {$set: datosActualizadosDentista},
        {new: true, runValidators: true}
      );

      if(!dentistaActualizado){
        return res.status(404).json({
            'status':'0',
            'msg':'Dentista no encontrado'
        });
      }
        res.json({
            'status':'1',
            'msg':'Dentista actualizado correctamente',
            'dentista': dentistaActualizado
        });
    }catch(err){
        res.json({
            'status':'0',
            'msg':'Error al actualizar el dentista'
        })
    }
}
module.exports = DentistaCtrl;