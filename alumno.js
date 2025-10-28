// ===========================================
// Alumno.js - Gestión de sesión, materiales y asesorías
// ===========================================

// ================================
// Seguridad: evitar regresar con flecha <-
// ================================

// ----------------------
// Inicialización
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Alumno] Iniciando carga de datos...")
  loadStudentData()
  fetchMaterials() // ← IMPORTANTE: Esto debe estar aquí
  fetchSolicitudes()
  fetchAndRenderAsesorias()
  updateCartBadge()
  setupTabs()
  setupCategoryDropdown()
  setupSearch()
})

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
    localStorage.removeItem("usuario")
    localStorage.removeItem("cart")
    sessionStorage.clear()
    window.location.href = "index.html"
  })
}

// ----------------------
// Variables globales
// ----------------------
let currentCategory = "all"
let selectedMaterial = null
const cart = JSON.parse(localStorage.getItem("cart")) || []
let materialsData = [] // Almacenar materiales desde BD

// ----------------------
// Inicialización
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  loadStudentData()
  fetchMaterials() // Cargar materiales desde backend
  fetchSolicitudes() // Cargar solicitudes desde backend
  fetchAndRenderAsesorias()
  updateCartBadge()
  setupTabs()
  setupCategoryDropdown()
  setupSearch() // Agregar búsqueda
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
// ----------------------
async function fetchMaterials() {
  try {
    console.log("[v0] Cargando materiales desde backend...")
    const response = await fetch("http://localhost:3000/materiales")

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    materialsData = await response.json()
    console.log("[v0] Materiales cargados:", materialsData.length)
    renderMaterials()
  } catch (error) {
    console.error("[v0] Error al cargar materiales:", error)
    document.getElementById("materialsGrid").innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
        <p>Error al cargar materiales. Por favor, verifica que el servidor esté funcionando.</p>
      </div>
    `
  }
}

// ----------------------
// ----------------------
function renderMaterials() {
  const grid = document.getElementById("materialsGrid")
  if (!grid) return

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

  grid.innerHTML = filteredMaterials
    .map(
      (material) => `
    <div class="material-card" onclick="openAddModal(${material.id_materiales})">
      <div class="material-header">
        <div>
          <h3 class="material-title">${material.nombre}</h3>
          <span class="material-category">${material.categoria}</span>
        </div>
      </div>
      <p class="material-available">Disponible: <strong>${material.cantidad_disponible}</strong> unidades</p>
      <button class="add-to-cart-btn" onclick="event.stopPropagation(); openAddModal(${material.id_materiales})">
        Agregar al préstamo
      </button>
    </div>
  `,
    )
    .join("")
}

// ----------------------
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
function openAddModal(materialId) {
  selectedMaterial = materialsData.find((m) => m.id_materiales === materialId)
  if (!selectedMaterial) return
  document.getElementById("modalMaterialName").textContent = selectedMaterial.nombre
  document.getElementById("modalMaterialCategory").textContent = selectedMaterial.categoria
  document.getElementById("modalAvailable").textContent = selectedMaterial.cantidad_disponible
  document.getElementById("quantityInput").value = 1
  document.getElementById("quantityInput").max = selectedMaterial.cantidad_disponible
  document.getElementById("addMaterialModal").classList.add("show")
}

function closeAddModal() {
  document.getElementById("addMaterialModal").classList.remove("show")
  selectedMaterial = null
}

document.getElementById("addMaterialModal")?.addEventListener("click", function (e) {
  if (e.target === this) closeAddModal()
})

// ----------------------
// Cantidad y carrito
// ----------------------
function increaseQuantity() {
  const input = document.getElementById("quantityInput")
  const max = Number.parseInt(input.max)
  const current = Number.parseInt(input.value)
  if (current < max) input.value = current + 1
}

function decreaseQuantity() {
  const input = document.getElementById("quantityInput")
  const current = Number.parseInt(input.value)
  if (current > 1) input.value = current - 1
}

function confirmAddToCart() {
  const quantity = Number.parseInt(document.getElementById("quantityInput").value)
  if (!selectedMaterial || quantity < 1) return
  const existingItem = cart.find((item) => item.id === selectedMaterial.id_materiales)
  if (existingItem) existingItem.quantity += quantity
  else
    cart.push({
      id: selectedMaterial.id_materiales,
      name: selectedMaterial.nombre,
      category: selectedMaterial.categoria,
      quantity,
    })
  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartBadge()
  closeAddModal()
  alert(`${quantity} unidad(es) de ${selectedMaterial.nombre} agregado(s) al carrito`)
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge")
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  if (badge) badge.textContent = totalItems
}

// ----------------------
// ----------------------
async function fetchSolicitudes() {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"))
    if (!usuario) return

    console.log("[v0] Cargando solicitudes desde backend...")
    const response = await fetch(`http://localhost:3000/vales-prestamo/${usuario.id_usuario}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const solicitudesData = await response.json()
    console.log("[v0] Solicitudes cargadas:", solicitudesData.length)
    renderSolicitudes(solicitudesData)
  } catch (error) {
    console.error("[v0] Error al cargar solicitudes:", error)
    document.getElementById("solicitudesGrid").innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
        <p>Error al cargar solicitudes</p>
      </div>
    `
  }
}

// ----------------------
// ----------------------
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
          <span class="material-category">Solicitado: ${formatDate(solicitud.hora_entrega)}</span>
        </div>
        <span class="status-badge status-${solicitud.estado.toLowerCase()}">${solicitud.estado}</span>
      </div>
      <div style="margin: 1rem 0;">
        <p><strong>Material:</strong> ${solicitud.materiales || "N/A"}</p>
        <p><strong>Fecha de préstamo:</strong> ${formatDate(solicitud.hora_entrega)}</p>
        <p><strong>Cantidad total:</strong> ${solicitud.cantidad_total || 0} unidades</p>
        ${solicitud.hora_devolucion ? `<p><strong>Fecha de devolución:</strong> ${formatDate(solicitud.hora_devolucion)}</p>` : ""}
      </div>
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
        <p style="margin: 0.5rem 0;"><strong>Motivo:</strong> ${solicitud.motivo}</p>
      </div>
    </div>
  `,
    )
    .join("")
}

// ----------------------
// Render asesorías desde backend
// ----------------------
async function fetchAndRenderAsesorias() {
  try {
    const res = await fetch("http://localhost:3000/asesorias")
    const asesoriasData = await res.json()
    renderAsesorias(asesoriasData)
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
            <span class="material-category">${a.docente}</span>
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

// ----------------------
// Función para solicitar asesoría
// ----------------------
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
      alert("¡Te has inscrito correctamente!")
      fetchAndRenderAsesorias()
    } else {
      alert(data.error || "No se pudo inscribir")
    }
  } catch (err) {
    console.error(err)
    alert("Error al inscribirse. Revisa la consola.")
  }
}

// ----------------------
// Funciones auxiliares
// ----------------------
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}
