//const { default: Swal } = require("sweetalert2");
let adminLogueado = null
       function cerrarSesion() {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "Tu sesión se cerrará",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: "Cerrando sesión...",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                localStorage.removeItem("usuario");
                localStorage.removeItem("userRole");
                window.location.href = "index.html";
            });
        }
    });
}

function mostrarAdminLogueado() {
  const usuarioGuardado = localStorage.getItem("usuario")

  if (usuarioGuardado) {
    try {
      adminLogueado = JSON.parse(usuarioGuardado)

      const adminNameElement = document.querySelector(".admin-details h3")
      const adminInfoElement = document.querySelector(".admin-details p")

      if (adminNameElement && adminInfoElement) {
        const nombreCompleto = `${adminLogueado.nombres} ${adminLogueado.apellidos}`
        adminNameElement.textContent = nombreCompleto

        let rolTexto = "Usuario"
        if (adminLogueado.roles_id_rol === 1) {
          rolTexto = "Administrador"
        } else if (adminLogueado.roles_id_rol === 2) {
          rolTexto = "Docente"
        } else if (adminLogueado.roles_id_rol === 3) {
          rolTexto = "Alumno"
        }

        adminInfoElement.textContent = `${adminLogueado.id_usuario} - ${rolTexto}`
      }

      console.log("[v0] Usuario logueado:", adminLogueado)
    } catch (error) {
      console.error("[v0] Error al parsear usuario:", error)
      window.location.href = "index.html"
    }
  } else {
    console.log("[v0] No hay usuario en localStorage, redirigiendo...")
    window.location.href = "index.html"
  }
}

        function generarReporte(tipo, categoria) {
    console.log('[v0] Generando reporte:', tipo, categoria);

    if (tipo === 'pdf') {

        // 👉 Si el reporte es de visitas, generar PDF con gráfica
        if (categoria === 'visitas') {
            fetch('http://localhost:3000/reporte/carreras-visitas')
                .then(res => res.json())
                .then(data => generarPDFConGrafica(data))
                .catch(err => console.error('Error cargando datos:', err));
            return; // ❗ Evitamos mostrarVistaPrevia()
        }

        // Para los demás reportes
        mostrarVistaPrevia(categoria);

    } else if (tipo === 'excel') {
        generarExcel(categoria);
    }
}


