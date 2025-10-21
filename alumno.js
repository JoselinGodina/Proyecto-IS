// =========================================== 
// Alumno.js - Gestión de sesión, materiales y asesorías
// ===========================================

// ================================
// Seguridad: evitar regresar con flecha <-
// ================================
window.addEventListener("pageshow", function(event) {
  if (event.persisted || (window.performance && window.performance.getEntriesByType("navigation")[0].type === "back_forward")) {
    localStorage.removeItem("usuario");
    localStorage.removeItem("cart");
    sessionStorage.clear();
    window.location.href = "index.html";
  }
});

window.onpopstate = function () {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) window.location.href = "index.html";
};

// ----------------------
// Verificar sesión al cargar
// ----------------------
window.addEventListener("load", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) window.location.href = "index.html";
  else {
    document.getElementById("studentName").textContent = usuario.nombres + " " + usuario.apellidos;
    document.getElementById("studentInfo").textContent = usuario.id_usuario + " - " + (usuario.carrera || "Carrera");
    document.getElementById("semesterBadge").textContent = usuario.semestre || "Semestre";
  }
});

// ----------------------
// Logout
// ----------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("cart");
    sessionStorage.clear();
    window.location.href = "index.html";
  });
}

// ----------------------
// Datos de materiales (ejemplo)
// ----------------------
const materials = [
  { id: 1, name: "Resistencias 1/4W", category: "Componentes Pasivos", available: 200 },
  { id: 2, name: "Capacitores Electrolíticos", category: "Componentes Pasivos", available: 150 },
  { id: 3, name: "Protoboards", category: "Herramientas", available: 25 },
  { id: 4, name: "Amplificadores Operacionales LM741", category: "Circuitos Integrados", available: 50 },
  { id: 5, name: "Transistores BJT (2N3904, 2N3906)", category: "Semiconductores", available: 100 },
  { id: 6, name: "LEDs de colores", category: "Componentes Pasivos", available: 300 },
  { id: 7, name: "Multímetro Digital", category: "Herramientas", available: 15 },
  { id: 8, name: "Arduino Uno R3", category: "Circuitos Integrados", available: 20 },
];

// ----------------------
// Datos de solicitudes (ejemplo)
// ----------------------
const solicitudesData = [
  { id: 1, material: "Arduino UNO R3, Resistencias 220Ω (x10), LED RGB", fecha: "2025-01-20", fechaSolicitud: "2025-01-15", motivo: "Proyecto de semáforo inteligente", cantidadTotal: 12, estado: "pendiente" },
  { id: 2, material: "Multímetro Digital, Protoboard 830 puntos", fecha: "2025-01-18", fechaSolicitud: "2025-01-14", motivo: "Práctica de medición de circuitos", cantidadTotal: 2, estado: "aprobada" },
];

// ----------------------
// Variables globales
// ----------------------
let currentCategory = "all";
let selectedMaterial = null;
const cart = JSON.parse(localStorage.getItem("cart")) || [];

// ----------------------
// Inicialización
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  loadStudentData();
  renderMaterials();
  renderSolicitudes();
  fetchAndRenderAsesorias(); // Trae las asesorías desde backend
  updateCartBadge();
  setupTabs();
  setupCategoryDropdown();
});

// ----------------------
// Cargar datos del alumno
// ----------------------
function loadStudentData() {
  const user = JSON.parse(localStorage.getItem("usuario"));
  if (user) {
    document.getElementById("studentName").textContent = `${user.nombres} ${user.apellidos}`;
    document.getElementById("studentInfo").textContent = `${user.id_usuario} - ${user.carrera || ""}`;
    document.getElementById("semesterBadge").textContent = user.semestre || "";
  }
}

// ----------------------
// Tabs
// ----------------------
function setupTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`${targetTab}-tab`).classList.add("active");
    });
  });
}

// ----------------------
// Dropdown categorías
// ----------------------
function setupCategoryDropdown() {
  const categoryBtn = document.getElementById("categoryBtn");
  const categoryMenu = document.getElementById("categoryMenu");
  const dropdownItems = document.querySelectorAll(".dropdown-item");

  categoryBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    categoryMenu.classList.toggle("show");
  });

  dropdownItems.forEach((item) => {
    item.addEventListener("click", () => {
      currentCategory = item.dataset.category;
      document.getElementById("selectedCategory").textContent = item.textContent;
      categoryMenu.classList.remove("show");
      dropdownItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      renderMaterials();
    });
  });

  document.addEventListener("click", () => categoryMenu.classList.remove("show"));
}

// ----------------------
// Render materiales
// ----------------------
function renderMaterials() {
  const grid = document.getElementById("materialsGrid");
  if (!grid) return;
  const filteredMaterials = currentCategory === "all" ? materials : materials.filter(m => m.category === currentCategory);

  grid.innerHTML = filteredMaterials.map(material => `
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
  `).join("");
}

