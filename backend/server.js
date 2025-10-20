// backend/server.js
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = 3000;

// Configuración PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ProyectoIs",
  password: "270704", 
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../"))); // '../' porque frontend está en la carpeta padre

// Abrir index.html al entrar al root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Ruta de prueba
app.get("/ping", (req, res) => res.send("Servidor funcionando"));

// Ruta de registro
app.post("/register", async (req, res) => {
  try {
    const { id_usuario, nombres, apellidos, carreras_id_carreras, correo, semestre, contrasena } = req.body;

    if (!id_usuario || !nombres || !apellidos || !carreras_id_carreras || !correo || !semestre || !contrasena) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const userExist = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario = $1 OR correo = $2",
      [id_usuario, correo]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "El usuario o correo ya están registrados" });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    await pool.query(
      `INSERT INTO usuarios (ID_USUARIO, CARRERAS_ID_CARRERAS, NOMBRES, APELLIDOS, CORREO, SEMESTRE, CONTRASENA)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id_usuario, carreras_id_carreras, nombres, apellidos, correo, semestre, hashedPassword]
    );

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta de login
app.post("/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: "Faltan correo o contraseña" });
    }

    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Correo no registrado" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      message: "Inicio de sesión exitoso",
      user: { id_usuario: user.id_usuario, nombres: user.nombres, apellidos: user.apellidos, correo: user.correo }
    });
  } catch (error) {
    console.error("❌ Error en /login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});




// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
