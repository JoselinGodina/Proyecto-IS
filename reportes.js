
        function cerrarSesion() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                alert('Cerrando sesión...');
            }
        }

        function generarReporte(tipo, categoria) {
            console.log('[v0] Generando reporte:', tipo, categoria);
            
            if (tipo === 'pdf') {
                // Generate and show print preview
                mostrarVistaPrevia(categoria);
            } else if (tipo === 'excel') {
                generarExcel(categoria);
            }
        }

        function generarExcel(categoria) {
            // Get current date and time for filename
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            
            // Get materials data based on category
            let filename, materials, quantityHeader;

            switch(categoria) {
                case 'disponible':
                    filename = `Reporte_Material_Disponible_${dateStr}.csv`;
                    quantityHeader = 'Cantidad Disponible';
                    materials = [
                        { nombre: 'Resistencias 1/4W', categoria: 'Componentes Pasivos', cantidad: 150 },
                        { nombre: 'Capacitores Electrolíticos', categoria: 'Componentes Pasivos', cantidad: 45 },
                        { nombre: 'Transistores 2N2222', categoria: 'Semiconductores', cantidad: 25 },
                        { nombre: 'LEDs 5mm', categoria: 'Componentes Activos', cantidad: 200 },
                        { nombre: 'Protoboards', categoria: 'Herramientas', cantidad: 15 }
                    ];
                    break;
                case 'danado':
                    filename = `Reporte_Material_Danado_${dateStr}.csv`;
                    quantityHeader = 'Cantidad Dañada';
                    materials = [
                        { nombre: 'Resistencias 1/4W', categoria: 'Componentes Pasivos', cantidad: 50 },
                        { nombre: 'Capacitores Electrolíticos', categoria: 'Componentes Pasivos', cantidad: 15 },
                        { nombre: 'Transistores 2N2222', categoria: 'Semiconductores', cantidad: 5 },
                        { nombre: 'Multímetros', categoria: 'Instrumentos', cantidad: 3 }
                    ];
                    break;
                case 'inventario':
                    filename = `Reporte_Inventario_Completo_${dateStr}.csv`;
                    quantityHeader = 'Cantidad Total';
                    materials = [
                        { nombre: 'Resistencias 1/4W', categoria: 'Componentes Pasivos', cantidad: 200 },
                        { nombre: 'Capacitores Electrolíticos', categoria: 'Componentes Pasivos', cantidad: 60 },
                        { nombre: 'Transistores 2N2222', categoria: 'Semiconductores', cantidad: 30 },
                        { nombre: 'LEDs 5mm', categoria: 'Componentes Activos', cantidad: 250 },
                        { nombre: 'Protoboards', categoria: 'Herramientas', cantidad: 20 },
                        { nombre: 'Multímetros', categoria: 'Instrumentos', cantidad: 10 }
                    ];
                    break;
                case 'visitas':
                    filename = `Reporte_Carreras_Mayor_Visita_${dateStr}.csv`;
                    quantityHeader = 'Visitas';
                    materials = [
                        { nombre: 'Ingeniería Electrónica', categoria: 'Carrera', cantidad: 35 },
                        { nombre: 'Ingeniería Mecatrónica', categoria: 'Carrera', cantidad: 28 },
                        { nombre: 'Ingeniería Industrial', categoria: 'Carrera', cantidad: 15 },
                        { nombre: 'Ingeniería en Sistemas', categoria: 'Carrera', cantidad: 7 }
                    ];
                    break;
                default:
                    materials = [];
            }

            // Create CSV content
            let csvContent = '\uFEFF'; // UTF-8 BOM for proper Excel encoding
            
            // Add header row
            csvContent += `Material,Categoría,${quantityHeader}\n`;
            
            // Add data rows
            materials.forEach(material => {
                csvContent += `"${material.nombre}","${material.categoria}",${material.cantidad}\n`;
            });

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (navigator.msSaveBlob) { // IE 10+
                navigator.msSaveBlob(blob, filename);
            } else {
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            console.log('[v0] Excel file generated:', filename);
        }

        function mostrarVistaPrevia(categoria) {
            // Get current date and time
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-MX', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            const timeStr = now.toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });

            // Generate report number
            const reportNumber = 'REP-' + Math.floor(Math.random() * 100000).toString().padStart(6, '0');

            // Set report title and info based on category
            let title, sectionTitle, materials, quantityHeader, note;

            switch(categoria) {
                case 'disponible':
                    title = 'Reporte de Material Disponible';
                    sectionTitle = 'Materiales Disponibles';
                    quantityHeader = 'Cantidad Disponible';
                    note = 'Este reporte muestra todos los materiales disponibles para préstamo en el laboratorio.';
                    materials = [
                        { nombre: 'Resistencias 1/4W', categoria: 'Componentes Pasivos', cantidad: 150 },
                        { nombre: 'Capacitores Electrolíticos', categoria: 'Componentes Pasivos', cantidad: 45 },
                        { nombre: 'Transistores 2N2222', categoria: 'Semiconductores', cantidad: 25 },
                        { nombre: 'LEDs 5mm', categoria: 'Componentes Activos', cantidad: 200 },
                        { nombre: 'Protoboards', categoria: 'Herramientas', cantidad: 15 }
                    ];
                    break;
                case 'danado':
                    title = 'Reporte de Material Dañado';
                    sectionTitle = 'Materiales Dañados';
                    quantityHeader = 'Cantidad Dañada';
                    note = 'Este reporte muestra todos los materiales que requieren reparación o reemplazo.';
                    materials = [
                        { nombre: 'Resistencias 1/4W', categoria: 'Componentes Pasivos', cantidad: 50 },
                        { nombre: 'Capacitores Electrolíticos', categoria: 'Componentes Pasivos', cantidad: 15 },
                        { nombre: 'Transistores 2N2222', categoria: 'Semiconductores', cantidad: 5 },
                        { nombre: 'Multímetros', categoria: 'Instrumentos', cantidad: 3 }
                    ];
                    break;
                case 'inventario':
                    title = 'Reporte de Inventario Completo';
                    sectionTitle = 'Inventario del Laboratorio';
                    quantityHeader = 'Cantidad Total';
                    note = 'Este reporte muestra el inventario completo del laboratorio de electrónica.';
                    materials = [
                        { nombre: 'Resistencias 1/4W', categoria: 'Componentes Pasivos', cantidad: 200 },
                        { nombre: 'Capacitores Electrolíticos', categoria: 'Componentes Pasivos', cantidad: 60 },
                        { nombre: 'Transistores 2N2222', categoria: 'Semiconductores', cantidad: 30 },
                        { nombre: 'LEDs 5mm', categoria: 'Componentes Activos', cantidad: 250 },
                        { nombre: 'Protoboards', categoria: 'Herramientas', cantidad: 20 },
                        { nombre: 'Multímetros', categoria: 'Instrumentos', cantidad: 10 }
                    ];
                    break;
                case 'visitas':
                    title = 'Reporte de Carreras con Mayor Visita';
                    sectionTitle = 'Estadísticas de Uso por Carrera';
                    quantityHeader = 'Visitas';
                    note = 'Este reporte muestra las carreras con mayor uso del laboratorio durante el mes actual.';
                    materials = [
                        { nombre: 'Ingeniería Electrónica', categoria: 'Carrera', cantidad: 35 },
                        { nombre: 'Ingeniería Mecatrónica', categoria: 'Carrera', cantidad: 28 },
                        { nombre: 'Ingeniería Industrial', categoria: 'Carrera', cantidad: 15 },
                        { nombre: 'Ingeniería en Sistemas', categoria: 'Carrera', cantidad: 7 }
                    ];
                    break;
                default:
                    materials = [];
            }

            // Update print container content
            document.getElementById('printTitle').textContent = title;
            document.getElementById('printReportNumber').textContent = reportNumber;
            document.getElementById('printDateTime').textContent = `${dateStr}, ${timeStr}`;
            document.getElementById('printSectionTitle').textContent = sectionTitle;
            document.getElementById('quantityHeader').textContent = quantityHeader;
            document.getElementById('printNote').textContent = note;

            // Populate materials table
            const tbody = document.getElementById('printMaterialsBody');
            tbody.innerHTML = '';
            
            materials.forEach(material => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${material.nombre}</td>
                    <td>${material.categoria}</td>
                    <td>${material.cantidad}</td>
                `;
                tbody.appendChild(row);
            });

            // Show print dialog
            window.print();
        }
