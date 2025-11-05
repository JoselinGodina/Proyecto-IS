let adminLogueado = null

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

function cerrarSesion() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("usuario")
    localStorage.clear()
    window.location.href = "index.html"
  }
}

const modalOverlay = document.getElementById("modalOverlay")
const openModalBtn = document.getElementById("openModalBtn")
const cancelBtn = document.getElementById("cancelBtn")
const submitBtn = document.getElementById("submitBtn")
const materialForm = document.getElementById("materialForm")
const quantityInput = document.getElementById("quantity")
const materialsContainer = document.getElementById("materialsContainer")

const selectTrigger = document.getElementById("selectTrigger")
const selectOptions = document.getElementById("selectOptions")
const selectDisplay = document.getElementById("selectDisplay")
const categoryInput = document.getElementById("category")

let categorias = []

async function cargarCategorias() {
  try {
    console.log("[v0] Iniciando carga de categorías...")
    const response = await fetch("http://localhost:3000/categorias")
    console.log("[v0] Response status categorías:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Error response:", errorText)
      throw new Error("Error al cargar categorías")
    }

    categorias = await response.json()
    console.log("[v0] Categorías cargadas:", categorias)

    if (!categorias || categorias.length === 0) {
      console.warn("[v0] No se encontraron categorías en la base de datos")
      alert("No hay categorías disponibles. Por favor, agrega categorías primero.")
      return
    }

    selectOptions.innerHTML = ""

    categorias.forEach((cat) => {
      const option = document.createElement("div")
      option.className = "select-option"
      option.setAttribute("data-value", cat.id_categoria)
      option.textContent = cat.descripcion
      selectOptions.appendChild(option)

      option.addEventListener("click", () => {
        const value = option.getAttribute("data-value")
        const text = option.textContent

        selectDisplay.textContent = text
        selectDisplay.className = "select-value"
        categoryInput.value = value

        document.querySelectorAll(".select-option").forEach((opt) => opt.classList.remove("selected"))
        option.classList.add("selected")

        selectTrigger.classList.remove("active")
        selectOptions.classList.remove("active")
      })
    })
  } catch (error) {
    console.error("[v0] Error al cargar categorías:", error)
    alert("Error al cargar las categorías: " + error.message)
  }
}

function createMaterialCard(materialName, categoryName, available, defective) {
  const card = document.createElement("div")
  card.className = "material-card"

  const defectiveCount = defective !== undefined && defective !== null ? defective : 0

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
                <div class="stat-value available">${available || 0}</div>
                <div class="stat-label">Disponibles</div>
            </div>
            <div class="stat">
                <div class="stat-value defective">${defectiveCount}</div>
                <div class="stat-label">Defallidos</div>
            </div>
        </div>
    `

  return card
}

async function cargarMateriales() {
  try {
    console.log("[v0] Iniciando carga de materiales...")
    const response = await fetch("http://localhost:3000/materiales")
    console.log("[v0] Response status materiales:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Error response:", errorText)
      throw new Error("Error al cargar materiales")
    }

    const materiales = await response.json()
    console.log("[v0] Materiales cargados:", materiales)

    materialsContainer.innerHTML = ""

    if (!materiales || materiales.length === 0) {
      console.log("[v0] No hay materiales en la base de datos")
      materialsContainer.innerHTML =
        '<p style="text-align: center; color: #666; padding: 20px;">No hay materiales registrados</p>'
      return
    }

    materiales.forEach((material) => {
      const card = createMaterialCard(
        material.nombre,
        material.descripcion,
        material.cantidad_disponible,
        material.cantidad_daniados, // This field is now returned by the server
      )
      materialsContainer.appendChild(card)
    })
  } catch (error) {
    console.error("[v0] Error al cargar materiales:", error)
    materialsContainer.innerHTML =
      '<p style="text-align: center; color: #e74c3c; padding: 20px;">Error al cargar materiales: ' +
      error.message +
      "</p>"
  }
}

openModalBtn.addEventListener("click", () => {
  modalOverlay.classList.add("active")
  quantityInput.value = "0"
})

cancelBtn.addEventListener("click", () => {
  modalOverlay.classList.remove("active")
  materialForm.reset()
  selectDisplay.textContent = "Selecciona una categoría"
  selectDisplay.className = "select-placeholder"
  categoryInput.value = ""
  document.querySelectorAll(".select-option").forEach((opt) => opt.classList.remove("selected"))
  quantityInput.value = "0"
})

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove("active")
    materialForm.reset()
    selectDisplay.textContent = "Selecciona una categoría"
    selectDisplay.className = "select-placeholder"
    categoryInput.value = ""
    document.querySelectorAll(".select-option").forEach((opt) => opt.classList.remove("selected"))
    quantityInput.value = "0"
  }
})

selectTrigger.addEventListener("click", (e) => {
  e.stopPropagation()
  selectTrigger.classList.toggle("active")
  selectOptions.classList.toggle("active")
})

document.addEventListener("click", () => {
  selectTrigger.classList.remove("active")
  selectOptions.classList.remove("active")
})

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault()

  if (materialForm.checkValidity()) {
    const materialCode = document.getElementById("materialCode").value
    const materialName = document.getElementById("description").value
    const categoryId = categoryInput.value

    if (!categoryId) {
      alert("Por favor selecciona una categoría")
      return
    }

    try {
      console.log("[v0] Enviando material:", {
        id_materiales: materialCode,
        nombre: materialName,
        categoria_id_categoria: Number.parseInt(categoryId),
      })

      const response = await fetch("http://localhost:3000/materiales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_materiales: materialCode,
          nombre: materialName,
          categoria_id_categoria: Number.parseInt(categoryId),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al agregar material")
      }

      console.log("[v0] Material agregado exitosamente")
      alert("Material agregado exitosamente")

      await cargarMateriales()

      modalOverlay.classList.remove("active")
      materialForm.reset()
      selectDisplay.textContent = "Selecciona una categoría"
      selectDisplay.className = "select-placeholder"
      categoryInput.value = ""
      document.querySelectorAll(".select-option").forEach((opt) => opt.classList.remove("selected"))
      quantityInput.value = "0"
    } catch (error) {
      console.error("[v0] Error al agregar material:", error)
      alert(error.message || "Error al agregar el material")
    }
  } else {
    alert("Por favor completa todos los campos requeridos")
  }
})

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[v0] Inicializando página de materiales...")
  console.log("[v0] URL actual:", window.location.href)

  mostrarAdminLogueado()

  console.log("[v0] Cargando categorías y materiales...")
  await cargarCategorias()
  await cargarMateriales()

  console.log("[v0] Inicialización completa")
})
