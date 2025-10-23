
        let materiales = [
            {
                id: 1,
                nombre: 'Resistencias 1/4W',
                categoria: 'Componentes Pasivos',
                disponibles: 150,
                total: 200,
                danados: 50
            },
            {
                id: 2,
                nombre: 'Capacitores Electrolíticos',
                categoria: 'Componentes Pasivos',
                disponibles: 45,
                total: 60,
                danados: 15
            },
            {
                id: 3,
                nombre: 'Transistores 2N2222',
                categoria: 'Semiconductores',
                disponibles: 25,
                total: 30,
                danados: 5
            }
        ];

        let materialEditando = null;
        let cantidadDisponibles = 0;
        let cantidadDanados = 0;

        function renderizarMateriales() {
            const lista = document.getElementById('materialsList');
            lista.innerHTML = materiales.map(material => `
                <div class="material-card">
                    <div class="material-info">
                        <div class="material-icon">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                        <div class="material-details">
                            <h3>${material.nombre}</h3>
                            <p>${material.categoria}</p>
                        </div>
                    </div>
                    <div class="material-stats">
                        <div class="stat-item">
                            <div class="stat-value disponibles">${material.disponibles} Disponibles</div>
                            <div class="stat-label">de ${material.total} total</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value danados">${material.danados} Dañados</div>
                        </div>
                    </div>
                    <button class="edit-btn" onclick="abrirModalEditar(${material.id})">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Editar
                    </button>
                </div>
            `).join('');
        }

        function abrirModalEditar(id) {
            materialEditando = materiales.find(m => m.id === id);
            if (!materialEditando) return;

            document.getElementById('nombreMaterial').value = materialEditando.nombre;
            document.getElementById('categoria').value = materialEditando.categoria;
            
            cantidadDisponibles = materialEditando.disponibles;
            cantidadDanados = materialEditando.danados;
            
            actualizarDisplayCantidades();
            
            document.getElementById('modalOverlay').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function cerrarModal() {
            document.getElementById('modalOverlay').classList.remove('active');
            document.body.style.overflow = 'auto';
            materialEditando = null;
        }

        function cerrarModalSiClickFuera(event) {
            if (event.target === event.currentTarget) {
                cerrarModal();
            }
        }

        function cambiarCantidad(tipo, cambio) {
            if (tipo === 'disponibles') {
                cantidadDisponibles = Math.max(0, cantidadDisponibles + cambio);
            } else if (tipo === 'danados') {
                cantidadDanados = Math.max(0, cantidadDanados + cambio);
            }
            actualizarDisplayCantidades();
        }

        function actualizarDisplayCantidades() {
            document.getElementById('disponiblesDisplay').textContent = cantidadDisponibles;
            document.getElementById('danadosDisplay').textContent = cantidadDanados;
        }

        function guardarCambios() {
            if (!materialEditando) return;

            materialEditando.disponibles = cantidadDisponibles;
            materialEditando.danados = cantidadDanados;
            materialEditando.total = cantidadDisponibles + cantidadDanados;

            console.log('[v0] Material actualizado:', materialEditando);

            renderizarMateriales();
            cerrarModal();

            alert('Cambios guardados exitosamente');
        }

        function cerrarSesion() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                alert('Cerrando sesión...');
            }
        }

        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                cerrarModal();
            }
        });

        // Renderizar materiales al cargar la página
        renderizarMateriales();
    