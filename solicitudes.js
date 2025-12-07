//const { default: Swal } = require("sweetalert2")
// 🔐 1. Bloquear acceso si no hay sesión (no permite volver atrás)
if (!localStorage.getItem("adminLogueado")) {
  window.location.replace("index.html");
}

// 🔒 2. Evitar regresar con flecha ← durante la sesión
history.pushState(null, null, location.href);
window.onpopstate = function () {
  history.go(1);
};

let adminLogueado = null
let solicitudes = []

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

        let rolTexto = "Administrador del sistema"
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

// Convertir UUID a número resumido (primeros 3 caracteres hexadecimales)
function convertirUUIDaNumero(uuid) {
  const primeros3 = uuid.replace(/-/g, '').substring(0, 3);
  return parseInt(primeros3, 16);
}

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
        docente: item.docente || "Sin docente asignado",  // ← NUEVO
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
        docente: item.docente || "Sin docente asignado",  // ← NUEVO
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
            <div style="font-size: 0.75rem; color: #999; margin-bottom: 0.5rem;">
  Vale: <strong>${solicitud.id}</strong>
</div>

<p style="font-size: 0.85rem; color: #666; margin-bottom: 0.5rem;">${solicitud.nombreAlumno}</p>
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
            <span class="detail-label">Hora de material solicitado:</span>
            <span class="detail-value">${solicitud.hora}</span>
          </div>
        

          <div class="detail-item">
            <span class="detail-label">Motivo:</span>
            <span class="detail-value">${solicitud.motivo}</span>
          </div>
<div class="detail-item">
  <span class="detail-label">Docente:</span>
  <span class="detail-value">${solicitud.docente}</span>
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
            <div style="font-size: 0.75rem; color: #999; margin-bottom: 0.5rem;">
  Vale: <strong>${solicitud.id}</strong>
</div>
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
            <span class="detail-label">Hora de material solicitado:</span>
            <span class="detail-value">${solicitud.hora}</span>
          </div>
          <div class="detail-item">
    <span class="detail-label">Hora de devolución:</span>
    <span class="detail-value">${solicitud.hora_devolucion ?? "—"}</span>
</div>

          <div class="detail-item">
            <span class="detail-label">Motivo:</span>
            <span class="detail-value">${solicitud.motivo}</span>
          </div>
          
<div class="detail-item">
  <span class="detail-label">Docente:</span>
  <span class="detail-value">${solicitud.docente}</span>
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
  // Confirmación con Swal
  const confirmacion = await Swal.fire({
    title: "¿Aprobar solicitud?",
    text: "Se restarán los materiales del inventario.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, aprobar",
    cancelButtonText: "Cancelar"
  });

  // Si da cancelar, no hace nada
  if (!confirmacion.isConfirmed) return;

  try {
    console.log("[v0] Aprobando solicitud con ID:", id);

    if (!id || id.trim() === "") {
      throw new Error("ID de solicitud inválido");
    }

    const url = `http://localhost:3000/solicitudes-prestamo/${id}/aprobar`;
    console.log("[v0] URL de solicitud:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    console.log("[v0] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[v0] Error response:", errorText);
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log("[v0] Respuesta del servidor:", result);

    if (result.success) {
      // Mensaje bonito de aprobación
      await Swal.fire({
        icon: "success",
        title: "Solicitud aprobada",
        html: `
          ✓ Materiales restados correctamente<br>
          Estado actualizado a <b>E02</b>
        `,
        timer: 1500,
        showConfirmButton: false
      });

      await cargarSolicitudes();

    } else {
      Swal.fire({
        icon: "error",
        title: "Error al aprobar",
        text: result.error || "Error desconocido"
      });
    }

  } catch (error) {
    console.error("[v0] Error al aprobar solicitud:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message
    });
  }
}


async function rechazarSolicitud(id) {
  // Confirmación con Swal
  const confirmacion = await Swal.fire({
    title: "¿Rechazar solicitud?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, rechazar",
    cancelButtonText: "Cancelar"
  });

  // Si cancela, salir
  if (!confirmacion.isConfirmed) return;

  try {
    console.log("[v0] Rechazando solicitud con ID:", id);

    if (!id || id.trim() === "") {
      throw new Error("ID de solicitud inválido");
    }

    const url = `http://localhost:3000/solicitudes-prestamo/${id}/rechazar`;
    console.log("[v0] URL de solicitud:", url);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    console.log("[v0] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[v0] Error response:", errorText);
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log("[v0] Respuesta del servidor:", result);

    if (result.success) {
      await Swal.fire({
        icon: "success",
        title: "Solicitud rechazada",
        html: "Estado actualizado a <b>E03</b>",
        timer: 1500,
        showConfirmButton: false
      });

      await cargarSolicitudes();

    } else {
      Swal.fire({
        icon: "error",
        title: "Error al rechazar",
        text: result.error || "Error desconocido"
      });
    }

  } catch (error) {
    console.error("[v0] Error al rechazar solicitud:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message
    });
  }
}


async function finalizarSolicitud(id) {
  const confirmar = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción finalizará la solicitud.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, finalizar",
    cancelButtonText: "Cancelar",
  });

  if (confirmar.isConfirmed) {
    try {
      console.log("[v0] Finalizando solicitud con ID:", id);

      if (!id || id.trim() === "") {
        throw new Error("ID de solicitud inválido");
      }

      const url = `http://localhost:3000/solicitudes-prestamo/${id}/finalizar`;
      console.log("[v0] URL de solicitud:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      console.log("[v0] Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[v0] Error response:", errorText);
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("[v0] Respuesta del servidor:", result);

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "Solicitud finalizada exitosamente",
        });

        await cargarSolicitudes();

      } else {
        Swal.fire({
          icon: "error",
          title: "Error al finalizar la solicitud",
          text: result.error || "Error desconocido",
        });
      }

    } catch (error) {
      console.error("[v0] Error al finalizar solicitud:", error);

      Swal.fire({
        icon: "error",
        title: "Error al finalizar la solicitud",
        text: error.message,
      });
    }
  }
}


// <CHANGE> Event listener para cargar solicitudes cuando se carga el DOM
document.addEventListener("DOMContentLoaded", function() {
  console.log("[v0] DOM cargado, iniciando solicitudes...")
  mostrarAdminLogueado()
  // <CHANGE> Mostrar nombre del usuario logeado
  const usuarioNombre = localStorage.getItem('usuarioNombre');
  if (usuarioNombre) {
    const nombreElement = document.getElementById('nombreUsuario');
    if (nombreElement) {
      nombreElement.textContent = usuarioNombre;
    }
  }
  
  cargarSolicitudes()
})

function cerrarSesion() {
  Swal.fire({
    title: "¿Cerrar sesión?",
    text: "Tendrás que iniciar sesión de nuevo para entrar.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, salir",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {

      // 1️⃣ Borrar todo lo relacionado a la sesión
      localStorage.clear();
      sessionStorage.clear();

      // 2️⃣ Prevenir que vuelva con las flechas
      history.pushState(null, null, location.href);
      window.onpopstate = function () {
        history.go(1);
      };

      // 3️⃣ Redirigir al login o página principal
      window.location.href = "index.html";
    }
  });
}
