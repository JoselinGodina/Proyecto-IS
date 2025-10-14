const materials = [
  {
    id: 1,
    name: "Resistencias 1/4W",
    category: "Componentes Pasivos",
    available: 200,
  },
  {
    id: 2,
    name: "Capacitores Electrolíticos",
    category: "Componentes Pasivos",
    available: 150,
  },
  {
    id: 3,
    name: "Protoboards",
    category: "Herramientas",
    available: 25,
  },
  {
    id: 4,
    name: "Amplificadores Operacionales LM741",
    category: "Circuitos Integrados",
    available: 50,
  },
  {
    id: 5,
    name: "Transistores BJT (2N3904, 2N3906)",
    category: "Semiconductores",
    available: 100,
  },
  {
    id: 6,
    name: "LEDs de colores",
    category: "Componentes Pasivos",
    available: 300,
  },
  {
    id: 7,
    name: "Multímetro Digital",
    category: "Herramientas",
    available: 15,
  },
  {
    id: 8,
    name: "Arduino Uno R3",
    category: "Circuitos Integrados",
    available: 20,
  },
]

const solicitudesData = [
  {
    id: 1,
    material: "Arduino UNO R3, Resistencias 220Ω (x10), LED RGB",
    fecha: "2025-01-20",
    fechaSolicitud: "2025-01-15",
    motivo:
      "Proyecto de semáforo inteligente para la materia de Sistemas Embebidos. Necesito implementar un prototipo funcional.",
    cantidadTotal: 12,
    estado: "pendiente",
  },
  {
    id: 2,
    material: "Multímetro Digital, Protoboard 830 puntos",
    fecha: "2025-01-18",
    fechaSolicitud: "2025-01-14",
    motivo: "Práctica de medición de circuitos en serie y paralelo para Electrónica Analógica.",
    cantidadTotal: 2,
    estado: "aprobada",
  },
  {
    id: 3,
    material: "Capacitores Electrolíticos (varios valores), Diodos 1N4007",
    fecha: "2025-01-10",
    fechaSolicitud: "2025-01-08",
    motivo: "Construcción de fuente de alimentación regulada. Proyecto final del curso.",
    cantidadTotal: 15,
    estado: "rechazada",
  },
  {
    id: 4,
    material: "Sensor ultrasónico HC-SR04, Servomotor SG90",
    fecha: "2025-01-25",
    fechaSolicitud: "2025-01-16",
    motivo: "Desarrollo de sistema de detección de obstáculos para robot móvil. Competencia de robótica.",
    cantidadTotal: 3,
    estado: "pendiente",
  },
]

const asesoriasData = [
  {
    id: 1,
    titulo: "Introducción a Microcontroladores ARM",
    fecha: "2025-01-22",
    hora: "14:00 - 16:00",
    docente: "Dr. Carlos Méndez",
    cupo: 15,
    inscritos: 8,
    descripcion:
      "Aprende los fundamentos de la arquitectura ARM Cortex-M y su programación. Incluye ejemplos prácticos con STM32.",
  },
  {
    id: 2,
    titulo: "Diseño de PCB con KiCad",
    fecha: "2025-01-24",
    hora: "10:00 - 12:00",
    docente: "Ing. María González",
    cupo: 20,
    inscritos: 18,
    descripcion:
      "Taller práctico sobre diseño de circuitos impresos profesionales. Desde el esquemático hasta la fabricación.",
  },
  {
    id: 3,
    titulo: "Programación de FPGAs con Verilog",
    fecha: "2025-01-26",
    hora: "16:00 - 18:00",
    docente: "Dr. Roberto Sánchez",
    cupo: 12,
    inscritos: 12,
    descripcion:
      "Introducción al diseño digital con FPGAs. Aprende Verilog HDL y sintetiza tus primeros circuitos digitales.",
  },
  {
    id: 4,
    titulo: "Internet de las Cosas (IoT) con ESP32",
    fecha: "2025-01-28",
    hora: "15:00 - 17:00",
    docente: "Ing. Ana Martínez",
    cupo: 18,
    inscritos: 10,
    descripcion:
      "Conecta dispositivos a la nube usando ESP32. Aprende protocolos MQTT, HTTP y crea tu primer proyecto IoT.",
  },
  {
    id: 5,
    titulo: "Análisis de Circuitos con SPICE",
    fecha: "2025-01-30",
    hora: "11:00 - 13:00",
    docente: "Dr. Luis Ramírez",
    cupo: 15,
    inscritos: 6,
    descripcion:
      "Simulación y análisis de circuitos electrónicos usando LTspice. Técnicas avanzadas de análisis AC/DC y transitorio.",
  },
]

