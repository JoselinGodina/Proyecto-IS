let adminLogueado = null
let materialEditando = null
let cantidadDanados = 0
let cantidadDisponibles = 0
let categorias = []

window.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Cargando página de inventario...")
  cargarUsuarioLogueado()
  cargarCategorias()
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

  const adminDetailsDiv = document.querySelector(".admin-details")
  if (adminDetailsDiv) {
    adminDetailsDiv.innerHTML = `
      <h3>${nombreCompleto}</h3>
      <p>${codigoUsuario} - Administrador del Sistema</p>
    `
  }

  console.log("[v0] Usuario mostrado en header:", nombreCompleto)
}

//Categorías 

document.addEventListener("DOMContentLoaded", async () => {
  await cargarCategorias();
  await cargarMateriales();

  document
    .getElementById("filtroCategoria")
    .addEventListener("change", filtrarMateriales);
  document
    .getElementById("busquedaNombre")
    .addEventListener("input", filtrarMateriales);
});



async function cargarCategorias() {
  try {
    const res = await fetch("http://localhost:3000/categorias");
    if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

    const categorias = await res.json();
    console.log("Categorías recibidas:", categorias);

    const categoriaSelect = document.getElementById("filtroCategoria");
    categoriaSelect.innerHTML = `
      <option value="">Todas las categorías</option>
    `;

    categorias.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.id_categoria || cat.ID_CATEGORIA || cat.id;
      option.textContent = cat.descripcion || cat.DESCRIPCION;
      categoriaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("[v0] Error al cargar categorías:", error);
  }
}



async function cargarMateriales(categoria = "", nombre = "") {
  const lista = document.getElementById("materialsList");
  lista.innerHTML =
    '<p style="text-align:center; color:#666; padding:2rem;">Cargando materiales...</p>';

  try {
    const res = await fetch("http://localhost:3000/materiales");
    const materiales = await res.json();

    // 🔍 Filtrar
    const filtrados = materiales.filter((mat) => {
      const coincideCategoria =
        !categoria || mat.categoria_id_categoria === categoria;
      const coincideNombre = mat.nombre
        .toLowerCase()
        .includes(nombre.toLowerCase());
      return coincideCategoria && coincideNombre;
    });

    renderizarMateriales(filtrados);
    agregarEventosMateriales();
  } catch (error) {
    console.error("Error al cargar materiales:", error);
    lista.innerHTML =
      '<p style="color:red; text-align:center;">Error al cargar materiales</p>';
  }
}

function renderizarMateriales(materiales) {
  const lista = document.getElementById("materialsList");
  if (materiales.length === 0) {
    lista.innerHTML =
      '<p style="text-align:center; color:#666; padding:2rem;">No hay materiales disponibles</p>';
    return;
  }

  lista.innerHTML = materiales
    .map(
      (mat) => `
      <div class="material-card">
        <h3>${mat.nombre}</h3>
        <p><strong>Categoría:</strong> ${mat.categoria_id_categoria}</p>
        <p><strong>Disponibles:</strong> ${mat.cantidad_disponible}</p>
        <p><strong>Dañados:</strong> ${mat.cantidad_daniada}</p>
        <button class="btn-editar" data-id="${mat.id_materiales}">Editar</button>
      </div>
    `
    )
    .join("");
}

function agregarEventosMateriales() {
  const botonesEditar = document.querySelectorAll(".btn-editar");
  botonesEditar.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      console.log("Seleccionaste el material con ID:", id);
      // aquí puedes llamar tu función abrirModalEditar(id);
    });
  });
}


