const API_URL = "http://localhost:3000/asesorias";

window.addEventListener("pageshow", (event) => {
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual") || localStorage.getItem("usuario"));
  if (!usuarioActual) {
    window.location.href = "index.html";
  }
});
const btnLogout = document.querySelector(".btn-logout");

btnLogout.addEventListener("click", () => {
  // Borrar usuario de localStorage
  localStorage.removeItem("usuario");      // o "usuarioActual" si lo usas en Docente.js
  sessionStorage.clear();                   // limpia cualquier sessionStorage
  // Redirigir al login
  window.location.href = "index.html";
});
// Guardar asesorías en memoria
let asesorias = [];
let editandoAsesoriaId = null;

// Simular admin logueado
const adminLogueado = {
    id_usuario: "ADM001",
    nombres: "Mario González",
    rol: "Administrador"
};

// 🔹 Inicializar asesorías desde la BD
async function inicializarAsesorias() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Mapear para agregar instructor y estado si faltan
        asesorias = data.map(a => ({
            id: a.id_crear_asesoria,
            titulo: a.titulo,
            descripcion: a.descripcion,
            fecha: a.fecha,
            horario: a.horario,
            cuposTotal: a.cupo,
            cuposOcupados: a.cuposOcupados || 0,
            estado: a.estado || "Programado",
            instructor: a.instructor || adminLogueado.nombres
        }));

        renderizarAsesorias();
        mostrarAdminLogueado();
    } catch (error) {
        console.error("Error al obtener asesorías:", error);
    }
}

// 🔹 Guardar (crear o editar)
async function guardarAsesoria(event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const fecha = document.getElementById("fecha").value;
    const horario = document.getElementById("horario").value;
    const cupos = document.getElementById("cupos").value;

    const data = {
        id_crear_asesoria: editandoAsesoriaId || generarID(),
        usuarios_id_usuario: adminLogueado.id_usuario,
        titulo,
        descripcion,
        instructor: adminLogueado.nombres,
        fecha,
        horario,
        cupo: cupos,
        estado: "Programado"
    };

    try {
        if (editandoAsesoriaId) {
            await fetch(`${API_URL}/${editandoAsesoriaId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        } else {
            await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }

        cerrarModal();
        inicializarAsesorias();
    } catch (error) {
        console.error("Error al guardar asesoría:", error);
    }
}

// 🔹 Cancelar asesoría
async function cancelarAsesoria(id) {
    if (confirm("¿Seguro que deseas cancelar esta asesoría?")) {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        inicializarAsesorias();
    }
}

// 🔹 Generar ID
function generarID() {
    return "AS" + Math.floor(Math.random() * 10000);
}

// 🔹 Renderizar asesorías
function renderizarAsesorias() {
    const listContainer = document.getElementById('asesoriasList');
    const emptyState = document.getElementById('emptyState');

    if (asesorias.length === 0) {
        listContainer.classList.remove('active');
        emptyState.classList.add('active');
        return;
    }

    emptyState.classList.remove('active');
    listContainer.classList.add('active');

    listContainer.innerHTML = asesorias.map(asesoria => {
        const porcentajeOcupado = (asesoria.cuposOcupados / asesoria.cuposTotal) * 100;
        const fechaFormateada = new Date(asesoria.fecha).toLocaleDateString('es-MX');

        return `
            <div class="asesoria-card">
                <span class="status-badge">${asesoria.estado}</span>

                <div class="asesoria-header">
                    <div class="asesoria-title-section">
                        <div class="asesoria-title">
                            <h3>${asesoria.titulo}</h3>
                        </div>
                        <p class="asesoria-instructor">Impartido por: ${asesoria.instructor}</p>
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
                    <button class="btn-editar" onclick="editarAsesoria('${asesoria.id}')">Editar</button>
                    <button class="btn-cancelar" onclick="cancelarAsesoria('${asesoria.id}')">Cancelar</button>
                </div>
            </div>
        `;
    }).join('');
}

// 🔹 Editar asesoría
function editarAsesoria(id) {
    const asesoria = asesorias.find(a => a.id === id);
    if (!asesoria) return;

    editandoAsesoriaId = id;

    document.getElementById('modalTitle').textContent = 'Editar Asesoría';
    document.getElementById('modalSubtitle').textContent = `Modifica la información de la asesoría a ${asesoria.titulo}`;
    document.getElementById('submitBtn').textContent = 'Guardar Cambios';
    document.getElementById('cuposLabel').textContent = 'Cupos Totales';
    document.getElementById('instructorGroup').style.display = 'block';

    document.getElementById('titulo').value = asesoria.titulo;
    document.getElementById('descripcion').value = asesoria.descripcion;
    document.getElementById('instructor').value = asesoria.instructor;
    document.getElementById('fecha').value = asesoria.fecha.split("T")[0]; // Formato YYYY-MM-DD
    document.getElementById('horario').value = asesoria.horario;
    document.getElementById('cupos').value = asesoria.cuposTotal;

    abrirModal();
}

// 🔹 Abrir/Cerrar modal
function abrirModal() {
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('asesoriaForm').reset();

    editandoAsesoriaId = null;
    document.getElementById('modalTitle').textContent = 'Crear Nueva Asesoría';
    document.getElementById('modalSubtitle').textContent = 'Programa una nueva asesoría para los estudiantes';
    document.getElementById('submitBtn').textContent = 'Crear Asesoría';
    document.getElementById('cuposLabel').textContent = 'Cupos Disponibles';
    document.getElementById('instructorGroup').style.display = 'none';
}

function cerrarModalSiClickFuera(event) {
    if (event.target === event.currentTarget) {
        cerrarModal();
    }
}

// 🔹 Mostrar admin logueado en la parte superior
function mostrarAdminLogueado() {
    const adminName = document.querySelector('.admin-details h3');
    const adminId = document.querySelector('.admin-details p');

    if (adminName) adminName.textContent = adminLogueado.nombres;
    if (adminId) adminId.textContent = `${adminLogueado.id_usuario} - ${adminLogueado.rol}`;
}

// 🔹 Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    sessionStorage.clear();
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => input.value = '');
    document.body.innerHTML = '';
    window.location.href = 'index.html';
}



document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') cerrarModal();
});

window.addEventListener('DOMContentLoaded', inicializarAsesorias);