let currentCategory = "all"
let selectedMaterial = null
const cart = JSON.parse(localStorage.getItem("cart")) || []

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadStudentData()
  renderMaterials()
  renderSolicitudes()
  renderAsesorias()
  updateCartBadge()
  setupTabs()
  setupCategoryDropdown()
})

// Load student data from localStorage
function loadStudentData() {
  const studentData = JSON.parse(localStorage.getItem("studentData"))
  if (studentData) {
    document.getElementById("studentName").textContent = `${studentData.nombres} ${studentData.apellidos}`
    document.getElementById("studentInfo").textContent = `${studentData.numeroControl} - ${studentData.carrera}`
    document.getElementById("semesterBadge").textContent = `${studentData.semestre} Semestre`
  }
}

// Setup tabs
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

// Setup category dropdown
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
      const category = item.dataset.category
      currentCategory = category
      document.getElementById("selectedCategory").textContent = item.textContent
      categoryMenu.classList.remove("show")

      dropdownItems.forEach((i) => i.classList.remove("active"))
      item.classList.add("active")

      renderMaterials()
    })
  })

  document.addEventListener("click", () => {
    categoryMenu.classList.remove("show")
  })
}

// Render materials
function renderMaterials() {
  const grid = document.getElementById("materialsGrid")
  const filteredMaterials =
    currentCategory === "all" ? materials : materials.filter((m) => m.category === currentCategory)

  grid.innerHTML = filteredMaterials
    .map(
      (material) => `
    <div class="material-card" onclick="openAddModal(${material.id})">
      <div class="material-header">
        <div>
          <h3 class="material-title">${material.name}</h3>
          <span class="material-category">${material.category}</span>
        </div>
      </div>
      <p class="material-available">Disponible: <strong>${material.available}</strong> unidades</p>
      <button class="add-to-cart-btn" onclick="event.stopPropagation(); openAddModal(${material.id})">
        Agregar al préstamo
      </button>
    </div>
  `,
    )
    .join("")
}

// Open add material modal
function openAddModal(materialId) {
  selectedMaterial = materials.find((m) => m.id === materialId)
  if (!selectedMaterial) return

  document.getElementById("modalMaterialName").textContent = selectedMaterial.name
  document.getElementById("modalMaterialCategory").textContent = selectedMaterial.category
  document.getElementById("modalAvailable").textContent = selectedMaterial.available
  document.getElementById("quantityInput").value = 1
  document.getElementById("quantityInput").max = selectedMaterial.available

  document.getElementById("addMaterialModal").classList.add("show")
}

// Close add material modal
function closeAddModal() {
  document.getElementById("addMaterialModal").classList.remove("show")
  selectedMaterial = null
}

// Quantity controls
function increaseQuantity() {
  const input = document.getElementById("quantityInput")
  const max = Number.parseInt(input.max)
  const current = Number.parseInt(input.value)
  if (current < max) {
    input.value = current + 1
  }
}

function decreaseQuantity() {
  const input = document.getElementById("quantityInput")
  const current = Number.parseInt(input.value)
  if (current > 1) {
    input.value = current - 1
  }
}

// Confirm add to cart
function confirmAddToCart() {
  const quantity = Number.parseInt(document.getElementById("quantityInput").value)

  if (!selectedMaterial || quantity < 1) return

  const existingItem = cart.find((item) => item.id === selectedMaterial.id)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({
      id: selectedMaterial.id,
      name: selectedMaterial.name,
      category: selectedMaterial.category,
      quantity: quantity,
    })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartBadge()
  closeAddModal()

  // Show feedback
  alert(`${quantity} unidad(es) de ${selectedMaterial.name} agregado(s) al carrito`)
}

