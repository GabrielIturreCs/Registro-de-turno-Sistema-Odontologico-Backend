const { OAuth2Client } = require('google-auth-library');
const Usuario = require('../models/usuario');
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
    console.log('Token recibido:', req.body.token);
    
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({
                status: 0,
                msg: 'Token de Google requerido'
            });
        }

        // Verificar el token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        console.log('✅ Token verificado. Payload:', payload);

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

        if (usuario) {
            // Usuario existente - actualizar información si es necesario
            if (!usuario.googleId) {
                usuario.googleId = googleId;
                usuario.picture = picture;
                await usuario.save();
            }
            
            console.log('✅ Usuario existente encontrado:', usuario.email);
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
        }

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

        res.json({
            status: 1,
            msg: 'Login con Google exitoso',
            token: jwtToken,
            id: usuario._id,
            nombreUsuario: usuario.nombreUsuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            tipoUsuario: usuario.tipoUsuario,
            picture: usuario.picture
        });

    } catch (error) {
        console.error('❌ Error verificando token de Google:', error);
        res.status(400).json({
            status: 0,
            msg: 'Token de Google inválido o expirado'
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
