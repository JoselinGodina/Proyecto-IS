
        // Modal functionality
        const modalOverlay = document.getElementById('modalOverlay');
        const openModalBtn = document.getElementById('openModalBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const submitBtn = document.getElementById('submitBtn');
        const materialForm = document.getElementById('materialForm');
        const quantityInput = document.getElementById('quantity');
        const materialsContainer = document.getElementById('materialsContainer');

        // Custom select functionality
        const selectTrigger = document.getElementById('selectTrigger');
        const selectOptions = document.getElementById('selectOptions');
        const selectDisplay = document.getElementById('selectDisplay');
        const categoryInput = document.getElementById('category');
        const options = document.querySelectorAll('.select-option');

        // <CHANGE> Function to create a new material card dynamically
        function createMaterialCard(materialName, categoryName, available, defective) {
            const card = document.createElement('div');
            card.className = 'material-card';
            
            card.innerHTML = `
                <div class="material-info">
                    <div class="material-icon">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                    </div>
                    <div class="material-details">
                        <h3>${materialName}</h3>
                        <p>${categoryName}</p>
                    </div>
                </div>
                <div class="material-stats">
                    <div class="stat">
                        <div class="stat-value available">${available}</div>
                        <div class="stat-label">Disponibles</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value defective">${defective}</div>
                        <div class="stat-label">Defallidos</div>
                    </div>
                </div>
            `;
            
            return card;
        }

        // Open modal
        openModalBtn.addEventListener('click', () => {
            modalOverlay.classList.add('active');
            // Ensure quantity is always 0 when opening modal
            quantityInput.value = '0';
        });

        // Close modal
        cancelBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
            materialForm.reset();
            selectDisplay.textContent = 'Selecciona una categoría';
            selectDisplay.className = 'select-placeholder';
            categoryInput.value = '';
            options.forEach(opt => opt.classList.remove('selected'));
            // Reset quantity to 0
            quantityInput.value = '0';
        });

        // Close modal when clicking outside
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
                materialForm.reset();
                selectDisplay.textContent = 'Selecciona una categoría';
                selectDisplay.className = 'select-placeholder';
                categoryInput.value = '';
                options.forEach(opt => opt.classList.remove('selected'));
                // Reset quantity to 0
                quantityInput.value = '0';
            }
        });

        // Toggle dropdown
        selectTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            selectTrigger.classList.toggle('active');
            selectOptions.classList.toggle('active');
        });

        // Select option
        options.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.getAttribute('data-value');
                const text = option.textContent;

                // Update display
                selectDisplay.textContent = text;
                selectDisplay.className = 'select-value';
                categoryInput.value = value;

                // Update selected state
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                // Close dropdown
                selectTrigger.classList.remove('active');
                selectOptions.classList.remove('active');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            selectTrigger.classList.remove('active');
            selectOptions.classList.remove('active');
        });

        // <CHANGE> Form submission - now creates a new material card
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();

            if (materialForm.checkValidity()) {
                const materialName = document.getElementById('description').value;
                const categoryValue = categoryInput.value;
                const categoryName = selectDisplay.textContent;
                
                // Create new material card with 0 available and 0 defective
                const newCard = createMaterialCard(materialName, categoryName, 0, 0);
                
                // Add the new card to the container
                materialsContainer.appendChild(newCard);
                
                console.log('[v0] Material agregado:', {
                    code: document.getElementById('materialCode').value,
                    description: materialName,
                    category: categoryValue,
                    quantity: '0',
                    available: 0,
                    defective: 0
                });
                
                alert('Material agregado exitosamente');

                // Close modal and reset form
                modalOverlay.classList.remove('active');
                materialForm.reset();
                selectDisplay.textContent = 'Selecciona una categoría';
                selectDisplay.className = 'select-placeholder';
                categoryInput.value = '';
                options.forEach(opt => opt.classList.remove('selected'));
                // Reset quantity to 0
                quantityInput.value = '0';
            } else {
                alert('Por favor completa todos los campos requeridos');
            }
        });

        // Logout functionality
        const logoutBtn = document.querySelector('.logout-btn');
        logoutBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                alert('Cerrando sesión...');
            }
        });