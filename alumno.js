
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

let currentCategory = "all"
let selectedMaterial = null
const cart = JSON.parse(localStorage.getItem("cart")) || []

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadStudentData()
  renderMaterials()
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