// config/passport-setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuario = require('../models/usuario'); // Asegúrate que la ruta sea correcta

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let currentUser = await Usuario.findOne({ googleId: profile.id });

            if (currentUser) {
                // Usuario ya existe, simplemente lo retornamos
                console.log('Usuario de Google existente:', currentUser.displayName || currentUser.email);
                done(null, currentUser);
            } else {
                // Usuario no existe, creamos uno nuevo
                const newUser = new Usuario({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
                    profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                    // Para simplificar, asumimos que si viene de Google, no necesita nombreUsuario ni password tradicional
                    // Podríamos usar el email o displayName como nombreUsuario si lo requieres.
                    nombreUsuario: profile.displayName || (profile.emails && profile.emails[0] ? profile.emails[0].value.split('@')[0] : 'google_user'), // Un nombre por defecto
                    password: '', // Vacío, ya que no hay password para Google
                    tipoUsuario: 'paciente' // O el rol por defecto que quieras asignar a los que vienen de Google
                });
                await newUser.save();
                console.log('Nuevo usuario de Google creado:', newUser.displayName || newUser.email);
                done(null, newUser);
            }
        } catch (err) {
            console.error('Error en la estrategia de Google:', err);
            done(err, null);
        }
    })
);

// Estas funciones siguen siendo necesarias para el flujo de Passport
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Usuario.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});