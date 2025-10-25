let adminLogueado = null

window.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Cargando página de pedido de materiales...")
  cargarUsuarioLogueado()
  cargarMateriales()
})

function cargarUsuarioLogueado() {
  try {
    const usuarioStr = localStorage.getItem("usuario")
    console.log("[v0] Usuario en localStorage:", usuarioStr)

    if (usuarioStr) {
      adminLogueado = JSON.parse(usuarioStr)
      mostrarAdminLogueado()
    } else {
      console.warn("[v0] No hay usuario en localStorage")
      // Redirigir al login si no hay sesión
      window.location.href = "index.html"
    }
  } catch (error) {
    console.error("[v0] Error al cargar usuario:", error)
  }
}

function mostrarAdminLogueado() {
  if (!adminLogueado) return

  const nombreCompleto = `${adminLogueado.nombres} ${adminLogueado.apellidos}`
  const codigoUsuario = adminLogueado.id_usuario

  // Actualizar el nombre en el header
  const adminDetailsDiv = document.querySelector(".admin-details")
  if (adminDetailsDiv) {
    adminDetailsDiv.innerHTML = `
            <h3>${nombreCompleto}</h3>
            <p>${codigoUsuario} - Administrador del Sistema</p>
        `
  }

  console.log("[v0] Usuario mostrado en header:", nombreCompleto)
}

async function cargarMateriales() {
  const lista = document.getElementById("materialsList")

  if (lista) {
    lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Cargando materiales...</p>'
  }

  try {
    console.log("[v0] Cargando materiales desde la BD...")
    console.log("[v0] URL del servidor: http://localhost:3000/materiales")

    const response = await fetch("http://localhost:3000/materiales")
    console.log("[v0] Respuesta del servidor - Status:", response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
    }

    const materiales = await response.json()
    console.log("[v0] Materiales cargados:", materiales)
    console.log("[v0] Cantidad de materiales:", materiales.length)

    if (materiales.length === 0) {
      console.warn("[v0] No hay materiales en la base de datos")
    }

    renderizarMateriales(materiales)
  } catch (error) {
    console.error("[v0] Error al cargar materiales:", error)
    console.error("[v0] Tipo de error:", error.name)
    console.error("[v0] Mensaje de error:", error.message)

    if (lista) {
      lista.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #e74c3c;">
          <h3>Error al cargar materiales</h3>
          <p>${error.message}</p>
          <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
            Verifica que el servidor esté corriendo en http://localhost:3000
          </p>
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
    lista.innerHTML =
      '<p style="text-align: center; color: #666; padding: 2rem;">No hay materiales registrados en la base de datos</p>'
    return
  }

  lista.innerHTML = materiales
    .map((material) => {
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
                    <h3>${material.nombre}</h3>
                    <p>${material.descripcion}</p>
                </div>
            </div>
            <div class="material-stats">
                <div class="stat-item">
                    <div class="stat-label">Cantidad</div>
                    <div class="stat-value" id="disponibles_${nombreSanitizado}">${material.cantidad_disponible}</div>
                </div>
            </div>
            <div class="quantity-controls">
                <input type="number" class="quantity-input" id="input_${nombreSanitizado}" value="0" min="1" placeholder="1">
                <button class="add-btn" onclick="agregarCantidad('${material.nombre.replace(/'/g, "\\'")}')">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Agregar
                </button>
            </div>
        </div>
    `
    })
    .join("")

  console.log("[v0] Materiales renderizados exitosamente:", materiales.length)
}

async function agregarCantidad(nombreMaterial) {
  try {
    const nombreSanitizado = nombreMaterial.replace(/[^a-zA-Z0-9]/g, "_")
    const inputId = `input_${nombreSanitizado}`
    const inputElement = document.getElementById(inputId)

    if (!inputElement) {
      console.error("[v0] No se encontró el input:", inputId)
      alert("Error: No se encontró el campo de cantidad")
      return
    }

    const cantidadAgregar = Number.parseInt(inputElement.value) || 0

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
    } else {
      console.error("[v0] No se encontró el elemento de display:", displayId)
    }

    // Resetear input
    inputElement.value = 0

    mostrarMensajeExito()
  } catch (error) {
    console.error("[v0] Error al agregar cantidad:", error)
    alert("Error al actualizar la cantidad: " + error.message)
  }
}

function mostrarMensajeExito() {
  const mensaje = document.getElementById("successMessage")
  if (mensaje) {
    mensaje.classList.add("show")
    setTimeout(() => {
      mensaje.classList.remove("show")
    }, 3000)
  }
}

function cerrarSesion() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("usuario")
    localStorage.removeItem("userRole")
    window.location.href = "index.html"
  }
}
