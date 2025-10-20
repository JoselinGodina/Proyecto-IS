let users = [
            {
                id: 1,
                nombre: 'Nombre del alumno',
                tipo: 'estudiante',
                email: 'correo@instituto.edu.mx',
                numero: '20240001',
                estado: 'activo'
            },
            {
                id: 2,
                nombre: 'Nombre del Docente',
                tipo: 'docente',
                email: 'correo@instituto.edu.mx',
                numero: 'DOC-001',
                estado: 'activo'
            },
            {
                id: 3,
                nombre: 'Nombre del alumno',
                tipo: 'estudiante',
                email: 'correo@instituto.edu.mx',
                numero: '20240002',
                estado: 'inactivo'
            }
        ];

        let currentUserId = null;
        let filteredUsers = [...users];

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
                            <button class="action-btn btn-modificar" onclick="abrirModalEditar(${user.id})">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Modificar
                            </button>
                            <button class="action-btn btn-asignar" onclick="abrirModalRol(${user.id})">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                Asignar Rol
                            </button>
                            ${user.estado === 'activo' ? 
                                `<button class="action-btn btn-desactivar" onclick="toggleEstado(${user.id})">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Desactivar
                                </button>` :
                                `<button class="action-btn btn-activar" onclick="toggleEstado(${user.id})">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Activar
                                </button>`
                            }
                        </div>
                    </td>
                </tr>
            `).join('');
        }

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
            if (event.target === event.currentTarget) {
                cerrarModal(type);
            }
        }

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

        function actualizarRolInfo() {
            const nuevoRol = document.getElementById('selectRol').value;
            document.getElementById('rolNuevo').textContent = nuevoRol;
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

        function cerrarSesion() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                alert('Cerrando sesión...');
            }
        }

        function buscarUsuarios() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
            
            if (searchTerm === '') {
                filteredUsers = [...users];
            } else {
                filteredUsers = users.filter(user => 
                    user.nombre.toLowerCase().includes(searchTerm)
                );
            }
            
            renderUsers();
        }

        // Cerrar modales con tecla Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                cerrarModal('edit');
                cerrarModal('role');
            }
        });

        // Render initial users
        renderUsers();