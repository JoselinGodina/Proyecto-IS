// ===========================================
// Alumno.js - Gestión de sesión, materiales y asesorías
// ===========================================

// ================================
// Seguridad: evitar regresar con flecha <-
// ================================
window.addEventListener("pageshow", (event) => {
  if (
    event.persisted ||
    (window.performance && window.performance.getEntriesByType("navigation")[0].type === "back_forward")
  ) {
    localStorage.removeItem("usuario")
    localStorage.removeItem("cart")
    sessionStorage.clear()
    window.location.href = "index.html"
  }
})

window.onpopstate = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"))
  if (!usuario) window.location.href = "index.html"
}

// ----------------------
// Verificar sesión al cargar
// ----------------------
window.addEventListener("load", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"))
  if (!usuario) window.location.href = "index.html"
  else {
    document.getElementById("studentName").textContent = usuario.nombres + " " + usuario.apellidos
    document.getElementById("studentInfo").textContent = usuario.id_usuario + " - " + (usuario.carrera || "Carrera")
    document.getElementById("semesterBadge").textContent = usuario.semestre || "Semestre"
  }
})

// ----------------------
// Logout
// ----------------------
const logoutBtn = document.getElementById("logoutBtn")
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {

    Swal.fire({
      title: "Cerrar sesión",
      html: `¿Estás seguro de que deseas <b>cerrar sesión</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#e57373",
      cancelButtonColor: "#6c757d",
      background: "#fff",
      color: "#333"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("usuario")
        localStorage.clear()
        window.location.href = "index.html"
      }
    });

  });
}


// ----------------------
// Variables globales
// ----------------------
let currentCategory = "all"
let selectedMaterial = null
let cart = JSON.parse(localStorage.getItem("cart")) || []
let materialsData = [] // Almacenar materiales desde BD

// ----------------------
// Inicialización
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Alumno] Iniciando aplicación...")
  loadStudentData()
  fetchMaterials()
  fetchSolicitudes()
  fetchAndRenderAsesorias()
  updateCartBadge()
  setupTabs()
  setupCategoryDropdown()
  setupSearch()
})

// ----------------------
// Cargar datos del alumno
// ----------------------
function loadStudentData() {
  const user = JSON.parse(localStorage.getItem("usuario"))
  if (user) {
    document.getElementById("studentName").textContent = `${user.nombres} ${user.apellidos}`
    document.getElementById("studentInfo").textContent = `${user.id_usuario} - ${user.carrera || ""}`
    document.getElementById("semesterBadge").textContent = user.semestre || ""
  }
}

// ----------------------
// Tabs
// ----------------------
function setupTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab
      tabBtns.forEach((b) => b.classList.remove("active"))
      tabContents.forEach((c) => c.classList.remove("active"))
      btn.classList.add("active")
      document.getElementById(`${targetTab}-tab`).classList.add("active")
    })
  })
}

// ----------------------
// Cargar materiales desde backend
// ----------------------
async function fetchMaterials() {
  try {
    console.log("[Alumno] Cargando materiales desde backend...")
    const response = await fetch("http://localhost:3000/materiales")

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    materialsData = await response.json()
    console.log("[Alumno] Materiales cargados:", materialsData.length)
    console.log("[Alumno] Primer material:", materialsData[0])
    renderMaterials()
  } catch (error) {
    console.error("[Alumno] Error al cargar materiales:", error)
    document.getElementById("materialsGrid").innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
        <p>Error al cargar materiales. Por favor, verifica que el servidor esté funcionando.</p>
        <p style="color: #ef4444; margin-top: 1rem;">${error.message}</p>
      </div>
    `
  }
}

// ----------------------
// Renderizar materiales
// ----------------------
function renderMaterials() {
  const grid = document.getElementById("materialsGrid")
  if (!grid) {
    console.error("[Alumno] Grid no encontrado")
    return
  }

  let filteredMaterials = materialsData

  // Filtrar por categoría
  if (currentCategory !== "all") {
    filteredMaterials = materialsData.filter((m) => m.categoria === currentCategory)
  }

  // Filtrar por búsqueda
  const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || ""
  if (searchTerm) {
    filteredMaterials = filteredMaterials.filter(
      (m) => m.nombre.toLowerCase().includes(searchTerm) || m.categoria.toLowerCase().includes(searchTerm),
    )
  }

  if (filteredMaterials.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
        <p>No se encontraron materiales</p>
      </div>
    `
    return
  }

  console.log("[Alumno] Renderizando", filteredMaterials.length, "materiales")

  grid.innerHTML = filteredMaterials
    .map(
      (material) => `
    <div class="material-card">
      <div class="material-header">
        <div>
          <h3 class="material-title">${material.nombre}</h3>
          <span class="material-category">${material.categoria}</span>
        </div>
      </div>
      <p class="material-available">Disponible: <strong>${material.cantidad_disponible || 0}</strong> unidades</p>
      <button class="add-to-cart-btn" onclick="openAddModal('${material.nombre.replace(/'/g, "\\'")}')">
        Agregar al préstamo
      </button>
    </div>
  `,
    )
    .join("")
}

// ----------------------
// Búsqueda
// ----------------------
function setupSearch() {
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderMaterials()
    })
  }
}

// ----------------------
// Dropdown categorías
// ----------------------
function setupCategoryDropdown() {
  const categoryBtn = document.getElementById("categoryBtn")
  const categoryMenu = document.getElementById("categoryMenu")
  const dropdownItems = document.querySelectorAll(".dropdown-item")

  if (!categoryBtn || !categoryMenu) return

  categoryBtn.addEventListener("click", (e) => {
    e.stopPropagation()
    categoryMenu.classList.toggle("show")
  })

  dropdownItems.forEach((item) => {
    item.addEventListener("click", () => {
      currentCategory = item.dataset.category
      document.getElementById("selectedCategory").textContent = item.textContent
      categoryMenu.classList.remove("show")
      dropdownItems.forEach((i) => i.classList.remove("active"))
      item.classList.add("active")
      renderMaterials()
    })
  })

  document.addEventListener("click", () => categoryMenu.classList.remove("show"))
}

// ----------------------
// Modal materiales
// ----------------------
// ----------------------
// Modal materiales seguro
// ----------------------
function openAddModal(materialNombre) {
  console.log("[Modal] Intentando abrir modal para:", materialNombre)
  console.log("[Modal] Materiales disponibles:", materialsData)

  // Buscar material por nombre exacto
  selectedMaterial = materialsData.find((m) => m.nombre === materialNombre)

  if (!selectedMaterial) {
  console.error("[Modal] Material no encontrado:", materialNombre)
  alert("Error: Material no encontrado. Por favor, recarga la página.")
  return
}

  console.log("[Modal] Material seleccionado:", selectedMaterial)

  const modal = document.getElementById("addMaterialModal")
 if (!modal) {
  console.error("[Modal] Elemento modal no encontrado en el DOM")

  Swal.fire({
    icon: "error",
    title: "Error",
    text: "El modal no existe en la página.",
    confirmButtonText: "Entendido",
    confirmButtonColor: "#d33"
  })

  return
}


  document.getElementById("modalMaterialName").textContent = selectedMaterial.nombre
  document.getElementById("modalMaterialCategory").textContent = selectedMaterial.categoria
  document.getElementById("modalAvailable").textContent = selectedMaterial.cantidad_disponible || 0
  document.getElementById("quantityInput").value = 1
  document.getElementById("quantityInput").max = selectedMaterial.cantidad_disponible || 0

  updateSelectedBadge()

  modal.classList.add("show")
  console.log("[Modal] Modal abierto exitosamente")
}

function confirmAddToCart() {
  const input = document.getElementById("quantityInput")
  const quantity = Number.parseInt(input?.value || 0)

  if (!selectedMaterial) {

  Swal.fire({
    icon: "error",
    title: "Sin material seleccionado",
    html: `
      Por favor elige un <b>material</b> antes de continuar.
    `,
    confirmButtonText: "Ok",
    confirmButtonColor: "#ff7b9c",
    background: "#fff",
    color: "#333"
  })

  return
}


 if (quantity < 1) {

  Swal.fire({
    icon: "warning",
    title: "Cantidad inválida",
    html: `
      La cantidad debe ser <b>mayor a 0</b>.
    `,
    confirmButtonText: "Entendido",
    confirmButtonColor: "#f4a259",
    background: "#fff",
    color: "#333"
  })

  return
}


  if (quantity > (selectedMaterial.cantidad_disponible || 0)) {

  Swal.fire({
    icon: "warning",
    title: "Cantidad insuficiente",
    html: `
      Solo hay <b>${selectedMaterial.cantidad_disponible || 0}</b> unidades disponibles.
    `,
    confirmButtonText: "Entendido",
    confirmButtonColor: "#ff9aae",
    background: "#fff",
    color: "#333"
  })

  return
}


  console.log("[Carrito] Agregando material:", selectedMaterial)
  console.log("[Carrito] Cantidad:", quantity)

  // Buscar si ya está en el carrito
  const existingItem = cart.find((item) => item.id === selectedMaterial.id_materiales)

  if (existingItem) {
    existingItem.quantity += quantity
    console.log("[Carrito] Material actualizado:", existingItem)
  } else {
    const newItem = {
      id: selectedMaterial.id_materiales,
      name: selectedMaterial.nombre || "Nombre desconocido",
      category: selectedMaterial.categoria || "Categoría desconocida",
      quantity: quantity,
    }
    cart.push(newItem)
    console.log("[Carrito] Nuevo material agregado:", newItem)
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartBadge()
  closeAddModal()
  Swal.fire({
  icon: "success",
  title: "¡Agregado al carrito!",
  html: `
    <b>${quantity}</b> unidad(es) de 
    <b>${selectedMaterial.nombre || "material"}</b> fueron agregadas al carrito.
  `,
  confirmButtonText: "Perfecto",
  confirmButtonColor: "#6ecb63",
  background: "#fff",
  color: "#333",
  timer: 1800,
  timerProgressBar: true
})


}


function closeAddModal() {
  const modal = document.getElementById("addMaterialModal")
  if (modal) {
    modal.classList.remove("show")
  }
  selectedMaterial = null
  console.log("[Modal] Modal cerrado")
}

// Cerrar modal al hacer clic fuera
setTimeout(() => {
  const modal = document.getElementById("addMaterialModal")
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeAddModal()
      }
    })
    console.log("[Modal] Event listener agregado")
  }
}, 500)

// ----------------------
// Cantidad y carrito
// ----------------------
function increaseQuantity() {
  const input = document.getElementById("quantityInput")
  const max = Number.parseInt(input.max)
  const current = Number.parseInt(input.value)
  if (current < max) {
    input.value = current + 1
    updateSelectedBadge()
  }
}

function decreaseQuantity() {
  const input = document.getElementById("quantityInput")
  const current = Number.parseInt(input.value)
  if (current > 1) {
    input.value = current - 1
    updateSelectedBadge()
  }
}

function updateSelectedBadge() {
  const quantity = document.getElementById("quantityInput").value
  const badge = document.getElementById("selectedBadge")
  if (badge) {
    badge.textContent = `Seleccionado: ${quantity}`
    badge.style.display = 'inline-block'
  }
}



function updateCartBadge() {
  const badge = document.getElementById("cartBadge")
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  if (badge) {
    badge.textContent = totalItems
    console.log("[Carrito] Badge actualizado:", totalItems)
  }
}


// ----------------------
// Solicitudes
// ----------------------
async function fetchSolicitudes() {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"))
    if (!usuario) return

    console.log("[Alumno] Cargando solicitudes...")

    // Cambié el endpoint para buscar por ID de usuario
    const response = await fetch(`http://localhost:3000/vales-prestamo/usuario/${usuario.id_usuario}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const solicitudesData = await response.json()
    console.log("[Alumno] Solicitudes cargadas:", solicitudesData.length)
    renderSolicitudes(solicitudesData)
  } catch (error) {
    console.error("[Alumno] Error al cargar solicitudes:", error)
    const grid = document.getElementById("solicitudesGrid")
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
          <p>Error al cargar solicitudes</p>
        </div>
      `
    }
  }
}


// Busca esta función y reemplázala completamente:
function renderSolicitudes(solicitudesData) {
  const grid = document.getElementById("solicitudesGrid")
  if (!grid) return

  if (solicitudesData.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
        <p>No tienes solicitudes pendientes</p>
      </div>
    `
    return
  }

  grid.innerHTML = solicitudesData
    .map(
      (solicitud) => `
    <div class="material-card">
      <div class="material-header">
        <div>
          <h3 class="material-title">Solicitud #${solicitud.id_vales}</h3>
          <span class="material-category">Solicitado: ${formatTime(solicitud.hora_entrega)}</span>
        </div>
        <span class="status-badge status-${solicitud.estado.toLowerCase()}">${solicitud.estado}</span>
      </div>
      <div style="margin: 1rem 0;">
        <p><strong>Material:</strong> ${solicitud.materiales || "N/A"}</p>
        <!-- Cambiado de "Fecha de préstamo" a "Hora de entrega" -->
        <p><strong>Hora de entrega:</strong> ${formatTime(solicitud.hora_entrega)}</p>
        ${solicitud.hora_devolucion ? `<p><strong>Hora de devolución:</strong> ${formatTime(solicitud.hora_devolucion)}</p>` : ""}
      </div>
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
        <p style="margin: 0.5rem 0;"><strong>Motivo:</strong> ${solicitud.motivo}</p>
      </div>
      ${
  solicitud.estado === "Aprobado"
    ? `
  <button class="devolver-btn" onclick="devolverMaterial('${solicitud.id_vales}')" style="margin-top: 1rem; width: 100%;">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    Devolver Material
  </button>
`
    : ""
}
    </div>
  `,
    )
    .join("")
}

