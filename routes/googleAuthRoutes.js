// routes/googleAuthRoutes.js
const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Ruta para iniciar la autenticación con Google
// Cuando se accede a /api/auth/google, esta ruta será /api/auth/google/login
router.get('/login', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Ruta de callback a la que Google redirige después de la autenticación
// Cuando Google redirige a /api/auth/google/callback, esta ruta se activa
router.get('/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }), // Redirige al frontend en caso de fallo
    (req, res) => {
        // req.user contiene el usuario que Passport ha autenticado (desde passport-setup.js)
        const user = req.user;

        // Generar un token JWT para el usuario autenticado
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                tipoUsuario: user.tipoUsuario
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expira en 1 hora
        );

        // Redirigir al frontend de Angular con el token JWT en la URL.
        // El frontend deberá parsear este token de la URL.
        res.redirect(`${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`);
    }
);

// Ruta si el login con Google falla (ahora manejada por la redirección en el callback)
// Esta ruta no será directamente accesible ya que el failureRedirect se encarga.
// La mantengo si quisieras una respuesta JSON específica en el backend para el fallo.
router.get('/login/failed', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Fallo la autenticación con Google.',
        details: 'El usuario canceló o hubo un error en la autenticación con Google.'
    });
});


module.exports = router;