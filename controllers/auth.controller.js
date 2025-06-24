const Usuario = require ('../models/usuario') 
const {encrypt,compare} = require('../helpers/handleBcrypt') 
const authCtrl = {}


authCtrl.registerUsuario = async (req, res) => {
    try {
        // Desestructurar el campo clave del cuerpo
        const { nombreUsuario,password,confirmPassword,nombre,apellido,telefono,direccion,dni,tipoUsuario} = req.body;

        // Verificar si ya existe un usuario con ese email
        /*const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({
                status: '0',
                msg: 'El usuario ya existe con ese correo electrónico.'
            });
        }*/
        if (password !== confirmPassword) {
              return res.status(400).json({ msg: 'Las contraseñas no coinciden.' });
        }
        // Encriptar la contraseña
        const passwordHash = await encrypt(password);

        // Crear el nuevo usuario con la clave encriptada
        const usuario = new Usuario({
            nombreUsuario,
            password:passwordHash ,
            nombre,
            apellido,
            telefono,
            direccion,
            dni,
            tipoUsuario
           
        });

        // Guardar en la base de datos
        await usuario.save();

        res.status(200).json({
            status: '1',
            msg: 'Usuario guardado.'
        });
    } catch (error) {
        res.status(400).json({
            status: '0',
            msg: 'Error procesando operación.'
        });
    }
}


//exportacion del modulo controlador 
module.exports = authCtrl;