function formatTime(timeString) {
  if (!timeString) return "No especificada"

  try {
    // El campo hora_entrega es de tipo TIME en PostgreSQL (formato: HH:MM:SS)
    const timeParts = timeString.split(":")
    if (timeParts.length < 2) return "Hora inválida"

    let hours = Number.parseInt(timeParts[0])
    const minutes = timeParts[1]

    // Convertir a formato 12 horas con AM/PM
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    hours = hours ? hours : 12 // La hora '0' debe ser '12'

    return `${hours}:${minutes} ${ampm}`
  } catch (error) {
    console.error("[Alumno] Error al formatear hora:", error)
    return "Error en formato"
  }
}


function formatDateTime(dateString) {
  if (!dateString) return "No especificada"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Fecha inválida"

    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }

    return date.toLocaleString("es-MX", options)
  } catch (error) {
    console.error("[Alumno] Error al formatear fecha:", error)
    return "Error en formato"
  }
}


// Agrega esta nueva función al final del archivo:
// Agrega esta nueva función al final del archivo:
async function devolverMaterial(id_vales) {

  Swal.fire({
    title: "¿Marcar como devuelto?",
    html: `
      ¿Estás seguro de que deseas <b>marcar este material como devuelto</b>?
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, marcar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#6ecb63",
    cancelButtonColor: "#6c757d",
    background: "#fff",
    color: "#333"
  }).then(async (result) => {

    if (!result.isConfirmed) return;

    // Encontrar el botón que disparó la acción
    const btn = event.target.closest('.devolver-btn');

    // Guardar el contenido original
    const originalContent = btn.innerHTML;

    // Mostrar estado de carga
    btn.classList.add('loading');
    btn.innerHTML = `
      <span class="btn-spinner"></span>
      Procesando...
    `;

    try {
      const response = await fetch(`http://localhost:3000/vales-prestamo/${id_vales}/devolver`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Restaurar botón antes de la alerta
        btn.classList.remove('loading');
        btn.innerHTML = originalContent;

        Swal.fire({
          icon: "success",
          title: "¡Material devuelto!",
          html: `
            El material fue marcado como <b>devuelto</b> exitosamente.
          `,
          confirmButtonText: "Perfecto",
          confirmButtonColor: "#6ecb63",
          background: "#fff",
          color: "#333",
          timer: 1800,
          timerProgressBar: true
        });

        fetchSolicitudes(); // Recargar las solicitudes
      } else {
        // Restaurar botón en caso de error
        btn.classList.remove('loading');
        btn.innerHTML = originalContent;

        Swal.fire({
          icon: "error",
          title: "Error",
          html: `
            ${result.error || 'Error al devolver el material'}
          `,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#e57373",
          background: "#fff",
          color: "#333"
        });
      }

    } catch (error) {
      console.error('[Alumno] Error al devolver material:', error);

      // Restaurar botón
      btn.classList.remove('loading');
      btn.innerHTML = originalContent;

      Swal.fire({
        icon: "error",
        title: "Error al procesar",
        html: `
          Ocurrió un problema al procesar la devolución.<br>
          <b>Intenta nuevamente.</b>
        `,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#e57373",
        background: "#fff",
        color: "#333"
      });
    }

  });
}


