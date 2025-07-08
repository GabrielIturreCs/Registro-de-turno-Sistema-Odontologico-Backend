const Usuario = require ('../models/usuario') 
const {encrypt,compare} = require('../helpers/handleBcrypt') 
const { generateToken } = require('../helpers/jwtHelper')
const authCtrl = {}
const Paciente = require('../models/paciente');
const Dentista = require('../models/dentista');
const Administrador = require('../models/administrador');


authCtrl.registerUsuario = async (req, res) => {
    try {
        console.log("BODY RECIBIDO:", req.body);
        const { nombreUsuario, password, confirmPassword, nombre, apellido, telefono, direccion, dni, tipoUsuario, obraSocial,email,legajo } = req.body;

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
                legajo,
                email,
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

        // Buscar información adicional según el tipo de usuario
        let userDetails = {};
        if (user.tipoUsuario === 'paciente') {
            const paciente = await Paciente.findOne({ userId: user._id });
            if (paciente) {
                userDetails = {
                    nombre: paciente.nombre,
                    apellido: paciente.apellido,
                    email: paciente.email,
                    dni: paciente.dni,
                    telefono: paciente.telefono,
                    obraSocial: paciente.obraSocial
                };
            }
        } else if (user.tipoUsuario === 'dentista') {
            const dentista = await Dentista.findOne({ userId: user._id });
            if (dentista) {
                userDetails = {
                    nombre: dentista.nombre,
                    apellido: dentista.apellido,
                    email: dentista.email,
                    dni: dentista.dni,
                    telefono: dentista.telefono,
                    legajo: dentista.legajo
                };
            }
        } else if (user.tipoUsuario === 'administrador') {
            const administrador = await Administrador.findOne({ userId: user._id });
            if (administrador) {
                userDetails = {
                    nombre: administrador.nombre,
                    apellido: administrador.apellido,
                    dni: administrador.dni,
                    telefono: administrador.telefono
                };
            }
        }

        // Crear payload para el JWT
        const payload = {
            id: user._id,
            nombreUsuario: user.nombreUsuario,
            tipoUsuario: user.tipoUsuario,
            ...userDetails
        };

        // Generar token JWT
        const token = generateToken(payload);
 
        res.json({ 
            status: 1, 
            msg: "Login exitoso", 
            token: token,
            user: {
                id: user._id,
                nombreUsuario: user.nombreUsuario,
                tipoUsuario: user.tipoUsuario,
                ...userDetails
            }
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