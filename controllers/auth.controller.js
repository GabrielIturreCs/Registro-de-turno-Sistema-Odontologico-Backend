// controllers/auth.controller.js
const { OAuth2Client } = require("google-auth-library"); // Para validar tokens de Google (aunque lo dejemos para después, lo mantengo)
const jwt = require("jsonwebtoken"); // Para crear y verificar JWTs
const nodemailer = require("nodemailer"); // Para enviar correos
const Usuario = require("../models/usuario"); // Tu modelo principal de Usuario
//const Paciente = require("../models/Paciente"); // Tu modelo de Paciente
//const Dentista = require("../models/Dentista"); // Tu modelo de Dentista
const { encrypt, compare } = require("../helpers/handleBcrypt"); // Helpers para bcrypt

const authCtrl = {};

// Cargar variables de entorno (asegúrate de que estén definidas en tu .env y cargadas al inicio de tu app)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
// Secreto para los tokens de confirmación de email (puede ser el mismo JWT_SECRET o uno dedicado).
// Usar el mismo simplifica la gestión de secretos, pero tener uno dedicado puede añadir una capa de seguridad extra.
const EMAIL_CONFIRMATION_SECRET =
  process.env.EMAIL_CONFIRMATION_SECRET || JWT_SECRET;

// Verificación de variables de entorno cruciales
if (!GOOGLE_CLIENT_ID || !JWT_SECRET) {
  console.error(
    "ERROR: GOOGLE_CLIENT_ID o JWT_SECRET no definidos en las variables de entorno."
  );
  // En un entorno de producción, podrías querer que la app no arranque si faltan estos.
  // process.exit(1);
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID); // Mantengo para futura expansión con Google Login

/**
 * Función auxiliar para generar un token JWT de tu aplicación para la sesión.
 * Asumo que si tienes un generateToken en helpers, es equivalente a esto.
 * Si no es así, usa tu helper o asegura que el helper es importado correctamente.
 * Para este código, lo defino internamente para asegurar funcionalidad.
 */
const generateAppToken = (user) => {
  const payload = {
    id: user._id,
    nombreUsuario: user.nombreUsuario,
    email: user.email,
    tipoUsuario: user.tipoUsuario,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }); // Token válido por 1 hora
};

/**
 * Configuración del transportador de Nodemailer para envío de emails.
 * Asegúrate de tener las variables de entorno EMAIL_USER y EMAIL_PASS configuradas.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía un correo electrónico de confirmación.
 * @param {string} toEmail - Dirección de correo electrónico del destinatario.
 * @param {string} token - Token de confirmación (JWT).
 */
