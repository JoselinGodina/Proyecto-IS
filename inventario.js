let adminLogueado = null;
let materialEditando = null;
let cantidadDanados = 0;
let cantidadDisponibles = 0;
let categorias = [];

window.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] Cargando página de inventario...");
  cargarUsuarioLogueado();
  cargarCategorias();
  cargarMateriales();
});

function cargarUsuarioLogueado() {
  try {
    const usuarioStr = localStorage.getItem("usuario");
    console.log("[v0] Usuario en localStorage:", usuarioStr);

    if (usuarioStr) {
      adminLogueado = JSON.parse(usuarioStr);
      mostrarAdminLogueado();
    } else {
      console.warn("[v0] No hay usuario en localStorage");
      window.location.href = "index.html";
    }
  } catch (error) {
    console.error("[v0] Error al cargar usuario:", error);
  }
}

function mostrarAdminLogueado() {
  if (!adminLogueado) return;

  const nombreCompleto = `${adminLogueado.nombres} ${adminLogueado.apellidos}`;
  const codigoUsuario = adminLogueado.id_usuario;

  const adminDetailsDiv = document.querySelector(".admin-details");
  if (adminDetailsDiv) {
    adminDetailsDiv.innerHTML = `
      <h3>${nombreCompleto}</h3>
      <p>${codigoUsuario} - Administrador del Sistema</p>
    `;
  }

  console.log("[v0] Usuario mostrado en header:", nombreCompleto);
}

async function cargarCategorias() {
  try {
    console.log("[v0] Cargando categorías desde la BD...");
    const response = await fetch("http://localhost:3000/categorias");
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    categorias = await response.json();
    console.log("[v0] Categorías cargadas:", categorias);
  } catch (error) {
    console.error("[v0] Error al cargar categorías:", error);
  }
}

