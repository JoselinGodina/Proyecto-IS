let solicitudes = []

async function cargarSolicitudes() {
  try {
    console.log("[v0 Frontend] ========================================")
    console.log("[v0 Frontend] Iniciando carga de solicitudes...")

    // Cargar solicitudes pendientes (E01) y devueltas (E04)
    const [responsePendientes, responseDevueltas] = await Promise.all([
      fetch("http://localhost:3000/solicitudes-prestamo?estado=E01"),
      fetch("http://localhost:3000/solicitudes-prestamo?estado=E04"),
    ])

    if (!responsePendientes.ok || !responseDevueltas.ok) {
      throw new Error(`Error HTTP`)
    }

    const dataPendientes = await responsePendientes.json()
    const dataDevueltas = await responseDevueltas.json()

    console.log("[v0 Frontend] Solicitudes pendientes:", dataPendientes.length)
    console.log("[v0 Frontend] Solicitudes devueltas:", dataDevueltas.length)

    // Mapear solicitudes pendientes
    solicitudes = dataPendientes.map((item, index) => {
      let horaFormateada = "N/A"
      if (item.hora_entrega) {
        const fecha = new Date(item.hora_entrega)
        if (!isNaN(fecha.getTime())) {
          horaFormateada = fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
        } else {
          horaFormateada = item.hora_entrega
        }
      }

      const materialName = item.nombre_material || "Sin especificar"

      return {
        id: item.id_vales,
        nombreAlumno: item.nombre || "Sin nombre",
        noControl: item.id_usuario || "N/A",
        materialSolicitado: materialName,
        cantidad: `${item.cantidad || 0} unidades`,
        hora: horaFormateada,
        motivo: item.motivo || "Sin motivo especificado",
        estado: "Pendiente",
        tipo: "pendiente",
      }
    })

    // Mapear solicitudes devueltas
    const solicitudesDevueltas = dataDevueltas.map((item, index) => {
      let horaFormateada = "N/A"
      if (item.hora_entrega) {
        const fecha = new Date(item.hora_entrega)
        if (!isNaN(fecha.getTime())) {
          horaFormateada = fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
        } else {
          horaFormateada = item.hora_entrega
        }
      }

      const materialName = item.nombre_material || "Sin especificar"

      return {
        id: item.id_vales,
        nombreAlumno: item.nombre || "Sin nombre",
        noControl: item.id_usuario || "N/A",
        materialSolicitado: materialName,
        cantidad: `${item.cantidad || 0} unidades`,
        hora: horaFormateada,
        motivo: item.motivo || "Sin motivo especificado",
        estado: "Devuelto",
        tipo: "devuelto",
      }
    })

    solicitudes = [...solicitudes, ...solicitudesDevueltas]

    console.log("[v0 Frontend] ========================================")
    renderSolicitudes()
  } catch (error) {
    console.error("[v0 Frontend] ❌ ERROR al cargar solicitudes:", error)
    alert("Error al cargar las solicitudes: " + error.message)
  }
}