// Update cart badge
function updateCartBadge() {
  const badge = document.getElementById("cartBadge")
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  badge.textContent = totalItems
}

// Close modal when clicking outside
document.getElementById("addMaterialModal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeAddModal()
  }
})

// Render solicitudes
function renderSolicitudes() {
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

  const estadoTexto = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
  }

  grid.innerHTML = solicitudesData
    .map(
      (solicitud) => `
    <div class="material-card">
      <div class="material-header">
        <div>
          <h3 class="material-title">Solicitud #${solicitud.id}</h3>
          <span class="material-category">Solicitado: ${formatDate(solicitud.fechaSolicitud)}</span>
        </div>
        <span class="status-badge status-${solicitud.estado}">${estadoTexto[solicitud.estado]}</span>
      </div>
      <div style="margin: 1rem 0;">
        <p style="margin: 0.5rem 0;"><strong>Material:</strong> ${solicitud.material}</p>
        <p style="margin: 0.5rem 0;"><strong>Fecha de préstamo:</strong> ${formatDate(solicitud.fecha)}</p>
        <p style="margin: 0.5rem 0;"><strong>Cantidad total:</strong> ${solicitud.cantidadTotal} unidades</p>
      </div>
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
        <p style="margin: 0; font-weight: 600; color: #333; margin-bottom: 0.5rem;">Motivo:</p>
        <p style="margin: 0; color: #666; line-height: 1.5;">${solicitud.motivo}</p>
      </div>
    </div>
  `,
    )
    .join("")
}

// Render asesorias
function renderAsesorias() {
  const grid = document.getElementById("asesoriasGrid")

  if (!grid) return

  if (asesoriasData.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;">
        <p>No hay asesorías disponibles</p>
      </div>
    `
    return
  }

  grid.innerHTML = asesoriasData
    .map((asesoria) => {
      const disponibles = asesoria.cupo - asesoria.inscritos
      const porcentaje = (asesoria.inscritos / asesoria.cupo) * 100

      let cupoClass = "available"
      let cupoTexto = `${disponibles} disponibles`

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
            <h3 class="material-title">${asesoria.titulo}</h3>
            <span class="material-category">${asesoria.docente}</span>
          </div>
        </div>
        <div style="margin: 1rem 0;">
          <p style="margin: 0.5rem 0;"><strong>Fecha:</strong> ${formatDate(asesoria.fecha)}</p>
          <p style="margin: 0.5rem 0;"><strong>Horario:</strong> ${asesoria.hora}</p>
          <p style="margin: 0.5rem 0;"><strong>Cupo:</strong> ${asesoria.inscritos}/${asesoria.cupo} inscritos</p>
          <p style="margin: 0.5rem 0;">
            <strong>Disponibilidad:</strong> 
            <span class="status-badge status-${cupoClass}">${cupoTexto}</span>
          </p>
        </div>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <p style="margin: 0; font-weight: 600; color: #333; margin-bottom: 0.5rem;">Descripción:</p>
          <p style="margin: 0; color: #666; line-height: 1.5;">${asesoria.descripcion}</p>
        </div>
        <button 
          class="add-to-cart-btn" 
          onclick="solicitarAsesoria(${asesoria.id})"
          ${disponibles === 0 ? "disabled" : ""}
          style="margin-top: 1rem; width: 100%;"
        >
          ${disponibles === 0 ? "Cupo Completo" : "Solicitar Asesoría"}
        </button>
      </div>
    `
    })
    .join("")
}

// Helper function to format dates
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}

// Function to handle asesoria requests
function solicitarAsesoria(asesoriaId) {
  const asesoria = asesoriasData.find((a) => a.id === asesoriaId)
  if (!asesoria) return

  const disponibles = asesoria.cupo - asesoria.inscritos
  if (disponibles > 0) {
    alert(
      `Solicitud enviada para: ${asesoria.titulo}\nDocente: ${asesoria.docente}\nFecha: ${formatDate(asesoria.fecha)}`,
    )
  }
}
