const API_URL = "http://localhost:3000/asesorias";

// Usuario logueado (admin)
const usuarioLogueado = {
  id: "ADM001",
  nombre: "Nombre del Administrador"
};

// Almacenamiento de asesorías
let asesorias = [];
let editandoAsesoriaId = null;

// 🔹 Inicializar asesorías desde BD
async function inicializarAsesorias() {
  try {
    const res = await fetch(API_URL);
    asesorias = await res.json();

    // Para mostrar instructor si no viene del backend
    asesorias = asesorias.map(a => ({
      ...a,
      instructor: a.instructor || usuarioLogueado.nombre,
      cuposTotal: a.cupo || 15,
      cuposOcupados: a.cuposOcupados || 0,
      estado: a.estado || "Programado"
    }));

    renderizarAsesorias();
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
  const cupos = parseInt(document.getElementById("cupos").value);

  // Asignar instructor automáticamente si se está creando
  const instructor = editandoAsesoriaId
      ? document.getElementById("instructor").value || "Pendiente"
      : usuarioLogueado.nombre;

  const data = {
    id_crear_asesoria: editandoAsesoriaId || generarID(),
    usuarios_id_usuario: usuarioLogueado.id,
    titulo,
    instructor,
    descripcion,
    fecha,
    horario,
    cupo: cupos,
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

// 🔹 Generar ID aleatorio
function generarID() {
  return "AS" + Math.floor(Math.random() * 10000);
}

// 🔹 Renderizar lista de asesorías
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
        // Formatear fecha: YYYY-MM-DD
        const fechaFormateada = new Date(asesoria.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        // Determinar instructor: si existe, usarlo, si no, usar admin logueado
        const instructor = asesoria.instructor || "Administrador";

        // Calcular porcentaje de cupos ocupados
        const porcentajeOcupado = (asesoria.cuposOcupados / asesoria.cuposTotal) * 100;

        return `
            <div class="asesoria-card">
                <span class="status-badge">${asesoria.estado || "Programado"}</span>
                
                <div class="asesoria-header">
                    <div class="asesoria-title-section">
                        <div class="asesoria-title">
                            <svg class="asesoria-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                            <h3>${asesoria.titulo}</h3>
                        </div>
                        <p class="asesoria-instructor">Impartido por: ${instructor}</p>
                        <p class="asesoria-description">${asesoria.descripcion}</p>
                    </div>
                </div>

                <div class="asesoria-info">
                    <div class="info-item">
                        <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <div class="info-content">
                            <span class="info-label">Fecha</span>
                            <span class="info-value">${fechaFormateada}</span>
                        </div>
                    </div>

                    <div class="info-item">
                        <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div class="info-content">
                            <span class="info-label">Horario</span>
                            <span class="info-value">${asesoria.horario}</span>
                        </div>
                    </div>

                    <div class="info-item">
                        <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <div class="info-content">
                            <span class="info-label">Cupos</span>
                            <span class="info-value">${asesoria.cuposOcupados}/${asesoria.cuposTotal}</span>
                        </div>
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
                    <button class="btn-editar" onclick="editarAsesoria('${asesoria.id_crear_asesoria}')">Editar</button>
                    <button class="btn-cancelar" onclick="cancelarAsesoria('${asesoria.id_crear_asesoria}')">Cancelar</button>
                </div>
            </div>
        `;
    }).join('');
}


// 🔹 Editar asesoría
function editarAsesoria(id) {
  const asesoria = asesorias.find(a => a.id_crear_asesoria === id);
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
  document.getElementById('fecha').value = asesoria.fecha;
  document.getElementById('horario').value = asesoria.horario;
  document.getElementById('cupos').value = asesoria.cuposTotal;

  abrirModal();
}

// 🔹 Abrir modal
function abrirModal() {
  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// 🔹 Cerrar modal
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

// 🔹 Cerrar modal al click fuera
function cerrarModalSiClickFuera(event) {
  if (event.target === event.currentTarget) cerrarModal();
}

// 🔹 Cerrar sesión
function cerrarSesion() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    alert('Cerrando sesión...');
  }
}

// 🔹 Esc para cerrar modal
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') cerrarModal();
});

// 🔹 Inicializar al cargar
window.addEventListener('DOMContentLoaded', inicializarAsesorias);
