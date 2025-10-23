
        let materiales = [
            {
                id: 1,
                nombre: 'Resistencias 1/4W',
                categoria: 'Componentes Pasivos',
                disponibles: 150,
                total: 200
            },
            {
                id: 2,
                nombre: 'Capacitores Electrolíticos',
                categoria: 'Componentes Pasivos',
                disponibles: 45,
                total: 60
            },
            {
                id: 3,
                nombre: 'Transistores 2N2222',
                categoria: 'Semiconductores',
                disponibles: 25,
                total: 30
            }
        ];

        window.addEventListener('DOMContentLoaded', function() {
            cargarDatosLocalStorage();
            renderizarMateriales();
        });

        function cargarDatosLocalStorage() {
            materiales.forEach(material => {
                const stored = localStorage.getItem(`material_${material.id}_disponibles`);
                if (stored !== null) {
                    material.disponibles = parseInt(stored);
                }
            });
        }

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
                            <div class="stat-label">Cantidad</div>
                            <div class="stat-value" id="disponibles_${material.id}">${material.disponibles}</div>
                        </div>
                    </div>
                    <div class="quantity-controls">
                        <input type="number" class="quantity-input" id="input_${material.id}" value="0" min="1" placeholder="1">
                        <button class="add-btn" onclick="agregarCantidad(${material.id})">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Agregar
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function agregarCantidad(id) {
            const material = materiales.find(m => m.id === id);
            if (!material) return;

            const inputElement = document.getElementById(`input_${id}`);
            const cantidadAgregar = parseInt(inputElement.value) || 0;

            if (cantidadAgregar < 1) {
                alert('Por favor ingresa una cantidad válida mayor a 0');
                return;
            }

            const nuevaCantidad = material.disponibles + cantidadAgregar;

            if (nuevaCantidad > material.total) {
                alert(`La cantidad no puede exceder el total de ${material.total} unidades`);
                return;
            }

            // Update material quantity
            material.disponibles = nuevaCantidad;

            // Save to localStorage
            localStorage.setItem(`material_${id}_disponibles`, nuevaCantidad);

            // Update display
            document.getElementById(`disponibles_${id}`).textContent = nuevaCantidad;

            // Reset input
            inputElement.value = 1;

            // Show success message
            mostrarMensajeExito();

            console.log('[v0] Material actualizado:', material);
        }

        function mostrarMensajeExito() {
            const mensaje = document.getElementById('successMessage');
            mensaje.classList.add('show');
            setTimeout(() => {
                mensaje.classList.remove('show');
            }, 3000);
        }

        function cerrarSesion() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                alert('Cerrando sesión...');
            }
        }