function renderSolicitudes() {
  console.log("[v0 Frontend] Renderizando solicitudes...")
  const containerPendientes = document.getElementById("solicitudesContainer")
  const containerDevueltos = document.getElementById("solicitudesDevueltasContainer")
  const pendingCount = document.getElementById("pendingCount")
  const devueltosCount = document.getElementById("devueltosCount")

  const pendingSolicitudes = solicitudes.filter((s) => s.tipo === "pendiente")
  const devueltasSolicitudes = solicitudes.filter((s) => s.tipo === "devuelto")

  // Renderizar pendientes
  if (pendingSolicitudes.length === 0) {
    containerPendientes.innerHTML = `
      <div class="empty-state">
        <h3>No hay solicitudes pendientes</h3>
        <p>Todas las solicitudes han sido procesadas</p>
      </div>
    `
    pendingCount.textContent = "0 solicitudes esperando aprobación"
  } else {
    pendingCount.textContent = `${pendingSolicitudes.length} solicitudes esperando aprobación`
    containerPendientes.innerHTML = pendingSolicitudes
      .map(
        (solicitud) => `
      <div class="solicitud-card">
        <div class="solicitud-header">
          <div class="solicitud-title">
            <h4>${solicitud.nombreAlumno}</h4>
            <span class="badge badge-pendiente">${solicitud.estado}</span>
          </div>
          <div class="solicitud-actions">
            <button class="btn-aprobar" data-id="${solicitud.id}">Aprobar</button>
            <button class="btn-rechazar" data-id="${solicitud.id}">Rechazar</button>
          </div>
        </div>
        <div class="solicitud-details">
          <div class="detail-item">
            <span class="detail-label">No. Control:</span>
            <span class="detail-value">${solicitud.noControl}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Cantidad:</span>
            <span class="detail-value">${solicitud.cantidad}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Material solicitado:</span>
            <span class="detail-value">${solicitud.materialSolicitado}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Hora:</span>
            <span class="detail-value">${solicitud.hora}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Motivo:</span>
            <span class="detail-value">${solicitud.motivo}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  // Renderizar devueltos
  if (devueltasSolicitudes.length === 0) {
    containerDevueltos.innerHTML = `
      <div class="empty-state">
        <h3>No hay solicitudes devueltas</h3>
        <p>No hay material para finalizar</p>
      </div>
    `
    devueltosCount.textContent = "0 solicitudes devueltas"
  } else {
    devueltosCount.textContent = `${devueltasSolicitudes.length} solicitudes devueltas`
    containerDevueltos.innerHTML = devueltasSolicitudes
      .map(
        (solicitud) => `
      <div class="solicitud-card">
        <div class="solicitud-header">
          <div class="solicitud-title">
            <h4>${solicitud.nombreAlumno}</h4>
            <span class="badge badge-devuelto">${solicitud.estado}</span>
          </div>
          <div class="solicitud-actions">
            <button class="btn-finalizar" data-id="${solicitud.id}">Finalizar</button>
          </div>
        </div>
        <div class="solicitud-details">
          <div class="detail-item">
            <span class="detail-label">No. Control:</span>
            <span class="detail-value">${solicitud.noControl}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Cantidad:</span>
            <span class="detail-value">${solicitud.cantidad}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Material solicitado:</span>
            <span class="detail-value">${solicitud.materialSolicitado}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Hora:</span>
            <span class="detail-value">${solicitud.hora}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Motivo:</span>
            <span class="detail-value">${solicitud.motivo}</span>
          </div>
        </div>
      </div>
    `,
      )
      .join("")
  }

  // <CHANGE> Attachment de event listeners DESPUÉS de renderizar el DOM
  attachButtonEventListeners()
}

function attachButtonEventListeners() {
  console.log("[v0] Attachando event listeners...")
  
  // <CHANGE> Agregados eventos para los botones de Aprobar
  document.querySelectorAll(".btn-aprobar").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault()
      e.stopPropagation()
      const id = this.getAttribute("data-id")
      console.log("[v0] Click en Aprobar con ID:", id)
      aprobarSolicitud(id)
    })
  })

  // <CHANGE> Agregados eventos para los botones de Rechazar
  document.querySelectorAll(".btn-rechazar").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault()
      e.stopPropagation()
      const id = this.getAttribute("data-id")
      console.log("[v0] Click en Rechazar con ID:", id)
      rechazarSolicitud(id)
    })
  })

  document.querySelectorAll(".btn-finalizar").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault()
      e.stopPropagation()
      const id = this.getAttribute("data-id")
      console.log("[v0] Click en Finalizar con ID:", id)
      finalizarSolicitud(id)
    })
  })
  
  console.log("[v0] Event listeners anexados correctamente")
}

async function aprobarSolicitud(id) {
  if (confirm("¿Estás seguro de que deseas aprobar esta solicitud?")) {
    try {
      console.log("[v0] Aprobando solicitud con ID:", id)

      if (!id || id.trim() === "") {
        throw new Error("ID de solicitud inválido")
      }

      const url = `http://localhost:3000/solicitudes-prestamo/${id}/aprobar`
      console.log("[v0] URL de solicitud:", url)

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Error response:", errorText)
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Respuesta del servidor:", result)

      if (result.success) {
        alert("✓ Solicitud aprobada exitosamente\n- Materiales restados correctamente\n- Estado: E02")
        await cargarSolicitudes()
      } else {
        alert("❌ Error al aprobar la solicitud: " + (result.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("[v0] Error al aprobar solicitud:", error)
      alert("❌ Error al aprobar la solicitud: " + error.message)
    }
  }
}

async function rechazarSolicitud(id) {
  if (confirm("¿Estás seguro de que deseas rechazar esta solicitud?")) {
    try {
      console.log("[v0] Rechazando solicitud con ID:", id)

      if (!id || id.trim() === "") {
        throw new Error("ID de solicitud inválido")
      }

      const url = `http://localhost:3000/solicitudes-prestamo/${id}/rechazar`
      console.log("[v0] URL de solicitud:", url)

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Error response:", errorText)
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Respuesta del servidor:", result)

      if (result.success) {
        alert("✓ Solicitud rechazada\n- Estado: E03")
        await cargarSolicitudes()
      } else {
        alert("❌ Error al rechazar la solicitud: " + (result.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("[v0] Error al rechazar solicitud:", error)
      alert("❌ Error al rechazar la solicitud: " + error.message)
    }
  }
}

async function finalizarSolicitud(id) {
  if (confirm("¿Estás seguro de que deseas finalizar esta solicitud?")) {
    try {
      console.log("[v0] Finalizando solicitud con ID:", id)

      if (!id || id.trim() === "") {
        throw new Error("ID de solicitud inválido")
      }

      const url = `http://localhost:3000/solicitudes-prestamo/${id}/finalizar`
      console.log("[v0] URL de solicitud:", url)

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Error response:", errorText)
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Respuesta del servidor:", result)

      if (result.success) {
        alert("✓ Solicitud finalizada exitosamente")
        await cargarSolicitudes()
      } else {
        alert("❌ Error al finalizar la solicitud: " + (result.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("[v0] Error al finalizar solicitud:", error)
      alert("❌ Error al finalizar la solicitud: " + error.message)
    }
  }
}

// <CHANGE> Event listener para cargar solicitudes cuando se carga el DOM
document.addEventListener("DOMContentLoaded", function() {
  console.log("[v0] DOM cargado, iniciando solicitudes...")
  cargarSolicitudes()
})