async function sendConfirmationEmail(toEmail, token) {
  // La URL de confirmación DEBE apuntar al BACKEND donde tienes la ruta /confirmar-email
  // Ajusta 'http://localhost:3000' a la URL base de tu backend en producción (ej. 'https://api.tu-dominio.com').
  const confirmUrl = `http://localhost:3000/api/auth/confirmar-email?token=${token}`; // <<< ¡CORREGIDO!

  await transporter.sendMail({
    from: `"Sistema Odontológico" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Confirma tu correo electrónico para el Sistema Odontológico",
    html: `
        <h4>¡Bienvenido al Sistema Odontológico!</h4>
        <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para confirmar tu dirección de correo electrónico:</p>
        <p><a href="${confirmUrl}">Confirmar mi correo electrónico</a></p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no solicitaste esta cuenta, por favor ignora este correo.</p>
    `,
  });
}

// --- 1. Método para Registrar un Nuevo Usuario (con confirmación de email y creación de perfil) ---
authCtrl.registerUsuario = async (req, res) => {
  try {
    const {
      nombreUsuario,
      password,
      confirmPassword,
      nombre,
      apellido,
      telefono,
      direccion,
      dni,
      tipoUsuario, // 'paciente', 'dentista', 'administrador'
      email,
      // Campos específicos para Paciente/Dentista que deben venir del frontend en el formulario de registro:
    } = req.body;

    // 1. Validaciones básicas de entrada
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Formato de email inválido." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Las contraseñas no coinciden." });
    }

    // 2. Verificar si ya existe un usuario por email, nombreUsuario o DNI
    const existingUser = await Usuario.findOne({
      $or: [{ email }, { nombreUsuario }, { dni }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ message: "El email ya está registrado." });
      }
      if (existingUser.nombreUsuario === nombreUsuario) {
        return res
          .status(400)
          .json({ message: "El nombre de usuario ya existe." });
      }
      if (existingUser.dni === dni) {
        return res.status(400).json({ message: "El DNI ya está registrado." });
      }
    }

    // 3. Encriptar la contraseña
    const passwordHash = await encrypt(password);

    // 4. Crear el documento de Usuario principal (email no confirmado inicialmente)
    const usuario = new Usuario({
      nombreUsuario,
      password: passwordHash,
      nombre,
      apellido,
      telefono,
      direccion,
      dni,
      tipoUsuario, // ¡Esto es clave para decidir qué perfil complementario crear!
      email,
      isConfirmed: false, // Por defecto, el email no está confirmado
    });

    await usuario.save(); // Guarda el usuario para obtener su _id

    // 5. Generar y enviar el token de confirmación por email (JWT)
    const confirmationToken = jwt.sign(
      { id: usuario._id },
      EMAIL_CONFIRMATION_SECRET,
      { expiresIn: "24h" }
    );

    try {
      await sendConfirmationEmail(email, confirmationToken);
    } catch (emailError) {
      console.error("Error enviando email de confirmación:", emailError);
      // Puedes decidir si eliminar el usuario si falla el envío de email, o solo loguear.
      // Por ahora, solo loguea y permite el registro.
    }

    /*
    // 6. Crear el documento de perfil específico (Paciente o Dentista)
    let profileCreated = false;
    if (tipoUsuario === 'paciente') {
      // Validar que los campos específicos de paciente estén presentes si son requeridos por tu modelo
      if (!fechaNacimiento) {
        // Opcional: podrías considerar eliminar el usuario recién creado aquí si la creación del perfil específico es CRÍTICA.
        return res.status(400).json({ message: "La fecha de nacimiento es requerida para registrar un paciente." });
      }
      const paciente = new Paciente({
        usuario: usuario._id, // Referencia al ID del Usuario recién creado
        fechaNacimiento: fechaNacimiento,
        // Agrega aquí cualquier otro campo específico del paciente que venga del req.body
      });
      await paciente.save();
      profileCreated = true;
    } else if (tipoUsuario === 'dentista') {
      // Validar que los campos específicos de dentista estén presentes si son requeridos
      if (!matricula || !especialidad) {
        return res.status(400).json({ message: "Matrícula y especialidad son requeridas para registrar un dentista." });
      }
      const dentista = new Dentista({
        usuario: usuario._id, // Referencia al ID del Usuario recién creado
        matricula: matricula,
        especialidad: especialidad,
        // Agrega aquí cualquier otro campo específico del dentista que venga del req.body
      });
      await dentista.save();
      profileCreated = true;
    }
    // Si tipoUsuario es 'administrador', no se necesita un perfil adicional por ahora.
    */

    let profileCreated = false;

    res.status(201).json({
      // 201 Created para un nuevo recurso
      message:
        "Usuario registrado exitosamente. Se ha enviado un enlace de confirmación a tu correo electrónico. Por favor verifica tu email para activar tu cuenta.",
      userId: usuario._id,
      profileCreated: profileCreated,
    });
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    // Manejo de errores específicos de MongoDB (ej. duplicados)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = Object.values(error.keyValue)[0];
      return res
        .status(400)
        .json({ message: `El ${field} '${value}' ya existe.` });
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor al registrar el usuario." });
  }
};

// --- 2. Método para Confirmar Email ---
authCtrl.confirmarEmail = async (req, res) => {
  // Mantengo 'confirmarEmail'
  const { token } = req.query; // El token viene como un parámetro de consulta en la URL

  if (!token) {
    return res.status(400).send("Token de confirmación no proporcionado.");
  }

  try {
    // 1. Verificar el token de confirmación (usando el secreto de confirmación)
    const decoded = jwt.verify(token, EMAIL_CONFIRMATION_SECRET);
    const userId = decoded.id; // Obtenemos el ID del usuario del payload del token

    // 2. Buscar al usuario y actualizar su estado de email
    const usuario = await Usuario.findById(userId);

    if (!usuario) {
      return res.status(404).send("Usuario no encontrado o token inválido.");
    }

    if (usuario.isConfirmed) {
      // Ya confirmado, redirigimos directamente a la página de login del frontend
      return res.redirect(
        "http://localhost:4200/login?emailConfirmado=true&status=alreadyConfirmed"
      );
    }

    // Actualizar el estado del email del usuario
    usuario.isConfirmed = true; // Asumo un campo 'isConfirmed: { type: Boolean, default: false }' en tu modelo Usuario
    await usuario.save();

    // 3. Redirigir al usuario a la página de login del frontend con un mensaje de éxito
    // Ajusta 'http://localhost:4200' a la URL base de tu frontend en producción.
    res.redirect(
      "http://localhost:4200/login?emailConfirmado=true&status=success"
    );
  } catch (error) {
    console.error("Error al confirmar email:", error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(400)
        .send(
          "El enlace de confirmación ha expirado. Por favor, solicite uno nuevo."
        );
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).send("Token de confirmación inválido o corrupto.");
    }
    res.status(500).send("Error interno del servidor al confirmar el correo.");
  }
};

authCtrl.loginUsuario = async (req, res) => {
  try {
    const { nombreUsuario, password } = req.body;

    // --- DEBUGGING ---
    console.log("--- Intento de Login ---");
    console.log("Nombre de Usuario recibido:", nombreUsuario);
    console.log("Contraseña recibida (sin hashear):", password);
    // --- FIN DEBUGGING ---

    if (!nombreUsuario || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Nombre de usuario y contraseña son requeridos.",
        });
    }

    const user = await Usuario.findOne({ nombreUsuario }).select("+password"); // Asegúrate de incluir la contraseña en el resultado

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado." });
    }

    // 2. Verificar si el email del usuario está confirmado
    if (!user.isConfirmed) {
      console.log("DEBUG: Usuario no confirmado."); // DEBUG
      return res.status(401).json({
        success: false,
        message:
          "Tu cuenta no ha sido confirmada. Por favor, verifica tu correo electrónico.",
      });
    }

    // 3. Comparar contraseña enviada vs contraseña hasheada en BD
    const passwordValido = await compare(password, user.password);

    // --- DEBUGGING ---
    console.log(
      "DEBUG: Resultado de la comparación de contraseña:",
      passwordValido
    );
    // ---

    if (!passwordValido) {
      console.log("DEBUG: Contraseña NO válida."); // DEBUG
      return res
        .status(401)
        .json({ success: false, message: "Contraseña incorrecta." });
    }

    // 4. Generar el token de aplicación para la sesión
    const appToken = generateAppToken(user); // Usando la función auxiliar generateAppToken

    // 5. Responder con el token y la información del usuario
    return res.status(200).json({
      success: true,
      message: "Login tradicional exitoso",
      appToken: appToken,
      user: {
        id: user._id,
        nombreUsuario: user.nombreUsuario,
        email: user.email,
        tipoUsuario: user.tipoUsuario,
        nombre: user.nombre,
        apellido: user.apellido,
        // Puedes añadir más campos que necesites en el frontend
      },
    });
  } catch (error) {
    console.error("Error en loginUsuario:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error interno del servidor al iniciar sesión.",
      });
  }
};

// --- 4. Método para Login con Google ---
authCtrl.googleLogin = async (req, res) => {
  const { credential } = req.body; // El JWT de Google (ID Token) enviado desde el frontend

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: "Falta el token de credencial de Google.",
    });
  }

  try {
    // 1. VALIDACIÓN DEL TOKEN DE GOOGLE
    // Llama a Google para verificar el token y obtener el payload (información del usuario)
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID, // ¡Verifica que el token sea para TU aplicación!
    });
    const payload = ticket.getPayload(); // Información validada y decodificada por Google

    const googleId = payload["sub"]; // ID único del usuario de Google (subject)
    const email = payload["email"];
    const nombre = payload["given_name"] || payload["name"];
    const apellido = payload["family_name"];
    // Puedes obtener otros datos de Google si los necesitas: picture, locale, etc.

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "El token de Google no contiene un email válido.",
      });
    }

    // 2. GESTIÓN DEL USUARIO EN TU BD (Buscar o Crear)
    // Busca un usuario existente por su email O por su googleId.
    // Esto maneja casos donde un usuario ya se registró tradicionalmente y luego usa Google,
    // o viceversa, o solo usa Google.
    let user = await Usuario.findOne({
      $or: [{ email: email }, { googleId: googleId }],
    });

    if (user) {
      // Usuario existente encontrado
      // Si el usuario existe (ej. por email) pero no tiene googleId, vincúlalo para futuras sesiones con Google
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        user.isConfirmed = true; // Si se loguea con Google, su email se considera confirmado
        await user.save(); // Guarda el cambio de vinculación en la BD
        console.log(
          `Usuario existente ${user.email} vinculado con Google ID: ${googleId}`
        );
      }
      console.log(`Usuario existente logueado con Google: ${user.email}`);
    } else {
    
      const newNombreUsuario = `${nombre?.toLowerCase() || ""}${
        apellido?.toLowerCase() || ""
      }${Math.floor(Math.random() * 10000)}`.replace(/[^a-z0-9]/g, "");

      const newDni = `AUTO-${Date.now()}`; // Genera un DNI "automático" temporal
      const newTelefono = "N/A"; 
      const newDireccion = "N/A"; 

      user = new Usuario({
        nombreUsuario: newNombreUsuario,
        email: email,
        nombre: nombre,
        apellido: apellido,
        telefono: newTelefono,
        direccion: newDireccion,
        dni: newDni,
        tipoUsuario: "paciente",
        googleId: googleId,
        isConfirmed: true,
      });

      await user.save(); // Guarda el nuevo usuario en la base de datos
      console.log(`Nuevo usuario Google registrado en DB: ${user.email}`);

      // Opcional: Crear perfil de Paciente asociado si el tipoUsuario por defecto es 'paciente'
      // Descomenta y adapta si necesitas crear el perfil específico aquí
      /*
      if (user.tipoUsuario === "paciente") {
        // const Paciente = require("../models/Paciente"); // Si no está importado globalmente
        const paciente = new Paciente({
          usuario: user._id,
          fechaNacimiento: null, // Google no proporciona esto, pon null o una fecha por defecto si es requerido.
          // Otros campos específicos del paciente
        });
        await paciente.save();
        console.log(
          `Perfil de Paciente creado para el usuario Google: ${user.email}.`
        );
      }*/
    }

    // 3. GENERAR TOKEN DE APLICACIÓN (el JWT de tu app para el frontend)
    const appToken = generateAppToken(user);

    // 4. RESPONDER AL FRONTEND con el token de tu app y los datos del usuario
    res.status(200).json({
      success: true,
      message: "Login con Google exitoso",
      appToken: appToken,
      user: {

        id: user._id, // ID de Mongoose
        nombreUsuario: user.nombreUsuario,
        email: user.email,
        tipoUsuario: user.tipoUsuario,
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        direccion: user.direccion,
        dni: user.dni,
        // Agrega cualquier otro campo que tu frontend necesite
      },
    });
  } catch (error) {
    console.error("Error en el login de Google:", error);
    // Manejo de errores específicos de MongoDB (ej. duplicados si el `nombreUsuario` auto-generado ya existe)
    if (error.code === 11000) {
      return res.status(409).json({
        // 409 Conflict
        success: false,
        message: `Ya existe un usuario con un email o cuenta de Google similar. Por favor, intente con otro método o contacte soporte.`,
      });
    }
    res.status(500).json({
      success: false,
      message:
        "Autenticación con Google fallida. Problema interno del servidor.",
    });
  }
};

// --- (Opcional) Método para obtener el perfil del usuario autenticado (requiere middleware de autenticación) ---
authCtrl.getProfile = async (req, res) => {
  try {
    // req.user ya está disponible aquí gracias al authMiddleware
    // Contiene la información del usuario que viene de la base de datos (sin la contraseña)
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Usuario no autenticado." });
    }
    res.status(200).json({
      success: true,
      message: "Datos de perfil recuperados con éxito.",
      user: {
        id: req.user._id,
        nombreUsuario: req.user.nombreUsuario,
        email: req.user.email,
        tipoUsuario: req.user.tipoUsuario,
        nombre: req.user.nombre,
        apellido: req.user.apellido,
        telefono: req.user.telefono,
        direccion: req.user.direccion,
        dni: req.user.dni,
        isConfirmed: req.user.isConfirmed,
        googleId: req.user.googleId,
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil en controlador:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error interno del servidor al obtener perfil.",
      });
  }
};

// Exportación de todos los métodos del controlador
module.exports = authCtrl;
