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
user: { 
  id_usuario: user.id_usuario, 
  nombres: user.nombres, 
  apellidos: user.apellidos, 
  correo: user.correo,
  roles_id_rol: user.roles_id_rol // <-- importante
}
    });
  } catch (error) {
    console.error("❌ Error en /login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


// ================================
// 🧩 CRUD de Asesorías (Administrador)
// ================================

// Obtener todas las asesorías creadas
app.get("/asesorias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crear_asesoria ORDER BY fecha ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener asesorías:", error);
    res.status(500).json({ error: "Error al obtener asesorías" });
  }
});

// Crear una nueva asesoría
app.post("/asesorias", async (req, res) => {
  try {
    const { id_crear_asesoria, usuarios_id_usuario, titulo, descripcion, fecha, horario, cupo } = req.body;

    await pool.query(
      `INSERT INTO crear_asesoria (id_crear_asesoria, usuarios_id_usuario, titulo, descripcion, fecha, horario, cupo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id_crear_asesoria, usuarios_id_usuario, titulo, descripcion, fecha, horario, cupo]
    );

    res.status(201).json({ message: "Asesoría creada correctamente" });
  } catch (error) {
    console.error("Error al crear asesoría:", error);
    res.status(500).json({ error: "Error al crear asesoría" });
  }
});

// Editar una asesoría
app.put("/asesorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, horario, cupo } = req.body;

    await pool.query(
      `UPDATE crear_asesoria 
       SET titulo = $1, descripcion = $2, fecha = $3, horario = $4, cupo = $5
       WHERE id_crear_asesoria = $6`,
      [titulo, descripcion, fecha, horario, cupo, id]
    );

    res.json({ message: "Asesoría actualizada correctamente" });
  } catch (error) {
    console.error("Error al editar asesoría:", error);
    res.status(500).json({ error: "Error al editar asesoría" });
  }
});

// Cancelar (eliminar) asesoría
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


// Ruta para obtener todas las asesorías (para mostrar al alumno)
app.get("/alumno/asesorias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crear_asesoria ORDER BY fecha ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener asesorías para alumno:", error);
    res.status(500).json({ error: "Error al obtener asesorías" });
  }
});

// Endpoint para inscribirse en una asesoría
// ===========================================
// 📘 INSCRIBIR ALUMNO A UNA ASESORÍA
// ===========================================
app.post("/inscribir", async (req, res) => {
  const { id_usuario, id_crear_asesoria } = req.body;

  try {
    // 1️⃣ Verificar que la asesoría exista
    const asesoriaResult = await pool.query(
      "SELECT cupo, cuposOcupados FROM CREAR_ASESORIA WHERE id_crear_asesoria = $1",
      [id_crear_asesoria]
    );

    if (asesoriaResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Asesoría no encontrada" });
    }

    const { cupo, cuposocupados } = asesoriaResult.rows[0];

    // 2️⃣ Revisar si hay cupos disponibles
    if (cuposocupados >= cupo) {
      return res.status(400).json({ success: false, error: "Ya perteneces a esta asesoria:)" });
    }

    // 3️⃣ (Opcional) Verificar si el alumno ya está inscrito
    // Si tienes una tabla de inscripciones, puedes usar algo como:
    // const existe = await pool.query(
    //   "SELECT * FROM INSCRIPCIONES WHERE id_usuario = $1 AND id_crear_asesoria = $2",
    //   [id_usuario, id_crear_asesoria]
    // );
    // if (existe.rows.length > 0) {
    //   return res.status(400).json({ success: false, error: "Ya estás inscrito en esta asesoría" });
    // }

    // 4️⃣ Incrementar el contador de cupos ocupados
    await pool.query(
      "UPDATE CREAR_ASESORIA SET cuposOcupados = cuposOcupados + 1 WHERE id_crear_asesoria = $1",
      [id_crear_asesoria]
    );

    // 5️⃣ (Opcional) Registrar la inscripción si tienes una tabla
    // await pool.query(
    //   "INSERT INTO INSCRIPCIONES (id_usuario, id_crear_asesoria, fecha_inscripcion) VALUES ($1, $2, NOW())",
    //   [id_usuario, id_crear_asesoria]
    // );

    // 6️⃣ Respuesta exitosa
    res.json({ success: true, message: "Inscripción realizada con éxito" });
  } catch (error) {
    console.error("❌ Error en /inscribir:", error);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
});

//usua
//const express = require("express")
//const app = express()
//const pool = require("./db") // Assuming pool is imported from a database connection file

app.use(express.json())

// ===========================================
// 📋 OBTENER USUARIOS CON ROLES
// ===========================================
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id_usuario,
        CONCAT(u.nombres, ' ', u.apellidos) AS nombre,
        r.descripcion AS tipo,
        u.correo AS email,
        u.id_usuario AS numeroControl,
        u.roles_id_rol
      FROM usuarios u
      JOIN roles r ON u.roles_id_rol = r.id_rol
      ORDER BY u.nombres ASC
    `)

    res.json(result.rows)
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error)
    res.status(500).json({ error: "Error al obtener usuarios" })
  }
})

// ===========================================
// 📝 ACTUALIZAR DATOS DE USUARIO
// ===========================================
app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, email, numeroControl } = req.body

    // Separar nombre completo en nombres y apellidos
    const nombreParts = nombre.trim().split(" ")
    const nombres = nombreParts.slice(0, Math.ceil(nombreParts.length / 2)).join(" ")
    const apellidos = nombreParts.slice(Math.ceil(nombreParts.length / 2)).join(" ")

    await pool.query(
      `UPDATE usuarios 
       SET nombres = $1, apellidos = $2, correo = $3
       WHERE id_usuario = $4`,
      [nombres, apellidos, email, id],
    )

    res.json({ message: "Usuario actualizado correctamente" })
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error)
    res.status(500).json({ error: "Error al actualizar usuario" })
  }
})

// ===========================================
// 🔄 CAMBIAR ROL DE USUARIO
// ===========================================
app.put("/usuarios/:id/rol", async (req, res) => {
  try {
    const { id } = req.params
    const { rol } = req.body

    await pool.query(
      `UPDATE usuarios 
       SET roles_id_rol = $1
       WHERE id_usuario = $2`,
      [rol, id],
    )

    res.json({ message: "Rol actualizado correctamente" })
  } catch (error) {
    console.error("❌ Error al actualizar rol:", error)
    res.status(500).json({ error: "Error al actualizar rol" })
  }
})

// ... existing code here ...

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})



// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
