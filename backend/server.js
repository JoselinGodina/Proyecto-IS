// backend/server.js
const express = require("express")
const cors = require("cors")
const { Pool } = require("pg")
const bcrypt = require("bcrypt")
const path = require("path")
const { v4: uuidv4 } = require("uuid")

const app = express()
const PORT = 3000

// ============================
// Configuración PostgreSQL
// ============================
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ProyectoIs",
  password: "270704",
  port: 5432,
})

// ============================
// Middlewares
// ============================
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "../")))

// ============================
// Rutas base
// ============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"))
})

app.get("/ping", (req, res) => res.send("Servidor funcionando correctamente 🚀"))

// ============================
// 🧍 Registro de usuario
// ============================
app.post("/register", async (req, res) => {
  try {
    const { id_usuario, nombres, apellidos, carreras_id_carreras, correo, semestre, contrasena } = req.body

    if (!id_usuario || !nombres || !apellidos || !carreras_id_carreras || !correo || !semestre || !contrasena) {
      return res.status(400).json({ error: "Faltan datos obligatorios" })
    }

    const userExist = await pool.query("SELECT * FROM usuarios WHERE id_usuario = $1 OR correo = $2", [
      id_usuario,
      correo,
    ])
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "El usuario o correo ya están registrados" })
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10)

    await pool.query(
      `INSERT INTO usuarios (ID_USUARIO, CARRERAS_ID_CARRERAS, NOMBRES, APELLIDOS, CORREO, SEMESTRE, CONTRASENA, ROLES_ID_ROL)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 3)`,
      [id_usuario, carreras_id_carreras, nombres, apellidos, correo, semestre, hashedPassword],
    )

    res.status(201).json({ message: "Usuario registrado correctamente" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error en el servidor" })
  }
})

// ============================
// 🔐 Login
// ============================
app.post("/login", async (req, res) => {
  try {
    const { correo, contrasena } = req.body
    if (!correo || !contrasena) return res.status(400).json({ error: "Faltan datos" })

    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo])
    if (result.rows.length === 0) return res.status(401).json({ error: "Correo no registrado" })

    const user = result.rows[0]
    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena)
    if (!passwordMatch) return res.status(401).json({ error: "Contraseña incorrecta" })

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
    })
  } catch (error) {
    console.error("❌ Error en /login:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// ============================
// 📘 CRUD: CREAR_ASESORIA
// ============================
app.get("/asesorias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crear_asesoria ORDER BY fecha ASC")
    res.json(result.rows)
  } catch (error) {
    console.error("Error al obtener asesorías:", error)
    res.status(500).json({ error: "Error al obtener asesorías" })
  }
})

app.post("/asesorias", async (req, res) => {
  try {
    const { id_crear_asesoria, usuarios_id_usuario, titulo, descripcion, fecha, horario, cupo } = req.body
    await pool.query(
      `INSERT INTO crear_asesoria (id_crear_asesoria, usuarios_id_usuario, titulo, descripcion, fecha, horario, cupo, cuposocupados)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0)`,
      [id_crear_asesoria, usuarios_id_usuario, titulo, descripcion, fecha, horario, cupo],
    )
    res.status(201).json({ message: "Asesoría creada correctamente" })
  } catch (error) {
    console.error("Error al crear asesoría:", error)
    res.status(500).json({ error: "Error al crear asesoría" })
  }
})

app.put("/asesorias/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { titulo, descripcion, fecha, horario, cupo } = req.body
    await pool.query(
      `UPDATE crear_asesoria 
       SET titulo=$1, descripcion=$2, fecha=$3, horario=$4, cupo=$5 
       WHERE id_crear_asesoria=$6`,
      [titulo, descripcion, fecha, horario, cupo, id],
    )
    res.json({ message: "Asesoría actualizada correctamente" })
  } catch (error) {
    console.error("Error al editar asesoría:", error)
    res.status(500).json({ error: "Error al editar asesoría" })
  }
})

app.delete("/asesorias/:id", async (req, res) => {
  try {
    const { id } = req.params
    await pool.query("DELETE FROM crear_asesoria WHERE id_crear_asesoria = $1", [id])
    res.json({ message: "Asesoría cancelada correctamente" })
  } catch (error) {
    console.error("Error al cancelar asesoría:", error)
    res.status(500).json({ error: "Error al cancelar asesoría" })
  }
})