// ----------------------
// Asesorías
// ----------------------
async function fetchAndRenderAsesorias() {
  try {
    const res = await fetch("http://localhost:3000/asesorias")
    allAsesoriasData = await res.json()
    setupAsesoriasSearch()
    renderAsesorias(allAsesoriasData)
  } catch (err) {
    console.error(err)
  }
}

function renderAsesorias(asesoriasData) {
  const grid = document.getElementById("asesoriasGrid")
  if (!grid) return
  if (!asesoriasData || asesoriasData.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;"><p>No hay asesorías disponibles</p></div>`
    return
  }

  grid.innerHTML = asesoriasData
    .map((a) => {
      const cuposOcupados = a.cuposocupados || 0
      const disponibles = a.cupo - cuposOcupados
      const porcentaje = (cuposOcupados / a.cupo) * 100
      let cupoClass = "available",
        cupoTexto = `${disponibles} disponibles`
      if (porcentaje >= 100) {
        cupoClass = "unavailable"
        cupoTexto = "Cupo lleno"
        
      } else if (porcentaje >= 75) {
        cupoClass = "limited"
        cupoTexto = `${disponibles} disponibles`
      }

      return `
      <div class="material-card">
        <div class="material-header">
          <div>
            <h3 class="material-title">${a.titulo}</h3>
            <span class="material-category">${a.docente || 'Docente'}</span>
          </div>
        </div>
        <div style="margin: 1rem 0;">
          <p><strong>Fecha:</strong> ${formatDate(a.fecha)}</p>
          <p><strong>Horario:</strong> ${a.horario}</p>
          <p><strong>Cupo:</strong> ${cuposOcupados}/${a.cupo} inscritos</p>
          <p><strong>Disponibilidad:</strong> <span class="status-badge status-${cupoClass}">${cupoTexto}</span></p>
        </div>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <p><strong>Descripción:</strong> ${a.descripcion}</p>
        </div>
        <button class="add-to-cart-btn" onclick="solicitarAsesoria('${a.id_crear_asesoria}')" ${disponibles === 0 ? "disabled" : ""} style="margin-top: 1rem; width: 100%;">
          ${disponibles === 0 ? "Cupo Completo" : "Solicitar Asesoría"}
        </button>
      </div>
    `
    })
    .join("")
}

