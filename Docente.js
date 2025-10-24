// ===============================
// Verificación de sesión
// ===============================
window.addEventListener("pageshow", () => {
  const usuarioActual =
    JSON.parse(localStorage.getItem("usuarioActual")) ||
    JSON.parse(localStorage.getItem("usuario"));

  if (!usuarioActual) {
    window.location.href = "index.html";
  }
});

// ===============================
// Datos del docente logueado
// ===============================
const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
const API_URL = "http://localhost:3000";

if (usuarioActual) {
  document.querySelector(".profile-name").textContent =
    usuarioActual.nombres + " " + usuarioActual.apellidos;
  document.querySelector(".profile-code").textContent =
    `${usuarioActual.id_usuario} - Electrónica Analógica`;
}

// ===============================
// Cerrar sesión
// ===============================
document.querySelector(".btn-logout").addEventListener("click", () => {
  localStorage.removeItem("usuario");
  localStorage.removeItem("usuarioActual");
  sessionStorage.clear();
  window.location.href = "index.html";
});

// ===============================
// Variables
// ===============================
let asesorias = [];
let nextId = 1;

// ===============================
// Tabs
// ===============================
document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    const tabName = button.dataset.tab;

    document
      .querySelectorAll(".tab-button")
      .forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));
    document.getElementById(`${tabName}-tab`).classList.add("active");
  });
});

// ===============================
// Modal helpers
// ===============================
function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });
});

// ===============================
// Render asesorías
// ===============================
function renderAsesorias() {
  const container = document.getElementById("asesorias-list");

  if (asesorias.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #666; padding: 2rem;">No hay asesorías programadas</p>';
    return;
  }

  container.innerHTML = asesorias
    .map(
      (asesoria) => `
      <div class="asesoria-card">
        <div class="asesoria-info">
          <h3 class="asesoria-title">${asesoria.titulo}</h3>
          <p class="asesoria-datetime">${formatDate(
            asesoria.fecha
          )} • ${asesoria.horario}</p>
          <div class="asesoria-details">
            <div class="asesoria-detail">
              👥 ${asesoria.cuposocupados || 0}/${asesoria.cupo} inscritos
            </div>
          </div>
        </div>
        <span class="badge badge-programada">Programada</span>
        <div class="asesoria-actions">
          <button class="btn-icon" onclick="verEstudiantes('${
            asesoria.id_crear_asesoria
          }')" title="Ver Inscritos">👁️</button>
          <button class="btn-icon" onclick="editarAsesoria('${
            asesoria.id_crear_asesoria
          }')" title="Editar">✏️</button>
        </div>
      </div>
    `
    )
    .join("");
}

// ===============================
// Formatear fecha
// ===============================
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// ===============================
// Cargar asesorías desde BD
// ===============================
async function cargarAsesorias() {
  try {
    const res = await fetch(`${API_URL}/asesorias`);
    asesorias = await res.json();
    renderAsesorias();
  } catch (err) {
    console.error("Error al cargar asesorías:", err);
  }
}

// ===============================
// Crear nueva asesoría
// ===============================
document
  .getElementById("btn-nueva-asesoria")
  .addEventListener("click", () => {
    document.getElementById("form-crear-asesoria").reset();
    openModal("modal-crear");
  });

document
  .getElementById("form-crear-asesoria")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevaAsesoria = {
      id_crear_asesoria: `ASES${Date.now()}`,
      usuarios_id_usuario: usuarioActual.id_usuario,
      titulo: document.getElementById("crear-titulo").value,
      descripcion: document.getElementById("crear-descripcion").value,
      fecha: document.getElementById("crear-fecha").value,
      horario: document.getElementById("crear-horario").value,
      cupo: parseInt(document.getElementById("crear-cupos").value),
    };

    try {
      const res = await fetch(`${API_URL}/asesorias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaAsesoria),
      });

      if (!res.ok) throw new Error("Error al crear la asesoría");

      alert("✅ Asesoría creada correctamente");
      closeModal("modal-crear");
      cargarAsesorias();
    } catch (error) {
      console.error(error);
      alert("❌ Error al crear la asesoría");
    }
  });

// ===============================
// Editar asesoría
// ===============================
function editarAsesoria(id) {
  const asesoria = asesorias.find((a) => a.id_crear_asesoria === id);
  if (!asesoria) return;

  document.getElementById("editar-id").value = asesoria.id_crear_asesoria;
  document.getElementById("editar-titulo").value = asesoria.titulo;
  document.getElementById("editar-descripcion").value = asesoria.descripcion;
  document.getElementById("editar-fecha").value = asesoria.fecha;
  document.getElementById("editar-horario").value = asesoria.horario;
  document.getElementById("editar-cupos").value = asesoria.cupo;

  openModal("modal-editar");
}

document
  .getElementById("form-editar-asesoria")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editar-id").value;
    const asesoriaActualizada = {
      titulo: document.getElementById("editar-titulo").value,
      descripcion: document.getElementById("editar-descripcion").value,
      fecha: document.getElementById("editar-fecha").value,
      horario: document.getElementById("editar-horario").value,
      cupo: parseInt(document.getElementById("editar-cupos").value),
    };

    try {
      const res = await fetch(`${API_URL}/asesorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asesoriaActualizada),
      });

      if (!res.ok) throw new Error("Error al editar la asesoría");

      alert("✏️ Asesoría actualizada correctamente");
      closeModal("modal-editar");
      cargarAsesorias();
    } catch (error) {
      console.error(error);
      alert("❌ Error al editar la asesoría");
    }
  });

// ===============================
// Ver estudiantes inscritos
// ===============================
async function verEstudiantes(id_crear_asesoria) {
  try {
const res = await fetch(`${API_URL}/asesorias/${id_crear_asesoria}/inscritos`);
    const estudiantes = await res.json();

    const container = document.getElementById("estudiantes-list");

    if (!estudiantes.length) {
      container.innerHTML =
        '<p style="text-align: center; color: #666;">No hay estudiantes inscritos</p>';
    } else {
      container.innerHTML = estudiantes
        .map(
          (e) => `
        <div class="estudiante-item">
          <div class="estudiante-avatar">👩‍🎓</div>
          <div class="estudiante-info">
            <div class="estudiante-name">${e.nombres} ${e.apellidos}</div>
            <div class="estudiante-code">${e.id_usuario}</div>
          </div>
          <div class="estudiante-email">${e.correo}</div>
        </div>
      `
        )
        .join("");
    }

    openModal("modal-estudiantes");
  } catch (err) {
    console.error("Error al cargar estudiantes:", err);
  }
}

// ===============================
// Inicialización
// ===============================
cargarAsesorias();
