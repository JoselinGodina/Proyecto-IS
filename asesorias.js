const API_URL = "http://localhost:3000/asesorias"

// Guardar asesorías en memoria
let asesorias = []
let editandoAsesoriaId = null
let adminLogueado = null

// Función para obtener usuario de localStorage
function obtenerUsuarioLogueado() {
  const usuarioGuardado = localStorage.getItem("usuario")
  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado)
    return {
      id_usuario: usuario.id_usuario,
      nombres: `${usuario.nombres} ${usuario.apellidos}`,
      rol:
        usuario.roles_id_rol === "1"
          ? "Administrador"
          : usuario.roles_id_rol === "2"
          ? "Docente"
          : "Alumno",
    }
  }
  // Fallback si no hay usuario en localStorage
  return {
    id_usuario: "ADM001",
    nombres: "Usuario Desconocido",
    rol: "Administrador del sistema",
  }
}

// Inicializar usuario al cargar
adminLogueado = obtenerUsuarioLogueado()

// 🔹 Inicializar asesorías desde la BD
async function inicializarAsesorias() {
  try {
    const res = await fetch(API_URL)
    const data = await res.json()

    // Mapear para agregar instructor y estado si faltan
    asesorias = data.map((a) => ({
      id: a.id_crear_asesoria,
      titulo: a.titulo,
      descripcion: a.descripcion,
      fecha: a.fecha,
      horario: a.horario,
      cuposTotal: a.cupo,
      cuposOcupados: a.cuposocupados || 0,
      estado: a.estado || "Programado",
      instructor: a.instructor || "",
    }))

    renderizarAsesorias()
    mostrarAdminLogueado()
  } catch (error) {
    console.error("Error al obtener asesorías:", error)
  }
}

