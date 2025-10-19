// server.js
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

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, "../"))); // '../' porque frontend está en la carpeta padre

// Ruta prueba
app.get("/ping", (req, res) => res.send("Servidor funcionando"));

// Ruta de registro
app.post("/register", async (req, res) => {
  try {
    const {
      id_usuario,
      nombres,
      apellidos,
      carreras_id_carreras,
      correo,
      semestre,
      contrasena,
    } = req.body;

    console.log("Datos recibidos:", req.body);

    // Validar que no falte ningún dato obligatorio
    if (!id_usuario || !nombres || !apellidos || !carreras_id_carreras || !correo || !semestre || !contrasena) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Verificar si el usuario ya existe
    const userExist = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario = $1 OR correo = $2",
      [id_usuario, correo]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "El usuario o correo ya están registrados" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar usuario en la base de datos
    await pool.query(
      `INSERT INTO usuarios 
       (ID_USUARIO, CARRERAS_ID_CARRERAS, NOMBRES, APELLIDOS, CORREO, SEMESTRE, CONTRASENA)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id_usuario,
        carreras_id_carreras,
        nombres,
        apellidos,
        correo,
        semestre,
        hashedPassword,
      ]
    );

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
