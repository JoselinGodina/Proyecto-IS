// backend/server.js
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = 3000;

// ============================
// Configuración PostgreSQL
// ============================
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ProyectoIs",
  password: "270704",
  port: 5432,
});

// ============================
// Middlewares
// ============================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../")));

// ============================
// Rutas base
// ============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/ping", (req, res) => res.send("Servidor funcionando correctamente 🚀"));

// ============================
// 🧍 Registro de usuario
// ============================
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

// ============================
// 🔐 Login
// ============================
app.post("/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) return res.status(400).json({ error: "Faltan datos" });

    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Correo no registrado" });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!passwordMatch) return res.status(401).json({ error: "Contraseña incorrecta" });

    res.json({
      message: "Inicio de sesión exitoso",
      user: {
        id_usuario: user.id_usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        correo: user.correo,
        roles_id_rol: user.roles_id_rol,
        semestre: user.semestre,
      },
    });
  } catch (error) {
    console.error("❌ Error en /login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ============================
// 📘 CRUD: CREAR_ASESORIA
// ============================
app.get("/asesorias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crear_asesoria ORDER BY fecha ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener asesorías:", error);
    res.status(500).json({ error: "Error al obtener asesorías" });
  }
});

app.post("/asesorias", async (req, res) => {
  try {
    const { id_crear_asesoria, usuarios_id_usuario, titulo, descripcion, fecha, horario, cupo } = req.body;
    await pool.query(
      `INSERT INTO crear_asesoria (id_crear_asesoria, usuarios_id_usuario, titulo, descripcion, fecha, horario, cupo, cuposocupados)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0)`,
      [id_crear_asesoria, usuarios_id_usuario, titulo, descripcion, fecha, horario, cupo]
    );
    res.status(201).json({ message: "Asesoría creada correctamente" });
  } catch (error) {
    console.error("Error al crear asesoría:", error);
    res.status(500).json({ error: "Error al crear asesoría" });
  }
});

app.put("/asesorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, horario, cupo } = req.body;
    await pool.query(
      `UPDATE crear_asesoria 
       SET titulo=$1, descripcion=$2, fecha=$3, horario=$4, cupo=$5 
       WHERE id_crear_asesoria=$6`,
      [titulo, descripcion, fecha, horario, cupo, id]
    );
    res.json({ message: "Asesoría actualizada correctamente" });
  } catch (error) {
    console.error("Error al editar asesoría:", error);
    res.status(500).json({ error: "Error al editar asesoría" });
  }
});

app.delete("/asesorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM crear_asesoria WHERE id_crear_asesoria = $1", [id]);
    res.json({ message: "Asesoría cancelada correctamente" });
  } catch (error) {
    console.error("Error al cancelar asesoría:", error);
    res.status(500).json({ error: "Error al cancelar asesoría" });
  }
});

// ============================
// 👩‍🎓 Asesorías visibles para alumnos
// ============================
app.get("/alumno/asesorias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crear_asesoria ORDER BY fecha ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener asesorías para alumno:", error);
    res.status(500).json({ error: "Error al obtener asesorías" });
  }
});

// ============================
// 🧾 Tabla INSCRIPCIONES
// ============================

// Listar inscripciones de un alumno
app.get("/inscripciones/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const result = await pool.query(
      `SELECT i.id_inscripcion, i.fecha_inscripcion, c.titulo, c.descripcion, c.fecha, c.horario 
       FROM inscripciones i
       JOIN crear_asesoria c ON i.id_crear_asesoria = c.id_crear_asesoria
       WHERE i.id_usuario = $1`,
      [id_usuario]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener inscripciones:", error);
    res.status(500).json({ error: "Error al obtener inscripciones" });
  }
});

// Registrar inscripción
app.post("/inscribir", async (req, res) => {
  const { id_usuario, id_crear_asesoria } = req.body;

  try {
    // 1️⃣ Verificar que la asesoría exista
    const asesoriaResult = await pool.query(
      "SELECT cupo, cuposocupados FROM crear_asesoria WHERE id_crear_asesoria = $1",
      [id_crear_asesoria]
    );

    if (asesoriaResult.rows.length === 0)
      return res.status(404).json({ success: false, error: "Asesoría no encontrada" });

    const { cupo, cuposocupados } = asesoriaResult.rows[0];

    // 2️ Revisar si el alumno ya está inscrito
    const existe = await pool.query(
      "SELECT * FROM inscripciones WHERE id_usuario = $1 AND id_crear_asesoria = $2",
      [id_usuario, id_crear_asesoria]
    );
    if (existe.rows.length > 0)
      return res.status(400).json({ success: false, error: "Ya estás inscrito en esta asesoría" });

    // 3️ Revisar cupos
    if (cuposocupados >= cupo)
      return res.status(400).json({ success: false, error: "cupo lleno" });

    // 4️ Insertar en inscripciones
    await pool.query(
      `INSERT INTO inscripciones (id_usuario, id_crear_asesoria, fecha_inscripcion)
       VALUES ($1, $2, NOW())`,
      [id_usuario, id_crear_asesoria]
    );

    // 5️⃣ Actualizar contador
    await pool.query(
      "UPDATE crear_asesoria SET cuposocupados = cuposocupados + 1 WHERE id_crear_asesoria = $1",
      [id_crear_asesoria]
    );

    res.json({ success: true, message: "Inscripción realizada correctamente" });
  } catch (error) {
    console.error("❌ Error en /inscribir:", error);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
});

// Ver inscritos por asesoría (para docente)
app.get("/inscripciones/:id_crear_asesoria", async (req, res) => {
  try {
    const { id_crear_asesoria } = req.params;
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombres, u.apellidos, u.correo
       FROM inscripciones i
       JOIN usuarios u ON u.id_usuario = i.id_usuario
       WHERE i.id_crear_asesoria = $1`,
      [id_crear_asesoria]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener inscritos:", error);
    res.status(500).json({ error: "Error al obtener inscritos" });
  }
});

app.get("/asesorias/:id/inscritos", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT u.id_usuario, u.nombres, u.apellidos, u.correo
      FROM inscripciones i
      JOIN usuarios u ON i.id_usuario = u.id_usuario
      WHERE i.id_crear_asesoria = $1
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener inscritos:", err);
    res.status(500).json({ error: "Error al obtener los inscritos" });
  }
});


// ============================
// 🚀 Iniciar servidor
// ============================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