/////// hasta aqui es lo de categorias

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
      const total = disponibles + danados

      const materialJson = JSON.stringify(material).replace(/'/g, "\\'")

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
              <p>${material.categoria || "Sin categoría"}</p>
            </div>
          </div>
          <div class="material-stats">
            <div class="stat-item">
              <div class="stat-value disponibles">${disponibles} Disponibles</div>
              <div class="stat-label">de ${total} total</div>
            </div>
            <div class="stat-item">
              <div class="stat-value danados">${danados} Dañados</div>
            </div>
          </div>
          <button class="edit-btn" onclick='abrirModalEditar(${materialJson})'>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Editar
          </button>
        </div>
      `
    })
    .join("")

  console.log("[v0] Materiales renderizados exitosamente:", materiales.length)
}

function abrirModalEditar(material) {
  materialEditando = material

  console.log("[v0] Editando material:", materialEditando)

  const nombreInput = document.getElementById("nombreMaterial")
  nombreInput.value = materialEditando.nombre || ""
  nombreInput.disabled = false

  const categoriaInput = document.getElementById("categoria")

  if (categoriaInput.tagName !== "SELECT") {
    const select = document.createElement("select")
    select.id = "categoria"
    select.className = categoriaInput.className
    categoriaInput.parentNode.replaceChild(select, categoriaInput)
  }

  const categoriaSelect = document.getElementById("categoria")
  categoriaSelect.innerHTML = ""
  categoriaSelect.disabled = false

  const defaultOption = document.createElement("option")
  defaultOption.value = ""
  defaultOption.textContent = "Selecciona una categoría"
  defaultOption.disabled = true
  categoriaSelect.appendChild(defaultOption)

  categorias.forEach((cat) => {
    const option = document.createElement("option")
    option.value = cat.id_categoria
    option.textContent = `${cat.id_categoria} - ${cat.descripcion}`

    if (cat.descripcion === materialEditando.descripcion) {
      option.selected = true
    }

    categoriaSelect.appendChild(option)
  })

  cantidadDisponibles = Number(materialEditando.cantidad_disponible) || 0
  cantidadDanados = Number(materialEditando.cantidad_daniados) || 0

  document.getElementById("disponiblesDisplay").textContent = cantidadDisponibles
  document.getElementById("danadosDisplay").textContent = cantidadDanados

  console.log("[v0] Disponibles iniciales:", cantidadDisponibles)
  console.log("[v0] Dañados iniciales:", cantidadDanados)

  document.getElementById("modalOverlay").classList.add("active")
  document.body.style.overflow = "hidden"
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.remove("active")
  document.body.style.overflow = "auto"
  materialEditando = null
  cantidadDanados = 0
  cantidadDisponibles = 0
}

function cerrarModalSiClickFuera(event) {
  if (event.target === event.currentTarget) {
    cerrarModal()
  }
}

function cambiarCantidad(tipo, cambio) {
  if (tipo === "disponibles") {
    const nuevoValor = cantidadDisponibles + cambio
    if (nuevoValor >= 0) {
      cantidadDisponibles = nuevoValor
      document.getElementById("disponiblesDisplay").textContent = cantidadDisponibles
      console.log("[v0] Disponibles actualizados:", cantidadDisponibles)
    }
  } else if (tipo === "danados") {
    const nuevoValor = cantidadDanados + cambio
    if (nuevoValor >= 0) {
      cantidadDanados = nuevoValor
      document.getElementById("danadosDisplay").textContent = cantidadDanados
      console.log("[v0] Dañados actualizados:", cantidadDanados)
    }
  }
}

async function guardarCambios() {
  if (!materialEditando) {
    console.error("[v0] No hay material seleccionado para editar")
    return
  }

  try {
    const nuevoNombre = document.getElementById("nombreMaterial").value.trim()
    const nuevaCategoria = document.getElementById("categoria").value

    if (!nuevoNombre) {
      Swal.fire("El nombre del material no puede estar vacío")
      return
    }

    if (!nuevaCategoria) {
      Swal.fire("Debes seleccionar una categoría")
      return
    }

    console.log("[v0] Guardando cambios...")
    console.log("[v0] Material original:", materialEditando.nombre)
    console.log("[v0] Nuevo nombre:", nuevoNombre)
    console.log("[v0] Nueva categoría:", nuevaCategoria)
    console.log("[v0] Cantidad disponible:", cantidadDisponibles)
    console.log("[v0] Cantidad de dañados:", cantidadDanados)

const response = await fetch(`http://localhost:3000/materiales/editar/${materialEditando.id_materiales}`, {
    //const response = await fetch(`http://localhost:3000/materiales/${encodeURIComponent(materialEditando.nombre)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  nuevoNombre: nuevoNombre,
  categoria_id: nuevaCategoria,
  cantidad_daniados: cantidadDanados,
  cantidad_disponible: cantidadDisponibles,
}),
      // body: JSON.stringify({
      //   nuevoNombre: nuevoNombre,
      //   categoria_id: nuevaCategoria,
      //   cantidad_daniados: cantidadDanados,
      //   cantidad_disponible: cantidadDisponibles,
      // }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Error al actualizar material")
    }

    const result = await response.json()
    console.log("[v0] Material actualizado exitosamente:", result)

    Swal.fire("Cambios guardados exitosamente")

    cerrarModal()
    await cargarMateriales()
  } catch (error) {
    console.error("[v0] Error al guardar cambios:", error)
    Swal.fire("Error al guardar cambios: " + error.message)
  }
}

function cerrarSesion() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("usuario")
    localStorage.removeItem("userRole")
    window.location.href = "index.html"
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    cerrarModal()
  }
})

