let adminLogueado = null

function mostrarFechaActual() {
  const fechaElement = document.getElementById("currentDate")
  const hoy = new Date()
  const opciones = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  const fechaFormato = hoy.toLocaleDateString("es-ES", opciones)
  if (fechaElement) {
    fechaElement.textContent = fechaFormato
  }
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

function cerrarSesion() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("usuario")
    localStorage.clear()
    window.location.href = "index.html"
  }
}

async function cargarCategorias() {
  try {
    console.log("[v0] Cargando categorías...")
    const response = await fetch("http://localhost:3000/categorias")

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const categorias = await response.json()
    console.log("[v0] Categorías cargadas:", categorias)

    const selectElement = document.getElementById("materialCategory")
    if (selectElement) {
      categorias.forEach((cat) => {
        const option = document.createElement("option")
        option.value = cat.id_categoria
        option.textContent = cat.descripcion
        selectElement.appendChild(option)
      })
    }
  } catch (error) {
    console.error("[v0] Error al cargar categorías:", error)
  }
}

async function handleAddMaterial(event) {
  event.preventDefault()

  const code = document.getElementById("materialCode").value
  const name = document.getElementById("materialName").value
  const category = document.getElementById("materialCategory").value
  const quantity = document.getElementById("materialQuantity").value

  try {
    console.log("[v0] Enviando nuevo material:", { code, name, category, quantity })

    const response = await fetch("http://localhost:3000/materiales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_materiales: code,
        nombre: name,
        categoria_id_categoria: category,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al crear material")
    }

    console.log("[v0] Material creado exitosamente")

    if (Number.parseInt(quantity) > 0) {
      await agregarCantidad(name, Number.parseInt(quantity))
    }

    // Reset form and reload materials
    document.getElementById("addMaterialForm").reset()
    await cargarMateriales()
    alert("Material agregado correctamente")
  } catch (error) {
    console.error("[v0] Error al agregar material:", error)
    alert("Error al agregar material: " + error.message)
  }
}

async function cargarMateriales() {
  const lista = document.getElementById("materialsList")

  if (lista) {
    lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Cargando materiales...</p>'
  }

  try {
    console.log("[v0] Cargando materiales desde la BD...")

    const response = await fetch("http://localhost:3000/materiales")
    console.log("[v0] Respuesta del servidor - Status:", response.status)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const materiales = await response.json()
    console.log("[v0] Materiales cargados:", materiales)

    renderizarMateriales(materiales)
  } catch (error) {
    console.error("[v0] Error al cargar materiales:", error)

    if (lista) {
      lista.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #e74c3c;">
                    <h3>Error al cargar materiales</h3>
                    <p>${error.message}</p>
                    <button onclick="cargarMateriales()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Reintentar
                    </button>
                </div>
            `
    }
  }
}

function renderizarMateriales(materiales) {
  const lista = document.getElementById("materialsList")

  if (!lista) {
    console.error("[v0] No se encontró el contenedor materialsList")
    return
  }

  if (materiales.length === 0) {
    lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay materiales registrados</p>'
    return
  }

  lista.innerHTML = materiales
    .map((material) => {
      const disponibles = Number(material.cantidad_disponible) || 0
      const danados = Number(material.cantidad_daniados) || 0
      const nombreSanitizado = material.nombre.replace(/[^a-zA-Z0-9]/g, "_")

      return `
                <div class="material-card">
                    <div class="material-info">
                        <div class="material-icon">
                            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                        </div>
                        <div class="material-details">
                            <h3>${material.nombre || "Sin nombre"}</h3>
                            <p>${material.descripcion || "Sin categoría"}</p>
                        </div>
                    </div>
                    <div class="material-stats">
                        <div class="stat-item">
                            <div class="stat-label">Disponibles</div>
                            <div class="stat-value disponibles" id="disponibles_${nombreSanitizado}">${disponibles}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Dañados</div>
                            <div class="stat-value danados">${danados}</div>
                        </div>
                    </div>
                   
                </div>
            `
    })
    .join("")

  console.log("[v0] Materiales renderizados exitosamente:", materiales.length)
}

async function agregarCantidad(nombreMaterial, cantidadPredefinida = 0) {
  try {
    const nombreSanitizado = nombreMaterial.replace(/[^a-zA-Z0-9]/g, "_")
    const inputId = `input_${nombreSanitizado}`
    const inputElement = document.getElementById(inputId)

    if (!inputElement) {
      console.error("[v0] No se encontró el input:", inputId)
      alert("Error: No se encontró el campo de cantidad")
      return
    }

    const cantidadAgregar = cantidadPredefinida || Number.parseInt(inputElement.value) || 0

    console.log("[v0] Agregando cantidad:", cantidadAgregar, "al material:", nombreMaterial)

    if (cantidadAgregar < 1) {
      alert("Por favor ingresa una cantidad válida mayor a 0")
      return
    }

    console.log("[v0] Enviando PUT a:", `http://localhost:3000/materiales/${encodeURIComponent(nombreMaterial)}`)

    const response = await fetch(`http://localhost:3000/materiales/${encodeURIComponent(nombreMaterial)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cantidad: cantidadAgregar,
      }),
    })

    console.log("[v0] Respuesta del servidor - Status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Error del servidor:", errorData)
      throw new Error(errorData.error || "Error al actualizar material")
    }

    const result = await response.json()
    console.log("[v0] Material actualizado exitosamente:", result)

    const displayId = `disponibles_${nombreSanitizado}`
    const displayElement = document.getElementById(displayId)
    if (displayElement) {
      displayElement.textContent = result.nuevaCantidad
      console.log("[v0] Vista actualizada con nueva cantidad:", result.nuevaCantidad)
    }

    inputElement.value = 0

    if (cantidadPredefinida === 0) {
      alert("Cantidad agregada exitosamente")
    }
  } catch (error) {
    console.error("[v0] Error al agregar cantidad:", error)
    alert("Error al actualizar la cantidad: " + error.message)
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[v0] Inicializando página de gestión de materiales...")
  mostrarFechaActual()
  mostrarAdminLogueado()
  await cargarCategorias()
  await cargarMateriales()

  const form = document.getElementById("addMaterialForm")
  if (form) {
    form.addEventListener("submit", handleAddMaterial)
  }

  console.log("[v0] Inicialización completa")
})
