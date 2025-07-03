const Usuario = require ('../models/usuario') 
const {encrypt,compare} = require('../helpers/handleBcrypt') 
const authCtrl = {}
const Paciente = require('../models/paciente');
const Dentista = require('../models/dentista');
const Administrador = require('../models/administrador');


authCtrl.registerUsuario = async (req, res) => {
    try {
        console.log("BODY RECIBIDO:", req.body);
        const { nombreUsuario, password, confirmPassword, nombre, apellido, telefono, direccion, dni, tipoUsuario, obraSocial,email } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ msg: 'Las contraseñas no coinciden.' });
        }

        const passwordHash = await encrypt(password);

        // Solo los campos generales en Usuario
        const usuario = new Usuario({
            nombreUsuario,
            password: passwordHash,
            tipoUsuario
        });

        await usuario.save();

        // Guardar en la colección correspondiente
        if (tipoUsuario === 'paciente') {
            if (!obraSocial) {
                return res.status(400).json({ msg: 'Falta obra social para paciente.' });
            }
            const paciente = new Paciente({
                nombre,
                apellido,
                telefono,
                direccion,
                dni,
                userId: usuario._id,
                obraSocial,
                email
            });
            await paciente.save();
        } else if (tipoUsuario === 'dentista') {
            const dentista = new Dentista({
                nombre,
                apellido,
                telefono,
                direccion,
                dni,
                userId: usuario._id
            });
            await dentista.save();
        }else if (tipoUsuario === 'administrador') {
            const administrador = new Administrador({
                nombre,
                apellido,
                telefono,
                direccion,
                dni,
                userId: usuario._id
            });
            await administrador.save();
        }

        res.status(200).json({
            status: '1',
            msg: 'Usuario guardado.'
        });
    } catch (error) {
        console.error("ERROR REGISTRO:", error); 
        res.status(400).json({
            status: '0',
            msg: 'Error procesando operación.'
        });
    }
}
authCtrl.loginUsuario = async (req, res) => { 

    try { 
        //const  { email,password}= req.body; 
        const  { nombreUsuario,password}= req.body; 
        //const user = await Usuario.findOne({email}); 
        const user = await Usuario.findOne({nombreUsuario}); 
        if (!user) { 
            return res.json({ 
                status: 0, 
                msg: "Usuario no encontrado" 
            }) 
        } 
        
        // Comparar contraseña enviada vs contraseña hasheada en BD
        const passwordValido = await compare(password, user.password);

        if (!passwordValido) {
            return res.json({
                status: 0,
                msg: "Contraseña incorrecta"
            });
        }
 
        res.json({ 
            status: 1, 
            msg: "Login exitoso", 
            nombreUsuario: user.nombreUsuario, //retorno información útil para el frontend 
            tipoUsuario: user.tipoUsuario, //retorno información útil para el frontend
            //userid: user._id //retorno información útil para el frontend 
            id: user._id 
        }) 
    } catch (error) { 
        console.error("ERROR LOGIN:", error);
        res.json({ 
            status: 0, 
            msg: 'error' ,
            error: error.message 
        }) 
    } 
}


//exportacion del modulo controlador 
module.exports = authCtrl; 