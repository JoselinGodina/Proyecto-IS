
        let solicitudes = [
            {
                id: 1,
                nombreAlumno: 'Nombre del alumno',
                noControl: '20240001',
                materialSolicitado: 'Resistencias 1/4W',
                cantidad: '10 unidades',
                fechaSolicitud: '2024-01-15',
                hora: '10:00 AM',
                motivo: 'Práctica de circuitos básicos',
                fechaDevolucion: '2024-01-15',
                estado: 'pendiente'
            }
        ];

        function renderSolicitudes() {
            const container = document.getElementById('solicitudesContainer');
            const pendingCount = document.getElementById('pendingCount');
            
            const pendingSolicitudes = solicitudes.filter(s => s.estado === 'pendiente');
            
            if (pendingSolicitudes.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <h3>No hay solicitudes pendientes</h3>
                        <p>Todas las solicitudes han sido procesadas</p>
                    </div>
                `;
                pendingCount.textContent = '0 solicitudes esperando aprobación';
                return;
            }

            pendingCount.textContent = `${pendingSolicitudes.length} solicitudes esperando aprobación`;

            container.innerHTML = pendingSolicitudes.map(solicitud => `
                <div class="solicitud-card">
                    <div class="solicitud-header">
                        <div class="solicitud-title">
                            <h4>${solicitud.nombreAlumno}</h4>
                            <span class="badge badge-pendiente">Pendiente</span>
                        </div>
                        <div class="solicitud-actions">
                            <button class="btn-aprobar" onclick="aprobarSolicitud(${solicitud.id})">Aprobar</button>
                            <button class="btn-rechazar" onclick="rechazarSolicitud(${solicitud.id})">Rechazar</button>
                        </div>
                    </div>
                    <div class="solicitud-details">
                        <div class="detail-item">
                            <span class="detail-label">No. Control:</span>
                            <span class="detail-value">${solicitud.noControl}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cantidad:</span>
                            <span class="detail-value">${solicitud.cantidad}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Material solicitado:</span>
                            <span class="detail-value">${solicitud.materialSolicitado}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Hora:</span>
                            <span class="detail-value">${solicitud.hora}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fecha de solicitud:</span>
                            <span class="detail-value">${solicitud.fechaSolicitud}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fecha de devolución:</span>
                            <span class="detail-value">${solicitud.fechaDevolucion}</span>
                        </div>
                        <div class="detail-item" style="grid-column: 1 / -1;">
                            <span class="detail-label">Motivo:</span>
                            <span class="detail-value">${solicitud.motivo}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function aprobarSolicitud(id) {
            if (confirm('¿Estás seguro de que deseas aprobar esta solicitud?')) {
                const solicitud = solicitudes.find(s => s.id === id);
                solicitud.estado = 'aprobada';
                console.log('[v0] Solicitud aprobada:', solicitud);
                alert('Solicitud aprobada exitosamente');
                renderSolicitudes();
            }
        }

        function rechazarSolicitud(id) {
            if (confirm('¿Estás seguro de que deseas rechazar esta solicitud?')) {
                const solicitud = solicitudes.find(s => s.id === id);
                solicitud.estado = 'rechazada';
                console.log('[v0] Solicitud rechazada:', solicitud);
                alert('Solicitud rechazada');
                renderSolicitudes();
            }
        }

        function cerrarSesion() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                alert('Cerrando sesión...');
            }
        }

        // Initialize
        renderSolicitudes();