function obtenerFechaActual() {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

function obtenerSemestreActual() {
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;

    if (mes >= 2 && mes <= 7) {
        return "Febrero - Julio";
    } else {
        return "Agosto - Diciembre";
    }
}

function obtenerFechaActual() {
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}

async function generarPDFConGrafica(data) {

    const semestreActual = obtenerSemestreActual();
    const fechaActual = obtenerFechaActual();

    // Preparar datos
    const labels = data.map(item => item.nombre);
    const valores = data.map(item => item.cantidad);

    // Calcular máximo para escalar Y dinámicamente
    const maxValor = Math.max(...valores);
    const suggestedMax = maxValor <= 10 ? 10 :
                         maxValor <= 50 ? 50 :
                         maxValor <= 100 ? 100 :
                         maxValor + 20;

    const step = Math.ceil(suggestedMax / 10);

    // Canvas
    const ctx = document.getElementById('graficaCarreras').getContext('2d');

    if (window.graficaReporte) {
        window.graficaReporte.destroy();
    }

    window.graficaReporte = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Visitas',
                data: valores,
                backgroundColor: "#4A90E2"
            }]
        },
        options: { 
            responsive: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax,
                    ticks: {
                        stepSize: step
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Visitas por Carrera – ${semestreActual} – ${fechaActual}`
                }
            }
        }
    });

    // Esperar que se renderice
    await new Promise(resolve => setTimeout(resolve, 800));

    const imagenGrafica = document.getElementById('graficaCarreras').toDataURL('image/png');

    // Crear PDF
    const pdf = new jspdf.jsPDF();

    pdf.setFontSize(16);
    pdf.text("Reporte de Carreras con Mayor Visita", 10, 15);

    pdf.setFontSize(12);
    pdf.text("Gráfica generada automáticamente con estadísticas actuales.", 10, 25);
    pdf.text(`Semestre actual: ${semestreActual}`, 10, 32);
    pdf.text(`Fecha del reporte: ${fechaActual}`, 10, 39);

    pdf.addImage(imagenGrafica, 'PNG', 10, 50, 180, 110);

    pdf.save("reporte_carreras_visitas.pdf");
}




       async function generarExcel(categoria) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  let filename, quantityHeader, endpoint;

  switch(categoria) {
    case 'disponible':
      filename = `Reporte_Material_Disponible_${dateStr}.csv`;
      quantityHeader = 'Cantidad Disponible';
      endpoint = '/reporte/material-disponible';
      break;
    case 'danado':
      filename = `Reporte_Material_Danado_${dateStr}.csv`;
      quantityHeader = 'Cantidad Dañada';
      endpoint = '/reporte/material-danado';
      break;
    case 'inventario':
      filename = `Reporte_Inventario_Completo_${dateStr}.csv`;
      quantityHeader = 'Cantidad Total';
      endpoint = '/reporte/inventario';
      break;
    case 'visitas':
      filename = `Reporte_Carreras_Mayor_Visita_${dateStr}.csv`;
      quantityHeader = 'Visitas';
      endpoint = '/reporte/carreras-visitas';
      break;
  }

  // 🟢 Obtener datos del servidor
  const res = await fetch(`http://localhost:3000${endpoint}`);
  const materials = await res.json();

  // Crear CSV
  let csvContent = '\uFEFF';
  csvContent += `Material,Categoría,${quantityHeader}\n`;

  materials.forEach(m => {
    csvContent += `"${m.nombre}","${m.categoria || 'N/A'}",${m.cantidad}\n`;
  });

  // Descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


async function mostrarVistaPrevia(categoria) {
  // 🕓 Fecha y hora actuales
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  const reportNumber = 'REP-' + Math.floor(Math.random() * 100000).toString().padStart(6, '0');

  // 🧾 Configurar título y endpoint
  let title, sectionTitle, quantityHeader, note, endpoint;

  switch (categoria) {
    case 'disponible':
      title = 'Reporte de Material Disponible';
      sectionTitle = 'Materiales Disponibles';
      quantityHeader = 'Cantidad Disponible';
      note = 'Este reporte muestra todos los materiales disponibles para préstamo en el laboratorio.';
      endpoint = '/reporte/material-disponible';
      break;
    case 'danado':
      title = 'Reporte de Material Dañado';
      sectionTitle = 'Materiales Dañados';
      quantityHeader = 'Cantidad Dañada';
      note = 'Este reporte muestra todos los materiales que requieren reparación o reemplazo.';
      endpoint = '/reporte/material-danado';
      break;
    case 'inventario':
      title = 'Reporte de Inventario Completo';
      sectionTitle = 'Inventario del Laboratorio';
      quantityHeader = 'Cantidad Total';
      note = 'Este reporte muestra el inventario completo del laboratorio de electrónica.';
      endpoint = '/reporte/inventario';
      break;
    case 'visitas':
      title = 'Reporte de Carreras con Mayor Visita';
      sectionTitle = 'Estadísticas de Uso por Carrera';
      quantityHeader = 'Visitas';
      note = 'Este reporte muestra las carreras con mayor uso del laboratorio durante el mes actual.';
      endpoint = '/reporte/carreras-visitas';
      break;
    default:
      endpoint = null;
  }

  // 🟢 Obtener datos reales del backend
  let materials = [];
  if (endpoint) {
    try {
      const res = await fetch(`http://localhost:3000${endpoint}`);
      materials = await res.json();
    } catch (error) {
      console.error('Error al cargar datos del reporte:', error);
      alert('No se pudieron cargar los datos del reporte.');
    }
  }

  // 🖨️ Actualizar los elementos del DOM con los datos
  document.getElementById('printTitle').textContent = title;
  document.getElementById('printReportNumber').textContent = reportNumber;
  document.getElementById('printDateTime').textContent = `${dateStr}, ${timeStr}`;
  document.getElementById('printSectionTitle').textContent = sectionTitle;
  document.getElementById('quantityHeader').textContent = quantityHeader;
  document.getElementById('printNote').textContent = note;

  // 🧱 Rellenar la tabla con los datos del servidor
  const tbody = document.getElementById('printMaterialsBody');
  tbody.innerHTML = '';

  if (materials.length > 0) {
    materials.forEach(material => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${material.nombre}</td>
        <td>${material.categoria || 'N/A'}</td>
        <td>${material.cantidad ?? 0}</td>
      `;
      tbody.appendChild(row);
    });
  } else {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="3" style="text-align:center; font-style:italic;">No hay datos disponibles</td>
    `;
    tbody.appendChild(emptyRow);
  }

  // 🖨️ Mostrar la vista de impresión (mantiene tu mismo diseño)
  window.print();
}

// Llamar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    mostrarAdminLogueado();
});