// 🔹 Guardar (crear o editar)
async function guardarAsesoria(event) {
  event.preventDefault()

  const titulo = document.getElementById("titulo").value
  const descripcion = document.getElementById("descripcion").value
  const fecha = document.getElementById("fecha").value
  const horario = document.getElementById("horario").value
  const cupos = document.getElementById("cupos").value
  const instructorField = document.getElementById("instructor")
  const instructor = instructorField ? instructorField.value : ""

  const data = {
    id_crear_asesoria: editandoAsesoriaId || generarID(),
    usuarios_id_usuario: adminLogueado.id_usuario,
    titulo,
    descripcion,
    fecha,
    horario,
    cupo: cupos,
    estado: "Programado",
    instructor,
  }

  try {
    if (editandoAsesoriaId) {
      await fetch(`${API_URL}/${editandoAsesoriaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    }

    cerrarModal()
    inicializarAsesorias()
  } catch (error) {
    console.error("Error al guardar asesoría:", error)
  }
}

// 🔹 Cancelar asesoría
async function cancelarAsesoria(id) {
  Swal.fire({
    title: "¿Cancelar asesoría?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, cancelar",
    cancelButtonText: "No, regresar"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        Swal.fire({
          title: "Asesoría cancelada",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });

        inicializarAsesorias();

      } catch (error) {
        console.error("Error al cancelar asesoría:", error);

        Swal.fire({
          title: "Error",
          text: "No se pudo cancelar la asesoría",
          icon: "error"
        });
      }
    }
  });
}


// 🔹 Generar ID
function generarID() {
  return "AS" + Math.floor(Math.random() * 10000)
}

// 🔹 Renderizar asesorías
function renderizarAsesorias() {
  const listContainer = document.getElementById("asesoriasList")
  const emptyState = document.getElementById("emptyState")

  if (asesorias.length === 0) {
    listContainer.classList.remove("active")
    emptyState.classList.add("active")
    return
  }

  emptyState.classList.remove("active")
  listContainer.classList.add("active")

  listContainer.innerHTML = asesorias
    .map((asesoria) => {
      const porcentajeOcupado =
        (asesoria.cuposOcupados / asesoria.cuposTotal) * 100
      const fechaFormateada = new Date(asesoria.fecha).toLocaleDateString(
        "es-MX"
      )

      return `
            <div class="asesoria-card">
                <span class="status-badge">${asesoria.estado}</span>

                <div class="asesoria-header">
                    <div class="asesoria-title-section">
                        <div class="asesoria-title">
                            <h3>${asesoria.titulo}</h3>
                        </div>
                        <p class="asesoria-description">${asesoria.descripcion}</p>
                    </div>
                </div>

                <div class="asesoria-info">
                    <div class="info-item">
                        <span class="info-label">Fecha</span>
                        <span class="info-value">${fechaFormateada}</span>
                    </div>

                    <div class="info-item">
                        <span class="info-label">Horario</span>
                        <span class="info-value">${asesoria.horario}</span>
                    </div>

                    <div class="info-item">
                        <span class="info-label">Cupos</span>
                        <span class="info-value">${asesoria.cuposOcupados}/${asesoria.cuposTotal}</span>
                    </div>
                </div>

                <div class="cupos-section">
                    <div class="cupos-label">
                        <span>Cupos ocupados</span>
                        <span>${asesoria.cuposOcupados}/${asesoria.cuposTotal}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${porcentajeOcupado}%"></div>
                    </div>
                </div>

                <div class="asesoria-actions">
                    <button class="btn-ver" onclick="verInscritos('${asesoria.id}')">Ver inscritos</button>
                    <button class="btn-editar" onclick="editarAsesoria('${asesoria.id}')">Editar</button>
                    <button class="btn-cancelar" onclick="cancelarAsesoria('${asesoria.id}')">Cancelar</button>
                </div>
            </div>
        `
    })
    .join("")
}

// 🔹 Editar asesoría
function editarAsesoria(id) {
  const asesoria = asesorias.find((a) => String(a.id) === String(id))

  if (!asesoria) {
    console.error("No se encontró la asesoría con id:", id)
    return
  }

  editandoAsesoriaId = id

  document.getElementById("modalTitle").textContent = "Editar Asesoría"
  document.getElementById("modalSubtitle").textContent = `Modifica la información de la asesoría "${asesoria.titulo}"`
  document.getElementById("submitBtn").textContent = "Guardar Cambios"
  document.getElementById("cuposLabel").textContent = "Cupos Totales"

  const instructorGroup = document.getElementById("instructorGroup")
  if (instructorGroup) instructorGroup.style.display = "block"

  document.getElementById("titulo").value = asesoria.titulo
  document.getElementById("descripcion").value = asesoria.descripcion

  const instructorField = document.getElementById("instructor")
  if (instructorField) instructorField.value = asesoria.instructor

  document.getElementById("fecha").value = asesoria.fecha.split("T")[0]
  document.getElementById("horario").value = asesoria.horario
  document.getElementById("cupos").value = asesoria.cuposTotal

  abrirModal()
}

// 🔹 Abrir/Cerrar modal
function abrirModal() {
  document.getElementById("modalOverlay").classList.add("active")
  document.body.style.overflow = "hidden"
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.remove("active")
  document.body.style.overflow = "auto"
  document.getElementById("asesoriaForm").reset()

  editandoAsesoriaId = null
  document.getElementById("modalTitle").textContent = "Crear Nueva Asesoría"
  document.getElementById("modalSubtitle").textContent =
    "Programa una nueva asesoría para los estudiantes"
  document.getElementById("submitBtn").textContent = "Crear Asesoría"
  document.getElementById("cuposLabel").textContent = "Cupos Disponibles"

  const instructorGroup = document.getElementById("instructorGroup")
  if (instructorGroup) instructorGroup.style.display = "none"
}

function cerrarModalSiClickFuera(event) {
  if (event.target === event.currentTarget) cerrarModal()
}


//ver inscritos
async function verInscritos(idAsesoria) {
  try {
    const res = await fetch(`${API_URL}/${idAsesoria}/inscritos`)
    const inscritos = await res.json()

    let contenido = ""

    if (inscritos.length === 0) {
      contenido = "<p>No hay alumnos inscritos en esta asesoría.</p>"
    } else {
      contenido = `
        <table class="tabla-inscritos">
          <thead>
            <tr>
              <th>ID Usuario</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Fecha de inscripción</th>
            </tr>
          </thead>
          <tbody>
            ${inscritos
              .map(
                (alumno) => `
              <tr>
                <td>${alumno.id_usuario}</td>
                <td>${alumno.nombres} ${alumno.apellidos}</td>
                <td>${alumno.correo}</td>
                <td>${new Date(alumno.fecha_inscripcion).toLocaleString("es-MX")}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `
    }

    mostrarModalInscritos(contenido)
  } catch (error) {
    console.error("Error al obtener inscritos:", error)
    Swal.fire("No se pudieron cargar los alumnos inscritos.")
  }
}

function mostrarModalInscritos(contenidoHTML) {
  const modal = document.getElementById("modalInscritos");
  const lista = document.getElementById("listaInscritos");

  lista.innerHTML = contenidoHTML; // mostramos el HTML generado

  modal.style.display = "flex";
}



// 🔹 Mostrar admin logueado en la parte superior
function mostrarAdminLogueado() {
  const adminName = document.querySelector(".admin-details h3")
  const adminId = document.querySelector(".admin-details p")

  if (adminName) adminName.textContent = adminLogueado.nombres
  if (adminId)
    adminId.textContent = `${adminLogueado.id_usuario} - ${adminLogueado.rol}`
}

// 🔹 Cerrar sesión
function cerrarSesion() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("usuario")
    localStorage.clear()
    window.location.href = "index.html"
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") cerrarModal()
})

window.addEventListener("DOMContentLoaded", inicializarAsesorias)
