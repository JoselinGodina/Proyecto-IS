// 1️⃣ Limpiar campos de login al cargar la página
window.addEventListener("load", () => {
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
});

// Evitar que el navegador use cache al volver con <- o ->
// Esto borra los inputs y limpia localStorage si la página viene del back/forward
window.addEventListener("pageshow", function (event) {
  if (event.persisted || (window.performance && window.performance.getEntriesByType("navigation")[0].type === "back_forward")) {
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    localStorage.removeItem("usuario");
    sessionStorage.clear();
  }
});

// Toggle password visibility
const togglePassword = document.getElementById("togglePassword")
const passwordInput = document.getElementById("password")
const eyeIcon = document.getElementById("eyeIcon")

togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
  passwordInput.setAttribute("type", type)

  // Toggle eye icon (you can add eye-slash icon if needed)
  if (type === "text") {
    eyeIcon.style.opacity = "0.5"
  } else {
    eyeIcon.style.opacity = "1"
  }
})

// Handle login form submission
const loginForm = document.getElementById("loginForm")

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = document.getElementById("email").value.trim();
  const contrasena = document.getElementById("password").value.trim();

  if (!correo || !contrasena) {
    alert("Por favor, completa todos los campos");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await response.json();

   if (response.ok) {
  // Guardar datos del usuario en localStorage
  localStorage.setItem("usuario", JSON.stringify(data.user));

  alert(`✅ Bienvenido ${data.user.nombres}`);

  // Redirigir según el rol
  if (data.user.roles_id_rol === '1') { // Admin
    window.location.href = "usuarios.html";
  } 
  else if(data.user.roles_id_rol === '2')
  {
    window.location.href = "Docente.html";
  }
  else {
    window.location.href = "alumno.html"; // Usuario normal
  }
}

  else {
    // Usuario no registrado o contraseña incorrecta
    alert("⚠️Usuario o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo." );
  }

  } catch (error) {
    console.error("Error al conectar:", error);
    alert("Error al conectar con el servidor.");
  }
 
})

// Este código va en tu index.html (o en el JS que usa el login)
async function loginUsuario(event) {
    event.preventDefault();

    const id = document.getElementById("usuario").value;
    const contrasena = document.getElementById("contrasena").value;

    // Aquí harías tu consulta al backend (Node.js o lo que uses)
    // Supongamos que ya recibes los datos del usuario:
    const respuesta = {
        id_usuario: id,
        nombres: "Admin",
        apellidos: "Principal",
        correo: "admin@instituto.edu.mx",
        roles_id_rol: "1" // si es admin (si es alumno, sería "2")
    };

    // Guardar sesión en localStorage
    localStorage.setItem("usuario", JSON.stringify(respuesta));

    // Redirección según rol
    if (respuesta.roles_id_rol === "1") {
        window.location.href = "usuarios.html";
    } else {
        window.location.href = "alumno.html";
    }
}



// Handle register button
const registerBtn = document.getElementById("registerBtn")

registerBtn.addEventListener("click", () => {
  window.location.href = "registro.html"
})

// Add input validation feedback
const inputs = document.querySelectorAll(".form-input")

inputs.forEach((input) => {
  input.addEventListener("blur", function () {
    if (this.value.trim() === "") {
      this.style.borderColor = "#EF4444"
    } else {
      this.style.borderColor = "#10B981"
    }
  })

  input.addEventListener("focus", function () {
    this.style.borderColor = "var(--color-burgundy)"
  })
})
