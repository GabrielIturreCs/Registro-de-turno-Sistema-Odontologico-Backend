const tratamiento = require('../models/tratamiento.js');
const Tratamiento = require('../models/tratamiento.js');
const TratamientoCtrl = {};

TratamientoCtrl.getTratamiento = async(req, res) =>{
    var tratamiento = await Tratamiento.find();
    res.json(tratamiento);
}

TratamientoCtrl.createTratamiento = async(req, res) =>{
    try{
        const tratamiento = new Tratamiento(req.body);
        await tratamiento.save();
        res.status(201).json({
            'status':'1',
            'msg':'Tratamiento creado correctamente',
            'tratamiento': tratamiento
        });
    }catch(err){
        res.status(400).json({
            'status':'0',
            'msg':'Error al crear el tratamiento'
        });
    }
}

TratamientoCtrl.getTratamientoById = async(req, res) =>{
    try{
        const tratamiento = await Tratamiento.findById(req.params.id);
        if(!tratamiento){
            return res.status(404).json({
                'status':'0',
                'msg':'Tratamiento no encontrado'
            });
        }
        res.json(tratamiento);
    }catch(err){
        res.status(400).json({
            'status':'0',
            'msg':'Error al obtener el tratamiento'
        });
    }
}

TratamientoCtrl.updateTratamiento = async(req, res) =>{
    try{
        const tratamientoId = req.params.id;
        const { _id, ...datosActualizadoTratamiento } = req.body;
        const tratamientoActualizado = await Tratamiento.findByIdAndUpdate(
            tratamientoId,
            { $set: datosActualizadoTratamiento },
            { new: true, runValidators: true }
        );
        if(!tratamientoActualizado){
            return res.status(404).json({
                'status':'0',
                'msg':'Tratamiento no encontrado'
            });
        }
        res.json({
            'status':'1',
            'msg':'Tratamiento actualizado correctamente',
            'tratamiento': tratamientoActualizado
        });
    }catch(err){
        res.status(400).json({
            'status':'0',
            'msg':'Error al actualizar el tratamiento'
        });
    }
}
TratamientoCtrl.deleteTratamiento = async(req, res) =>{
    try{
        await Tratamiento.deleteOne({_id: req.params.id});
        res.json({
            'status':'1',
            'msg':'Tratamiento eliminado correctamente'
        });
    }catch(err){
        res.status(400).json({
            'status':'0',
            'msg':'Error al eliminar el tratamiento'
        });
    }
}
module.exports = TratamientoCtrl;