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
  event.preventDefault();

const materialId = document.getElementById("materialCode").value; // toma el código real
  const quantity = parseInt(document.getElementById("materialQuantity").value);

  if (!materialName) {
    alert("Selecciona un material");
    return;
  }

  if (isNaN(quantity) || quantity <= 0) {
    alert("La cantidad debe ser mayor que 0");
    return;
  }

  try {
const response = await fetch(`http://localhost:3000/materiales/${encodeURIComponent(materialId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad: quantity }),
    });

    if (!response.ok) {
  const text = await response.text(); // lee texto, no JSON
  throw new Error(text || `Error HTTP: ${response.status}`);
}

const data = await response.json();
alert("Cantidad actualizada correctamente");


    // Refresca lista en pantalla si tienes una función que la recarga
    await cargarMateriales();

  } catch (error) {
    console.error("Error al agregar cantidad:", error);
    alert("Error al agregar cantidad: " + error.message);
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
      const categoria = material.categoria || "Sin categoría"

      return `
        <div class="material-card">
          <div class="material-info">
            <div class="material-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20 7l-8-4-8 4v10l8 4 8-4V7z"></path>
              </svg>
            </div>
            <div class="material-details">
              <h3>${material.nombre || "Sin nombre"}</h3>
              <p style="color:#777; margin:0.3rem 0;">
                <strong>Categoría:</strong> ${categoria}
              </p>
            </div>
          </div>

          <div class="material-stats">
            <div class="stat-item">
              <div class="stat-label">Disponibles</div>
              <div class="stat-value disponibles" id="disponibles_${nombreSanitizado}">
                ${disponibles}
              </div>
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


async function cargarMaterialesSelect() {
  try {
    const response = await fetch("http://localhost:3000/materiales");
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const materiales = await response.json();
    console.log("[v0] Materiales para select:", materiales);

    const select = document.getElementById("materialName");
    if (!select) return;

    // Limpiar opciones previas
    select.innerHTML = '<option value="">Selecciona un material</option>';

    materiales.forEach((mat) => {
      const option = document.createElement("option");
      option.value = mat.id_materiales; // el código del material
      option.textContent = mat.nombre;
      option.dataset.categoria = mat.categoria; // guardamos descripción
      select.appendChild(option);
    });

    // Guardar materiales en memoria para búsquedas rápidas
    window.materialesData = materiales;
  } catch (error) {
    console.error("[v0] Error al cargar materiales en select:", error);
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  console.log("[v0] Inicializando página de gestión de materiales...");
  mostrarFechaActual();
  mostrarAdminLogueado();
  await cargarMateriales();
  await cargarMaterialesSelect(); // 👈 nuevo

  const form = document.getElementById("addMaterialForm");
  if (form) form.addEventListener("submit", handleAddMaterial);

  // 👇 Autocompletar campos al seleccionar material
  const materialSelect = document.getElementById("materialName");
  if (materialSelect) {
    materialSelect.addEventListener("change", (e) => {
      const selectedId = e.target.value;
      const material = window.materialesData?.find((m) => m.id_materiales === selectedId);

      if (material) {
        document.getElementById("materialCode").value = material.id_materiales;
        document.getElementById("materialCategory").value = material.categoria;
      } else {
        document.getElementById("materialCode").value = "";
        document.getElementById("materialCategory").value = "";
      }
    });
  }

  console.log("[v0] Inicialización completa");
});

