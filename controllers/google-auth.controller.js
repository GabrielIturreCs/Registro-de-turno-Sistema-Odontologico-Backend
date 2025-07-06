const { OAuth2Client } = require('google-auth-library');
const Usuario = require('../models/usuario');
const Paciente = require('../models/paciente');
const { encrypt } = require('../helpers/handleBcrypt');
const jwt = require('jsonwebtoken');

const googleAuthCtrl = {};

// Configurar cliente OAuth2
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Verificar token de Google y autenticar usuario
googleAuthCtrl.verifyGoogleToken = async (req, res) => {
    console.log('🔍 === VERIFICANDO TOKEN DE GOOGLE ===');
    console.log('📍 Origin:', req.headers.origin);
    console.log('📍 Method:', req.method);
    console.log('📍 Content-Type:', req.headers['content-type']);
    console.log('Token recibido:', req.body.token ? 'TOKEN PRESENTE' : 'NO TOKEN');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
    
    // Verificar que las variables de entorno estén configuradas
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.error('❌ Variables de entorno Google no configuradas');
        return res.status(500).json({
            success: false,
            message: 'Configuración de Google OAuth incompleta'
        });
    }
    
    try {
        const { token } = req.body;
        
        if (!token) {
            console.error('❌ No se recibió token en el body');
            return res.status(400).json({
                success: false,
                message: 'Token de Google requerido'
            });
        }

        console.log('🔍 Verificando token con Google...');
        // Verificar el token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        console.log('✅ Token verificado exitosamente');
        console.log('📧 Email:', payload.email);
        console.log('👤 Nombre:', payload.given_name, payload.family_name);

        const googleId = payload['sub'];
        const email = payload['email'];
        const nombre = payload['given_name'];
        const apellido = payload['family_name'];
        const picture = payload['picture'];

        // Buscar usuario existente por email o Google ID
        let usuario = await Usuario.findOne({
            $or: [
                { email: email },
                { googleId: googleId }
            ]
        });

        let needsProfileCompletion = false;
        let patientId = null;

        if (usuario) {
            // Usuario existente - actualizar información si es necesario
            if (!usuario.googleId) {
                usuario.googleId = googleId;
                usuario.picture = picture;
                await usuario.save();
            }
            
            console.log('✅ Usuario existente encontrado:', usuario.email);
            
            // Verificar si tiene perfil de paciente completo
            if (usuario.tipoUsuario === 'paciente') {
                const paciente = await Paciente.findOne({ userId: usuario._id });
                if (paciente) {
                    patientId = paciente._id;
                    needsProfileCompletion = false;
                } else {
                    needsProfileCompletion = true;
                }
            }
        } else {
            // Crear nuevo usuario
            const defaultPassword = await encrypt('google-oauth-' + Date.now());
            
            usuario = new Usuario({
                nombreUsuario: email.split('@')[0], // Usar parte del email como username
                email: email,
                password: defaultPassword,
                nombre: nombre,
                apellido: apellido,
                tipoUsuario: 'paciente', // Por defecto, los usuarios de Google son pacientes
                googleId: googleId,
                picture: picture,
                dni: '', // Se puede completar después
                telefono: '', // Se puede completar después
                obraSocial: '' // Se puede completar después
            });

            await usuario.save();
            console.log('✅ Nuevo usuario creado:', usuario.email);
            
            // Nuevo usuario necesita completar perfil de paciente
            needsProfileCompletion = true;
        }

        console.log('🔍 Generando JWT token...');
        // Generar JWT token para la sesión
        const jwtToken = jwt.sign(
            { 
                id: usuario._id,
                email: usuario.email,
                tipoUsuario: usuario.tipoUsuario
            },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '24h' }
        );

        console.log('✅ Login con Google exitoso para:', usuario.email);
        
        const response = {
            success: true,
            message: 'Login con Google exitoso',
            token: jwtToken,
            user: {
                id: usuario._id,
                nombreUsuario: usuario.nombreUsuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                tipoUsuario: usuario.tipoUsuario,
                picture: usuario.picture,
                needsProfileCompletion: needsProfileCompletion,
                hasCompleteProfile: !needsProfileCompletion,
                patientId: patientId
            }
        };
        
        console.log('📤 Enviando respuesta exitosa');
        res.json(response);

    } catch (error) {
        console.error('❌ Error verificando token de Google:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
        
        res.status(400).json({
            success: false,
            message: 'Token de Google inválido o expirado',
            error: error.message
        });
    }
};

// Obtener URL de autorización de Google
googleAuthCtrl.getGoogleAuthUrl = (req, res) => {
    console.log('🔗 === GENERANDO URL DE GOOGLE AUTH ===');
    
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        include_granted_scopes: true,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
    });

    console.log('✅ URL generada:', authUrl);
    
    // Redirigir directamente a Google
    res.redirect(authUrl);
};

// Manejar callback de Google OAuth
googleAuthCtrl.handleGoogleCallback = async (req, res) => {
    console.log('🔄 === CALLBACK DE GOOGLE ===');
    console.log('Query params:', req.query);
    
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_cancelled`);
        }

        // Intercambiar código por tokens
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Obtener información del usuario
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const nombre = payload['given_name'];
        const apellido = payload['family_name'];
        const picture = payload['picture'];

        // Buscar o crear usuario (similar a verifyGoogleToken)
        let usuario = await Usuario.findOne({
            $or: [
                { email: email },
                { googleId: googleId }
            ]
        });

        if (!usuario) {
            const defaultPassword = await encrypt('google-oauth-' + Date.now());
            
            usuario = new Usuario({
                nombreUsuario: email.split('@')[0],
                email: email,
                password: defaultPassword,
                nombre: nombre,
                apellido: apellido,
                tipoUsuario: 'paciente',
                googleId: googleId,
                picture: picture,
                dni: '',
                telefono: '',
                obraSocial: ''
            });

            await usuario.save();
        }

        // Generar JWT token
        const jwtToken = jwt.sign(
            { 
                id: usuario._id,
                email: usuario.email,
                tipoUsuario: usuario.tipoUsuario
            },
            process.env.JWT_SECRET || 'secret-key',
            { expiresIn: '24h' }
        );

        // Redirigir al frontend con el token
        const redirectUrl = `${process.env.FRONTEND_URL}/login/google-callback?token=${jwtToken}&user=${encodeURIComponent(JSON.stringify({
            id: usuario._id,
            nombreUsuario: usuario.nombreUsuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario,
            picture: usuario.picture
        }))}`;

        res.redirect(redirectUrl);

    } catch (error) {
        console.error('❌ Error en callback de Google:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
    }
};

module.exports = googleAuthCtrl;
