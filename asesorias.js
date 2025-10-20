  
        // Asesorías data storage
        let asesorias = [];
        let editandoAsesoriaId = null;

        // Initialize with sample data
        function inicializarAsesorias() {
            asesorias = [
                {
                    id: 1,
                    titulo: 'Introducción a Arduino y Sensores',
                    instructor: 'Ing. Mario González',
                    descripcion: 'Aprende los fundamentos de Arduino, conexión de sensores básicos y programación de microcontroladores.',
                    fecha: '2024-01-25',
                    horario: '14:00-16:00',
                    cuposTotal: 15,
                    cuposOcupados: 3,
                    estado: 'Programado'
                }
            ];
            renderizarAsesorias();
        }

        // Render asesorías list
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
                
                return `
                    <div class="asesoria-card">
                        <span class="status-badge">${asesoria.estado}</span>
                        
                        <div class="asesoria-header">
                            <div class="asesoria-title-section">
                                <div class="asesoria-title">
                                    <svg class="asesoria-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                    </svg>
                                    <h3>${asesoria.titulo}</h3>
                                </div>
                                <p class="asesoria-instructor">Impartido por: ${asesoria.instructor}</p>
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
                                    <span class="info-value">${asesoria.fecha}</span>
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
                            <button class="btn-editar" onclick="editarAsesoria(${asesoria.id})">Editar</button>
                            <button class="btn-cancelar" onclick="cancelarAsesoria(${asesoria.id})">Cancelar</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function editarAsesoria(id) {
            const asesoria = asesorias.find(a => a.id === id);
            if (!asesoria) return;

            editandoAsesoriaId = id;

            // Update modal title and subtitle
            document.getElementById('modalTitle').textContent = 'Editar Asesoría';
            document.getElementById('modalSubtitle').textContent = `Modifica la información de la asesoría a ${asesoria.titulo.split(' ')[asesoria.titulo.split(' ').length - 1]}`;
            
            // Update button text
            document.getElementById('submitBtn').textContent = 'Guardar Cambios';
            
            // Update cupos label
            document.getElementById('cuposLabel').textContent = 'Cupos Totales';
            
            // Show instructor field
            document.getElementById('instructorGroup').style.display = 'block';

            // Fill form with current data
            document.getElementById('titulo').value = asesoria.titulo;
            document.getElementById('descripcion').value = asesoria.descripcion;
            document.getElementById('instructor').value = asesoria.instructor;
            document.getElementById('fecha').value = asesoria.fecha;
            document.getElementById('horario').value = asesoria.horario;
            document.getElementById('cupos').value = asesoria.cuposTotal;

            // Open modal
            abrirModal();
        }

        // Cancel asesoría
        function cancelarAsesoria(id) {
            if (confirm('¿Estás seguro de que deseas cancelar esta asesoría?')) {
                asesorias = asesorias.filter(a => a.id !== id);
                renderizarAsesorias();
            }
        }

        function navigateTo(section) {
            alert('Navegando a: ' + section + '\n(Esta sección está en desarrollo)');
        }

        function abrirModal() {
            document.getElementById('modalOverlay').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function cerrarModal() {
            document.getElementById('modalOverlay').classList.remove('active');
            document.body.style.overflow = 'auto';
            document.getElementById('asesoriaForm').reset();
            
            // Reset to create mode
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

        function guardarAsesoria(event) {
            event.preventDefault();
            
            if (editandoAsesoriaId) {
                // Edit existing asesoría
                const index = asesorias.findIndex(a => a.id === editandoAsesoriaId);
                if (index !== -1) {
                    asesorias[index] = {
                        ...asesorias[index],
                        titulo: document.getElementById('titulo').value,
                        descripcion: document.getElementById('descripcion').value,
                        instructor: document.getElementById('instructor').value,
                        fecha: document.getElementById('fecha').value,
                        horario: document.getElementById('horario').value,
                        cuposTotal: parseInt(document.getElementById('cupos').value)
                    };
                }
            } else {
                // Create new asesoría
                const nuevaAsesoria = {
                    id: asesorias.length > 0 ? Math.max(...asesorias.map(a => a.id)) + 1 : 1,
                    titulo: document.getElementById('titulo').value,
                    instructor: 'Administrador del Sistema',
                    descripcion: document.getElementById('descripcion').value,
                    fecha: document.getElementById('fecha').value,
                    horario: document.getElementById('horario').value,
                    cuposTotal: parseInt(document.getElementById('cupos').value),
                    cuposOcupados: 0,
                    estado: 'Programado'
                };
                asesorias.push(nuevaAsesoria);
            }

            renderizarAsesorias();
            cerrarModal();
        }

        function cerrarSesion() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                alert('Cerrando sesión...');
            }
        }

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                cerrarModal();
            }
        });

        window.addEventListener('DOMContentLoaded', inicializarAsesorias);
    