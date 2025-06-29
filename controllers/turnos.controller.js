const Turno = require('../models/turno.js')
const TurnoCtrl = {}

TurnoCtrl.getTurnos = async(req, res) =>{
    var turnos = await Turno.find();
    res.json(turnos);
}

TurnoCtrl.getTurnosById = async(req, res) =>{
    try{
       const turno = await Turno.findById(req.params.id);
       res.json(TurnoCtrl);
    }catch(err){
        res.status(404).json({
            'status':'0',
            'msg':'Turno no encontrado'
        })
    }
}

TurnoCtrl.createTurno = async(req,res) =>{
    try{
       const turno = new Turno(req.body);
       await turno.save();
    }catch(err){
        res.status(400).json({
            'status':'0',
            'msg':'Error al crear el turno'
        })
    }
}

TurnoCtrl.updateTurno = async(req,res) =>{
    try{
        const turnoId = req.params.id;
        const{_id, ...datosActualizadoTurno} = req.body;
        const turnoActualizado = Turno.findByIdAndUpdate(
            turnoId,
            {$set:datosActualizadoTurno},
            {new:true, runValidators:true}
        )
        if(!turnoActualizado){
            res.status(404).json({
                'status':'0',
                'msg':'Turno no encontrado'
            })
        }
        res.json({
            'status':'1',
            'msg':'Turno actualizado correctamente',
            'Turno':turnoActualizado
        })
    }catch(err){
        res.status(404).json({
            'status':'0',
            'msg':'Turno no encontrado'
        })
    }
}

TurnoCtrl.deleteTurno = async(req,res) =>{
    try{
     await Turno.deleteOne({_id:req.params.id});
     res.json({
        'status':'1',
        'msg':'Turno eliminado correctamente'
     })
    }catch(err){
        res.status(404).json({
            'status':'0',
            'msg':'Turno no encontrado'
        })
    }
}

module.exports = TurnoCtrl;