async function solicitarAsesoria(id_crear_asesoria) {
  const usuario = JSON.parse(localStorage.getItem("usuario"))
  if (!usuario) return alert("Debes iniciar sesión.")

  try {
    const res = await fetch("http://localhost:3000/inscribir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: usuario.id_usuario, id_crear_asesoria }),
    })
    const data = await res.json()

    if (data.success) {

  Swal.fire({
    icon: "success",
    title: "¡Inscripción exitosa!",
    html: `
      ¡Te has inscrito correctamente! 🎉
    `,
    confirmButtonText: "Perfecto",
    confirmButtonColor: "#6ecb63",
    background: "#fff",
    color: "#333",
    timer: 1800,
    timerProgressBar: true
  })

  fetchAndRenderAsesorias()
}
 else {
      alert(data.error || "No se pudo inscribir")
    }
  } catch (err) {
    console.error(err)
    alert("Error al inscribirse. Revisa la consola.")
  }
}

// ============================================
// BÚSQUEDA DE ASESORÍAS POR TÍTULO
// ============================================
let allAsesoriasData = []

function setupAsesoriasSearch() {
  const searchInput = document.getElementById("searchAsesoriasInput")
  if (searchInput) {
    searchInput.addEventListener("input", filterAndRenderAsesorias)
  }
}

function filterAndRenderAsesorias() {
  const searchTerm = document.getElementById("searchAsesoriasInput").value.toLowerCase()
  
  let filtered = allAsesoriasData
  if (searchTerm) {
    filtered = allAsesoriasData.filter(a => a.titulo.toLowerCase().includes(searchTerm))
  }
  
  renderAsesorias(filtered)
}

// ----------------------
// Funciones auxiliares
// ----------------------
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}