async function cargarMateriales() {
  const lista = document.getElementById("materialsList");

  if (lista) {
    lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Cargando materiales...</p>';
  }

  try {
    console.log("[v0] Cargando materiales desde la BD...");

    const response = await fetch("http://localhost:3000/materiales");
    console.log("[v0] Respuesta del servidor - Status:", response.status);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const materiales = await response.json();
    console.log("[v0] Materiales cargados:", materiales);

    renderizarMateriales(materiales);
  } catch (error) {
    console.error("[v0] Error al cargar materiales:", error);

    if (lista) {
      lista.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #e74c3c;">
          <h3>Error al cargar materiales</h3>
          <p>${error.message}</p>
          <button onclick="cargarMateriales()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reintentar
          </button>
        </div>
      `;
    }
  }
}

function renderizarMateriales(materiales) {
  const lista = document.getElementById("materialsList");

  if (!lista) {
    console.error("[v0] No se encontró el contenedor materialsList");
    return;
  }

  if (materiales.length === 0) {
    lista.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No hay materiales registrados</p>';
    return;
  }

  lista.innerHTML = materiales
    .map((material) => {
      // Total de material (disponibles + dañados)
      const total = (material.cantidad_disponible || 0) + (material.cantidad_daniados || 0);
      const disponibles = material.cantidad_disponible || 0;
      const danados = material.cantidad_daniados || 0;
      
      // Escapar comillas para evitar problemas en JSON
      const materialJson = JSON.stringify(material).replace(/'/g, "\\'");
      
      return `
        <div class="material-card">
          <div class="material-info">
            <div class="material-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div class="material-details">
              <h3>${material.nombre || 'Sin nombre'}</h3>
              <p>${material.descripcion || 'Sin categoría'}</p>
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
      `;
    })
    .join("");

  console.log("[v0] Materiales renderizados exitosamente:", materiales.length);
}

function abrirModalEditar(material) {
  materialEditando = material;
  
  console.log("[v0] Editando material:", materialEditando);

  // Habilitar campos de nombre y categoría
  const nombreInput = document.getElementById("nombreMaterial");
  const categoriaSelect = document.getElementById("categoria");
  
  nombreInput.value = materialEditando.nombre || '';
  nombreInput.disabled = false;

  // Cargar categorías en el select
  categoriaSelect.innerHTML = '';
  categoriaSelect.disabled = false;
  
  categorias.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.id_categoria;
    option.textContent = cat.descripcion;
    
    // Seleccionar la categoría actual del material
    if (cat.descripcion === materialEditando.descripcion) {
      option.selected = true;
    }
    
    categoriaSelect.appendChild(option);
  });

  // Inicializar cantidades
  cantidadDisponibles = materialEditando.cantidad_disponible || 0;
  cantidadDanados = materialEditando.cantidad_daniados || 0;
  
  document.getElementById("disponiblesDisplay").textContent = cantidadDisponibles;
  document.getElementById("danadosDisplay").textContent = cantidadDanados;

  document.getElementById("modalOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.remove("active");
  document.body.style.overflow = "auto";
  materialEditando = null;
  cantidadDanados = 0;
  cantidadDisponibles = 0;
}

function cerrarModalSiClickFuera(event) {
  if (event.target === event.currentTarget) {
    cerrarModal();
  }
}

function cambiarCantidad(tipo, cambio) {
  if (tipo === "disponibles") {
    const nuevoValor = cantidadDisponibles + cambio;
    // No permitir valores negativos
    cantidadDisponibles = Math.max(0, nuevoValor);
    document.getElementById("disponiblesDisplay").textContent = cantidadDisponibles;
    console.log("[v0] Cantidad disponibles actualizada:", cantidadDisponibles);
  } else if (tipo === "danados") {
    const nuevoValor = cantidadDanados + cambio;
    // No permitir valores negativos
    if (nuevoValor >= 0) {
      // Si aumenta dañados, restar de disponibles
      if (cambio > 0 && cantidadDisponibles > 0) {
        cantidadDanados = nuevoValor;
        cantidadDisponibles--;
        document.getElementById("disponiblesDisplay").textContent = cantidadDisponibles;
      } 
      // Si disminuye dañados, sumar a disponibles
      else if (cambio < 0 && nuevoValor >= 0) {
        cantidadDanados = nuevoValor;
        cantidadDisponibles++;
        document.getElementById("disponiblesDisplay").textContent = cantidadDisponibles;
      }
      document.getElementById("danadosDisplay").textContent = cantidadDanados;
      console.log("[v0] Cantidad de dañados actualizada:", cantidadDanados);
      console.log("[v0] Cantidad disponibles actualizada:", cantidadDisponibles);
    }
  }
}

async function guardarCambios() {
  if (!materialEditando) {
    console.error("[v0] No hay material seleccionado para editar");
    return;
  }

  try {
    const nuevoNombre = document.getElementById("nombreMaterial").value.trim();
    const nuevaCategoria = document.getElementById("categoria").value;
    
    if (!nuevoNombre) {
      alert("El nombre del material no puede estar vacío");
      return;
    }

    console.log("[v0] Guardando cambios...");
    console.log("[v0] Material original:", materialEditando.nombre);
    console.log("[v0] Nuevo nombre:", nuevoNombre);
    console.log("[v0] Nueva categoría:", nuevaCategoria);
    console.log("[v0] Cantidad disponible:", cantidadDisponibles);
    console.log("[v0] Cantidad de dañados:", cantidadDanados);

    const response = await fetch(
      `http://localhost:3000/materiales/${encodeURIComponent(materialEditando.nombre)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nuevoNombre: nuevoNombre,
          categoria_id: nuevaCategoria,
          cantidad_daniados: cantidadDanados,
          cantidad_disponible: cantidadDisponibles
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al actualizar material");
    }

    const result = await response.json();
    console.log("[v0] Material actualizado exitosamente:", result);

    alert("Cambios guardados exitosamente");
    
    cerrarModal();
    await cargarMateriales(); // Recargar la lista
  } catch (error) {
    console.error("[v0] Error al guardar cambios:", error);
    alert("Error al guardar cambios: " + error.message);
  }
}

function cerrarSesion() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("usuario");
    localStorage.removeItem("userRole");
    window.location.href = "index.html";
  }
}

// Cerrar modal con tecla Escape
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    cerrarModal();
  }
});