app.get("/asesorias/:id/inscritos", async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT 
         u.id_usuario, 
         u.nombres, 
         u.apellidos, 
         u.correo, 
         i.fecha_inscripcion
       FROM inscripciones i
       INNER JOIN usuarios u ON u.id_usuario = i.id_usuario
       WHERE i.id_crear_asesoria = $1`,
      [id],
    )

    if (result.rows.length === 0) {
      console.log("No se encontraron inscritos para la asesoría:", id)
    }

    res.json(result.rows)
  } catch (error) {
    console.error("Error al obtener inscritos:", error)
    res.status(500).json({ error: "Error al obtener inscritos" })
  }
})

// ============================
// 👩‍🎓 Asesorías visibles para alumnos
// ============================
app.get("/alumno/asesorias", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crear_asesoria ORDER BY fecha ASC")
    res.json(result.rows)
  } catch (error) {
    console.error("Error al obtener asesorías para alumno:", error)
    res.status(500).json({ error: "Error al obtener asesorías" })
  }
})

// ============================
// 🧾 Tabla INSCRIPCIONES
// ============================

app.get("/inscripciones/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params
    const result = await pool.query(
      `SELECT i.id_inscripcion, i.fecha_inscripcion, c.titulo, c.descripcion, c.fecha, c.horario 
       FROM inscripciones i
       JOIN crear_asesoria c ON i.id_crear_asesoria = c.id_crear_asesoria
       WHERE i.id_usuario = $1`,
      [id_usuario],
    )
    res.json(result.rows)
  } catch (error) {
    console.error("Error al obtener inscripciones:", error)
    res.status(500).json({ error: "Error al obtener inscripciones" })
  }
})

app.post("/inscribir", async (req, res) => {
  const { id_usuario, id_crear_asesoria } = req.body

  try {
    const asesoriaResult = await pool.query(
      "SELECT cupo, cuposocupados FROM crear_asesoria WHERE id_crear_asesoria = $1",
      [id_crear_asesoria],
    )

    if (asesoriaResult.rows.length === 0)
      return res.status(404).json({ success: false, error: "Asesoría no encontrada" })

    const { cupo, cuposocupados } = asesoriaResult.rows[0]

    const existe = await pool.query("SELECT * FROM inscripciones WHERE id_usuario = $1 AND id_crear_asesoria = $2", [
      id_usuario,
      id_crear_asesoria,
    ])
    if (existe.rows.length > 0)
      return res.status(400).json({ success: false, error: "Ya estás inscrito en esta asesoría" })

    if (cuposocupados >= cupo) return res.status(400).json({ success: false, error: "cupo lleno" })

    await pool.query(
      `INSERT INTO inscripciones (id_usuario, id_crear_asesoria, fecha_inscripcion)
       VALUES ($1, $2, NOW())`,
      [id_usuario, id_crear_asesoria],
    )

    await pool.query("UPDATE crear_asesoria SET cuposocupados = cuposocupados + 1 WHERE id_crear_asesoria = $1", [
      id_crear_asesoria,
    ])

    res.json({ success: true, message: "Inscripción realizada correctamente" })
  } catch (error) {
    console.error("❌ Error en /inscribir:", error)
    res.status(500).json({ success: false, error: "Error en el servidor" })
  }
})

// ============================
// 📋 USUARIOS CON ROLES
// ============================
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

app.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, email, numeroControl } = req.body

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

// ============================
// 📦 CRUD: CATEGORÍAS Y MATERIALES
// ============================

app.get("/categorias", async (req, res) => {
  try {
    console.log("[v0 Server] GET /categorias - Consultando base de datos...")
    const result = await pool.query(`
      SELECT id_categoria, nombre
      FROM categoria 
      ORDER BY id_categoria ASC
    `)
    console.log("[v0 Server] Categorías encontradas:", result.rows.length)
    res.json(result.rows)
  } catch (error) {
    console.error("[v0 Server] Error al obtener categorías:", error)
    res.status(500).json({ error: "Error al obtener categorías: " + error.message })
  }
})

app.get("/materiales", async (req, res) => {
  try {
    console.log("[v0 Server] GET /materiales - Consultando base de datos...")
    const result = await pool.query(`
      SELECT 
        m.id_materiales,
        m.nombre,
        c.nombre AS categoria,
        m.cantidad_disponible,
        m.cantidad_daniados
      FROM materiales m
      JOIN categoria c ON m.categoria_id_categoria = c.id_categoria
      ORDER BY m.nombre ASC
    `)

    console.log("[v0 Server] Materiales encontrados:", result.rows.length)
    res.json(result.rows)
  } catch (error) {
    console.error("[v0 Server] Error al obtener materiales:", error)
    res.status(500).json({ error: "Error al obtener materiales: " + error.message })
  }
})

app.post("/materiales", async (req, res) => {
  try {
    console.log("[v0 Server] POST /materiales - Datos recibidos:", req.body)
    const { id_materiales, nombre, categoria_id_categoria } = req.body

    if (!id_materiales || !nombre || !categoria_id_categoria) {
      return res.status(400).json({ error: "Faltan datos obligatorios" })
    }

    const materialExist = await pool.query("SELECT * FROM materiales WHERE id_materiales = $1", [id_materiales])

    if (materialExist.rows.length > 0) {
      return res.status(400).json({ error: "El código de material ya existe" })
    }

    await pool.query(
      `INSERT INTO materiales (id_materiales, nombre, categoria_id_categoria, cantidad_disponible, cantidad_daniados)
       VALUES ($1, $2, $3, 0, 0)`,
      [id_materiales, nombre, categoria_id_categoria],
    )

    console.log("[v0 Server] Material agregado exitosamente")
    res.status(201).json({ message: "Material agregado correctamente" })
  } catch (error) {
    console.error("[v0 Server] Error al crear material:", error)
    res.status(500).json({ error: "Error al crear material: " + error.message })
  }
})

app.put("/materiales/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { cantidad } = req.body

    const result = await pool.query(
      `UPDATE materiales 
       SET cantidad_disponible = cantidad_disponible + $1
       WHERE id_materiales = $2
       RETURNING *`,
      [cantidad, id],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Material no encontrado" })
    }

    res.json({ message: "Cantidad actualizada correctamente", material: result.rows[0] })
  } catch (error) {
    console.error("Error al actualizar material:", error)
    res.status(500).json({ error: "Error al actualizar el material" })
  }
})

app.put("/materiales/editar/:id_materiales", async (req, res) => {
  try {
    const { id_materiales } = req.params
    const { nuevoNombre, categoria_id, cantidad_daniados, cantidad_disponible } = req.body

    console.log("[v0 Server] PUT /materiales/editar/:id_materiales", {
      id_materiales,
      nuevoNombre,
      categoria_id,
      cantidad_daniados,
      cantidad_disponible,
    })

    const result = await pool.query(
      `UPDATE materiales 
       SET nombre = $1, 
           categoria_id_categoria = $2, 
           cantidad_daniados = $3, 
           cantidad_disponible = $4
       WHERE id_materiales = $5
       RETURNING *`,
      [nuevoNombre, categoria_id, cantidad_daniados, cantidad_disponible, id_materiales],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Material no encontrado" })
    }

    console.log("[v0 Server] Material actualizado exitosamente:", result.rows[0])
    res.json({ message: "Material actualizado exitosamente", material: result.rows[0] })
  } catch (error) {
    console.error("[v0 Server] Error al actualizar material:", error)
    res.status(500).json({ error: "Error al actualizar material: " + error.message })
  }
})

app.post("/materiales/multiples", async (req, res) => {
  try {
    const materiales = req.body.materiales

    if (!materiales || materiales.length === 0) {
      return res.status(400).json({ error: "No se recibieron materiales" })
    }

    for (const mat of materiales) {
      const { id_materiales, nombre, categoria_id_categoria } = mat

      if (!id_materiales || !nombre || !categoria_id_categoria) {
        return res.status(400).json({ error: "Faltan datos obligatorios" })
      }

      const materialExist = await pool.query("SELECT * FROM materiales WHERE id_materiales = $1", [id_materiales])

      if (materialExist.rows.length > 0) {
        continue
      }

      await pool.query(
        `INSERT INTO materiales 
          (id_materiales, nombre, categoria_id_categoria, cantidad_disponible, cantidad_daniados)
         VALUES ($1, $2, $3, 0, 0)`,
        [id_materiales, nombre, categoria_id_categoria],
      )
    }

    res.json({ success: true, message: "Materiales guardados correctamente" })
  } catch (error) {
    console.error("Error al guardar múltiples materiales:", error)
    res.status(500).json({ error: error.message })
  }
})

// ============================
// 📋 VALES DE PRÉSTAMO
// ============================

app.post("/vales-prestamo", async (req, res) => {
  try {
    const { id_usuario, materiales, hora_entrega, motivo } = req.body

    if (!id_usuario || !materiales || materiales.length === 0) {
      return res.status(400).json({ error: "Datos incompletos para crear el vale" })
    }

    const idVale = uuidv4()
    const estadoId = "E01"
    const horaEntrega = new Date().toLocaleTimeString("en-GB")

    await pool.query(
      `
      INSERT INTO vales_prestamos 
        (id_vales, usuarios_id_usuario, estado_id_estado, hora_entrega, motivo)
      VALUES ($1, $2, $3, $4::time, COALESCE($5::varchar, ''))
    `,
      [idVale, id_usuario, estadoId, horaEntrega, motivo?.toString() || ""],
    )

    for (const material of materiales) {
      const cantidad = Number.parseFloat(material.cantidad) || 0

      if (!material.id_materiales) {
        console.warn("Material sin id_materiales:", material)
        continue
      }

      await pool.query(
        `
        INSERT INTO vales_has_materiales 
          (vales_prestamos_id_vales, materiales_id_materiales, cantidad)
        VALUES ($1, $2, $3)
      `,
        [idVale, material.id_materiales, cantidad],
      )
    }

    res.json({ success: true, message: "Vale registrado correctamente", id_vales: idVale })
  } catch (err) {
    console.error("Error al registrar vale:", err)
    res.status(500).json({ error: "Error al registrar el vale: " + err.message })
  }
})

app.get("/vales-prestamo/usuario/:id_usuario", async (req, res) => {
  try {
    const { id_usuario } = req.params
    const result = await pool.query(
      `SELECT v.id_vales, v.hora_entrega, v.hora_devolucion, e.descripcion AS estado, v.motivo,
              STRING_AGG(m.nombre, ', ') AS materiales
       FROM vales_prestamos v
       LEFT JOIN vales_has_materiales vh ON v.id_vales = vh.vales_prestamos_id_vales
       LEFT JOIN materiales m ON vh.materiales_id_materiales = m.id_materiales
       LEFT JOIN estado e ON v.estado_id_estado = e.id_estado
       WHERE v.usuarios_id_usuario = $1
       GROUP BY v.id_vales, e.descripcion
       ORDER BY v.hora_entrega DESC`,
      [id_usuario],
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Error al obtener vales de préstamo:", error)
    res.status(500).json({ error: "Error al obtener vales de préstamo: " + error.message })
  }
})

// Codigos para la parte de solicitudes en la pantalla del administrador

// 1. GET - Obtener todas las solicitudes pendientes con los datos de la consulta
app.get('/solicitudes-prestamo', async (req, res) => {
  try {
    const query = `
      SELECT 
  (u.nombres || ' ' || u.apellidos) as nombre,
  u.id_usuario,
  m.nombre as nombre_material,  -- ← ALIAS DIFERENTE
  vp.hora_entrega,
  vp.motivo,
  vm.cantidad,
  e.descripcion,
  vp.id_vales
FROM usuarios u
JOIN vales_prestamos vp ON vp.usuarios_id_usuario = u.id_usuario
JOIN vales_has_materiales vm ON vm.vales_prestamos_id_vales = vp.id_vales
JOIN materiales m ON vm.materiales_id_materiales = m.id_materiales
JOIN estado e ON e.id_estado = vp.estado_id_estado
WHERE vp.estado_id_estado = 'E01'
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. PUT - Aprobar solicitud (cambiar E01 a E02)
app.put('/solicitudes-prestamo/:id/aprobar', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE vales_prestamos 
      SET estado_id_estado = 'E02' 
      WHERE id_vales = $1
    `;
    
    await pool.query(query, [id]);
    
    res.json({ 
      success: true, 
      message: 'Solicitud aprobada exitosamente' 
    });
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 3. PUT - Rechazar solicitud (cambiar E01 a E03)
app.put('/solicitudes-prestamo/:id/rechazar', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      UPDATE vales_prestamos 
      SET estado_id_estado = 'E03' 
      WHERE id_vales = $1
    `;
    
    await pool.query(query, [id]);
    
    res.json({ 
      success: true, 
      message: 'Solicitud rechazada' 
    });
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================
// 🚀 Iniciar servidor
// ============================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

