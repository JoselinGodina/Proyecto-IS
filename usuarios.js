document.addEventListener("DOMContentLoaded", () => {
    // === Verificar sesión y rol ===
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) {
        // No hay sesión → redirigir al login
        window.location.replace("index.html");
        return;
    }

    if (usuario.roles_id_rol !== '1') {
        // No es admin → redirigir a alumno
        window.location.replace("alumno.html");
        return;
    }

    // Mostrar nombre y datos del admin en la cabecera
    const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;
    document.querySelector(".admin-details h3").textContent = nombreCompleto;
    document.querySelector(".admin-details p").textContent = `${usuario.id_usuario} - Administrador del Sistema`;
});

// === Función para cerrar sesión ===
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('usuario');
        localStorage.removeItem('rol');
        localStorage.removeItem('token');
        // Reemplaza la página actual para evitar regresar atrás
        window.location.replace("index.html");
    }
}

// === Datos de usuarios de ejemplo ===
let users = [
    { id: 1, nombre: 'Nombre del alumno', tipo: 'estudiante', email: 'correo@instituto.edu.mx', numero: '20240001', estado: 'activo' },
    { id: 2, nombre: 'Nombre del Docente', tipo: 'docente', email: 'correo@instituto.edu.mx', numero: 'DOC-001', estado: 'activo' },
    { id: 3, nombre: 'Nombre del alumno', tipo: 'estudiante', email: 'correo@instituto.edu.mx', numero: '20240002', estado: 'inactivo' }
];

let currentUserId = null;
let filteredUsers = [...users];

// === Renderizar tabla de usuarios ===
function renderUsers() {
    const tbody = document.getElementById('usersTableBody');

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #666;">
                    No se encontraron usuarios que coincidan con la búsqueda
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.nombre}</td>
            <td><span class="user-badge badge-${user.tipo}">${user.tipo}</span></td>
            <td>${user.email}</td>
            <td>${user.numero}</td>
            <td><span class="status-badge status-${user.estado}">${user.estado}</span></td>
            <td>
                <div class="actions-cell">
                    <button class="action-btn btn-modificar" onclick="abrirModalEditar(${user.id})">Modificar</button>
                    <button class="action-btn btn-asignar" onclick="abrirModalRol(${user.id})">Asignar Rol</button>
                    ${user.estado === 'activo' ? 
                        `<button class="action-btn btn-desactivar" onclick="toggleEstado(${user.id})">Desactivar</button>` :
                        `<button class="action-btn btn-activar" onclick="toggleEstado(${user.id})">Activar</button>`
                    }
                </div>
            </td>
        </tr>
    `).join('');
}

// === Modales ===
function abrirModalEditar(userId) {
    currentUserId = userId;
    const user = users.find(u => u.id === userId);

    document.getElementById('editModalSubtitle').textContent = `Edita la información del usuario ${user.nombre}`;
    document.getElementById('editNombre').value = user.nombre;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editNumero').value = user.numero;

    document.getElementById('editModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function abrirModalRol(userId) {
    currentUserId = userId;
    const user = users.find(u => u.id === userId);

    document.getElementById('roleModalSubtitle').textContent = `Cambia el rol del usuario ${user.nombre}`;
    document.getElementById('selectRol').value = user.tipo;
    document.getElementById('rolActual').textContent = user.tipo;
    document.getElementById('rolNuevo').textContent = user.tipo;

    document.getElementById('roleModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarModal(type) {
    const modalId = type === 'edit' ? 'editModalOverlay' : 'roleModalOverlay';
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
    currentUserId = null;
}

function cerrarModalSiClickFuera(event, type) {
    if (event.target === event.currentTarget) cerrarModal(type);
}

// === Guardar cambios de usuario ===
function guardarCambiosUsuario(event) {
    event.preventDefault();
    const user = users.find(u => u.id === currentUserId);
    user.nombre = document.getElementById('editNombre').value;
    user.email = document.getElementById('editEmail').value;
    user.numero = document.getElementById('editNumero').value;

    buscarUsuarios();
    cerrarModal('edit');
    alert('Datos del usuario actualizados exitosamente');
}

// === Asignar rol ===
function actualizarRolInfo() {
    document.getElementById('rolNuevo').textContent = document.getElementById('selectRol').value;
}

function asignarRol(event) {
    event.preventDefault();
    const user = users.find(u => u.id === currentUserId);
    const nuevoRol = document.getElementById('selectRol').value;
    user.tipo = nuevoRol;

    buscarUsuarios();
    cerrarModal('role');
    alert(`Rol "${nuevoRol}" asignado exitosamente a ${user.nombre}`);
}

// === Activar / desactivar usuario ===
function toggleEstado(userId) {
    const user = users.find(u => u.id === userId);
    const nuevoEstado = user.estado === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'activo' ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro de que deseas ${accion} a ${user.nombre}?`)) {
        user.estado = nuevoEstado;
        buscarUsuarios();
        alert(`Usuario ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
    }
}

// === Buscar usuarios ===
function buscarUsuarios() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    filteredUsers = searchTerm === '' ? [...users] : users.filter(u => u.nombre.toLowerCase().includes(searchTerm));
    renderUsers();
}

// === Cerrar modales con Escape ===
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        cerrarModal('edit');
        cerrarModal('role');
    }
});
function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    sessionStorage.clear();
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => input.value = '');
    document.body.innerHTML = '';
    window.location.href = 'index.html';
}


// === Render inicial de usuarios ===
renderUsers();
