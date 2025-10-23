window.addEventListener("pageshow", (event) => {
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual") || localStorage.getItem("usuario"));
  if (!usuarioActual) {
    window.location.href = "index.html";
  }
});


// ----------------------
// Obtener usuario actual
// ----------------------
const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

if (usuarioActual) {
  // Actualizar nombre y código en la página
  const nombreElem = document.querySelector(".profile-name");
  const codigoElem = document.querySelector(".profile-code");

  nombreElem.textContent = usuarioActual.nombre;
  codigoElem.textContent = `${usuarioActual.id} - Electrónica Analógica`; // Cambia "Electrónica Analógica" según tu sistema
}


// ----------------------
// Botón Cerrar Sesión
// ----------------------
const btnLogout = document.querySelector(".btn-logout");

btnLogout.addEventListener("click", () => {
  // Borrar usuario de localStorage
  localStorage.removeItem("usuario");      // o "usuarioActual" si lo usas en Docente.js
  sessionStorage.clear();                   // limpia cualquier sessionStorage
  // Redirigir al login
  window.location.href = "index.html";
});


// ----------------------
// Data storage
// ----------------------
const asesorias = [
  {
    id: 1,
    titulo: "Diseño de Filtros Analógicos",
    descripcion: "Aprende a diseñar filtros analógicos paso a paso",
    fecha: "2024-01-22",
    horario: "10:00-12:00",
    inscritos: 8,
    cupos: 10,
    estudiantes: [
      { nombre: "Nombre del Alumno 1", codigo: "EST-2024-001", email: "correo@instituto.mx.edu" },
      { nombre: "Nombre del Alumno 2", codigo: "EST-2024-002", email: "correo@instituto.mx.edu" },
      { nombre: "Nombre del Alumno 3", codigo: "EST-2024-003", email: "correo@instituto.mx.edu" },
      { nombre: "Nombre del Alumno 4", codigo: "EST-2024-004", email: "correo@instituto.mx.edu" },
      { nombre: "Nombre del Alumno 5", codigo: "EST-2024-005", email: "correo@instituto.mx.edu" },
      { nombre: "Nombre del Alumno 6", codigo: "EST-2024-006", email: "correo@instituto.mx.edu" },
      { nombre: "Nombre del Alumno 7", codigo: "EST-2024-007", email: "correo@instituto.mx.edu" },
      { nombre: "Nombre del Alumno 8", codigo: "EST-2024-008", email: "correo@instituto.mx.edu" },
    ],
  },
];

let nextId = 2;

// ----------------------
// Tab switching
// ----------------------
document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    const tabName = button.dataset.tab;

    document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"));
    document.getElementById(`${tabName}-tab`).classList.add("active");
  });
});

// ----------------------
// Modal functions
// ----------------------
function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
});

// ----------------------
// Render asesorías
// ----------------------
function renderAsesorias() {
  const container = document.getElementById("asesorias-list");

  if (asesorias.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay asesorías programadas</p>';
    return;
  }

  container.innerHTML = asesorias
    .map(
      (asesoria) => `
      <div class="asesoria-card">
        <div class="asesoria-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="asesoria-info">
          <h3 class="asesoria-title">${asesoria.titulo}</h3>
          <p class="asesoria-datetime">${formatDate(asesoria.fecha)} • ${asesoria.horario}</p>
          <div class="asesoria-details">
            <div class="asesoria-detail">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              ${asesoria.inscritos}/${asesoria.cupos} inscritos
            </div>
            <div class="asesoria-detail">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${asesoria.horario}
            </div>
          </div>
        </div>
        <span class="badge badge-programada">programada</span>
        <div class="asesoria-actions">
          <button class="btn-icon" onclick="verEstudiantes(${asesoria.id})" title="Ver Inscritos">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
          <button class="btn-icon" onclick="editarAsesoria(${asesoria.id})" title="Editar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

// ----------------------
// Otras funciones (formatDate, crear, editar, ver estudiantes)
// ----------------------

// Format date
function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00")
  const options = { year: "numeric", month: "2-digit", day: "2-digit" }
  return date.toLocaleDateString("es-MX", options)
}

// Nueva asesoría
document.getElementById("btn-nueva-asesoria").addEventListener("click", () => {
  document.getElementById("form-crear-asesoria").reset()
  openModal("modal-crear")
})

document.getElementById("form-crear-asesoria").addEventListener("submit", (e) => {
  e.preventDefault()

  const nuevaAsesoria = {
    id: nextId++,
    titulo: document.getElementById("crear-titulo").value,
    descripcion: document.getElementById("crear-descripcion").value,
    fecha: document.getElementById("crear-fecha").value,
    horario: document.getElementById("crear-horario").value,
    cupos: Number.parseInt(document.getElementById("crear-cupos").value),
    inscritos: 0,
    estudiantes: [],
  }

  asesorias.push(nuevaAsesoria)
  renderAsesorias()
  closeModal("modal-crear")
})

// Editar asesoría
function editarAsesoria(id) {
  const asesoria = asesorias.find((a) => a.id === id)
  if (!asesoria) return

  document.getElementById("editar-id").value = asesoria.id
  document.getElementById("editar-titulo").value = asesoria.titulo
  document.getElementById("editar-descripcion").value = asesoria.descripcion
  document.getElementById("editar-fecha").value = asesoria.fecha
  document.getElementById("editar-horario").value = asesoria.horario
  document.getElementById("editar-cupos").value = asesoria.cupos

  openModal("modal-editar")
}

document.getElementById("form-editar-asesoria").addEventListener("submit", (e) => {
  e.preventDefault()

  const id = Number.parseInt(document.getElementById("editar-id").value)
  const asesoria = asesorias.find((a) => a.id === id)

  if (asesoria) {
    asesoria.titulo = document.getElementById("editar-titulo").value
    asesoria.descripcion = document.getElementById("editar-descripcion").value
    asesoria.fecha = document.getElementById("editar-fecha").value
    asesoria.horario = document.getElementById("editar-horario").value
    asesoria.cupos = Number.parseInt(document.getElementById("editar-cupos").value)

    renderAsesorias()
    closeModal("modal-editar")
  }
})

// Ver estudiantes
function verEstudiantes(id) {
  const asesoria = asesorias.find((a) => a.id === id)
  if (!asesoria) return

  const container = document.getElementById("estudiantes-list")

  if (asesoria.estudiantes.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666;">No hay estudiantes inscritos</p>'
  } else {
    container.innerHTML = asesoria.estudiantes
      .map(
        (estudiante) => `
      <div class="estudiante-item">
        <div class="estudiante-avatar">A</div>
        <div class="estudiante-info">
          <div class="estudiante-name">${estudiante.nombre}</div>
          <div class="estudiante-code">${estudiante.codigo}</div>
        </div>
        <div class="estudiante-email">${estudiante.email}</div>
      </div>
    `,
      )
      .join("")
  }

  openModal("modal-estudiantes")
}

// Initialize
renderAsesorias();