// ----------------------
// Modal materiales
// ----------------------
function openAddModal(materialId) {
  selectedMaterial = materials.find(m => m.id === materialId);
  if (!selectedMaterial) return;
  document.getElementById("modalMaterialName").textContent = selectedMaterial.name;
  document.getElementById("modalMaterialCategory").textContent = selectedMaterial.category;
  document.getElementById("modalAvailable").textContent = selectedMaterial.available;
  document.getElementById("quantityInput").value = 1;
  document.getElementById("quantityInput").max = selectedMaterial.available;
  document.getElementById("addMaterialModal").classList.add("show");
}

function closeAddModal() {
  document.getElementById("addMaterialModal").classList.remove("show");
  selectedMaterial = null;
}

document.getElementById("addMaterialModal")?.addEventListener("click", function (e) {
  if (e.target === this) closeAddModal();
});

// ----------------------
// Cantidad y carrito
// ----------------------
function increaseQuantity() {
  const input = document.getElementById("quantityInput");
  const max = Number.parseInt(input.max);
  const current = Number.parseInt(input.value);
  if (current < max) input.value = current + 1;
}

function decreaseQuantity() {
  const input = document.getElementById("quantityInput");
  const current = Number.parseInt(input.value);
  if (current > 1) input.value = current - 1;
}

function confirmAddToCart() {
  const quantity = Number.parseInt(document.getElementById("quantityInput").value);
  if (!selectedMaterial || quantity < 1) return;
  const existingItem = cart.find(item => item.id === selectedMaterial.id);
  if (existingItem) existingItem.quantity += quantity;
  else cart.push({ id: selectedMaterial.id, name: selectedMaterial.name, category: selectedMaterial.category, quantity });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  closeAddModal();
  alert(`${quantity} unidad(es) de ${selectedMaterial.name} agregado(s) al carrito`);
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) badge.textContent = totalItems;
}

// ----------------------
// Render solicitudes
// ----------------------
function renderSolicitudes() {
  const grid = document.getElementById("solicitudesGrid");
  if (!grid) return;
  if (solicitudesData.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;"><p>No tienes solicitudes pendientes</p></div>`;
    return;
  }
  const estadoTexto = { pendiente: "Pendiente", aprobada: "Aprobada", rechazada: "Rechazada" };
  grid.innerHTML = solicitudesData.map(solicitud => `
    <div class="material-card">
      <div class="material-header">
        <div>
          <h3 class="material-title">Solicitud #${solicitud.id}</h3>
          <span class="material-category">Solicitado: ${formatDate(solicitud.fechaSolicitud)}</span>
        </div>
        <span class="status-badge status-${solicitud.estado}">${estadoTexto[solicitud.estado]}</span>
      </div>
      <div style="margin: 1rem 0;">
        <p><strong>Material:</strong> ${solicitud.material}</p>
        <p><strong>Fecha de préstamo:</strong> ${formatDate(solicitud.fecha)}</p>
        <p><strong>Cantidad total:</strong> ${solicitud.cantidadTotal} unidades</p>
      </div>
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
        <p style="margin: 0.5rem 0;"><strong>Motivo:</strong> ${solicitud.motivo}</p>
      </div>
    </div>
  `).join("");
}

// ----------------------
// Render asesorías desde backend
// ----------------------
async function fetchAndRenderAsesorias() {
  try {
    const res = await fetch("http://localhost:3000/asesorias");
    const asesoriasData = await res.json();
    renderAsesorias(asesoriasData);
  } catch (err) {
    console.error(err);
  }
}

function renderAsesorias(asesoriasData) {
  const grid = document.getElementById("asesoriasGrid");
  if (!grid) return;
  if (!asesoriasData || asesoriasData.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #666;"><p>No hay asesorías disponibles</p></div>`;
    return;
  }

  grid.innerHTML = asesoriasData.map(a => {
    const cuposOcupados = a.cuposocupados || 0; // <-- CORREGIDO
    const disponibles = a.cupo - cuposOcupados;
    const porcentaje = (cuposOcupados / a.cupo) * 100;
    let cupoClass = "available", cupoTexto = `${disponibles} disponibles`;
    if (porcentaje >= 100) { cupoClass = "unavailable"; cupoTexto = "Cupo lleno"; }
    else if (porcentaje >= 75) { cupoClass = "limited"; cupoTexto = `${disponibles} disponibles`; }

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
    `;
  }).join("");
}

// ----------------------
// Función para solicitar asesoría
// ----------------------
async function solicitarAsesoria(id_crear_asesoria) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return alert("Debes iniciar sesión.");

  try {
    const res = await fetch("http://localhost:3000/inscribir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: usuario.id_usuario, id_crear_asesoria })
    });
    const data = await res.json();

    if (data.success) {
      alert("¡Te has inscrito correctamente!");
      fetchAndRenderAsesorias(); // 🔄 recarga las asesorías y se actualiza el número de cuposOcupados
    } else {
      alert(data.error || "No se pudo inscribir");
    }
  } catch (err) {
    console.error(err);
    alert("Error al inscribirse. Revisa la consola.");
  }
}

// ----------------------
// Funciones auxiliares
// ----------------------
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}
