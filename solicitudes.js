let solicitudes = []

async function cargarSolicitudes() {
  try {
    console.log("[v0 Frontend] ========================================")
    console.log("[v0 Frontend] Iniciando carga de solicitudes...")
    console.log("[v0 Frontend] URL del servidor: http://localhost:3000/solicitudes-prestamo")

    const response = await fetch("http://localhost:3000/solicitudes-prestamo")

    console.log("[v0 Frontend] Response status:", response.status)
    console.log("[v0 Frontend] Response ok:", response.ok)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0 Frontend] Datos recibidos del servidor:", data)
    console.log("[v0 Frontend] Cantidad de registros:", data.length)

    if (data.length === 0) {
      console.log("[v0 Frontend] ⚠️ No hay solicitudes pendientes en la base de datos")
    }

    solicitudes = data.map((item, index) => {
      console.log(`[v0 Frontend] Procesando solicitud ${index + 1}:`, item)

      // Parsear hora correctamente
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
      console.log(`[v0 Frontend] Material detectado:`, materialName)

      return {
        id: item.id_vales,
        nombreAlumno: item.nombre || "Sin nombre",
        noControl: item.id_usuario || "N/A",
        materialSolicitado: materialName,
        cantidad: `${item.cantidad || 0} unidades`,
        hora: horaFormateada,
        motivo: item.motivo || "Sin motivo especificado",
        estado: "Pendiente",
      }
    })

    console.log("[v0 Frontend] Solicitudes mapeadas:", solicitudes)
    console.log("[v0 Frontend] ========================================")

    renderSolicitudes()
  } catch (error) {
    console.error("[v0 Frontend] ❌ ERROR al cargar solicitudes:", error)
    console.error("[v0 Frontend] Mensaje:", error.message)
    console.error("[v0 Frontend] Stack:", error.stack)
    alert("Error al cargar las solicitudes: " + error.message)
  }
}

function renderSolicitudes() {
  console.log("[v0 Frontend] Renderizando solicitudes...")
  const container = document.getElementById("solicitudesContainer")
  const pendingCount = document.getElementById("pendingCount")

  if (!container) {
    console.error("[v0 Frontend] ❌ No se encontró el elemento 'solicitudesContainer'")
    return
  }

  if (!pendingCount) {
    console.error("[v0 Frontend] ❌ No se encontró el elemento 'pendingCount'")
    return
  }

  const pendingSolicitudes = solicitudes.filter((s) => s.estado === "pendiente" || s.estado === "Pendiente")
  console.log("[v0 Frontend] Solicitudes pendientes filtradas:", pendingSolicitudes.length)

  if (pendingSolicitudes.length === 0) {
    console.log("[v0 Frontend] Mostrando estado vacío")
    container.innerHTML = ` 
 <div class="empty-state"> 
 <h3>No hay solicitudes pendientes</h3> 
 <p>Todas las solicitudes han sido procesadas</p> 
 </div> 
 `
    pendingCount.textContent = "0 solicitudes esperando aprobación"
    return
  }

  pendingCount.textContent = `${pendingSolicitudes.length} solicitudes esperando aprobación`
  console.log("[v0 Frontend] Generando HTML para", pendingSolicitudes.length, "solicitudes")

  container.innerHTML = pendingSolicitudes
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

  attachButtonEventListeners()

  console.log("[v0 Frontend] Renderizado completado")
}

function attachButtonEventListeners() {
  document.querySelectorAll(".btn-aprobar").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault()
      const id = this.getAttribute("data-id")
      aprobarSolicitud(id)
    })
  })

  document.querySelectorAll(".btn-rechazar").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault()
      const id = this.getAttribute("data-id")
      rechazarSolicitud(id)
    })
  })
}

async function aprobarSolicitud(id) {
  if (confirm("¿Estás seguro de que deseas aprobar esta solicitud?")) {
    try {
      console.log("[v0] Aprobando solicitud:", id)

      if (!id || id.trim() === "") {
        throw new Error("ID de solicitud inválido")
      }

      const response = await fetch(`http://localhost:3000/solicitudes-prestamo/${id}/aprobar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Respuesta del servidor:", result)

      if (result.success) {
        alert("Solicitud aprobada exitosamente")
        await cargarSolicitudes()
      } else {
        alert("Error al aprobar la solicitud: " + (result.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("[v0] Error al aprobar solicitud:", error)
      alert("Error al aprobar la solicitud: " + error.message)
    }
  }
}

async function rechazarSolicitud(id) {
  if (confirm("¿Estás seguro de que deseas rechazar esta solicitud?")) {
    try {
      console.log("[v0] Rechazando solicitud:", id)

      if (!id || id.trim() === "") {
        throw new Error("ID de solicitud inválido")
      }

      const response = await fetch(`http://localhost:3000/solicitudes-prestamo/${id}/rechazar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] Respuesta del servidor:", result)

      if (result.success) {
        alert("Solicitud rechazada")
        await cargarSolicitudes()
      } else {
        alert("Error al rechazar la solicitud: " + (result.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("[v0] Error al rechazar solicitud:", error)
      alert("Error al rechazar la solicitud: " + error.message)
    }
  }
}

document.addEventListener("DOMContentLoaded", cargarSolicitudes)
