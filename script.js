// ================================
// script.js - Login y Navegación
// ================================

// 1️⃣ Limpiar campos al cargar la página
window.addEventListener("load", () => {
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
});

// 2️ Evitar cache al usar back/forward
window.addEventListener("pageshow", (event) => {
  if (event.persisted || (window.performance && window.performance.getEntriesByType("navigation")[0].type === "back_forward")) {
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    localStorage.removeItem("usuario");
    sessionStorage.clear();
  }
});

// 3️⃣ Toggle de visibilidad de contraseña
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const eyeIcon = document.getElementById("eyeIcon");

togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  eyeIcon.style.opacity = type === "text" ? "0.5" : "1";
});

// 4️⃣ Manejo de login
const loginForm = document.getElementById("loginForm");

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
      // Guardar usuario en localStorage
      localStorage.setItem("usuario", JSON.stringify(data.user));
      alert(`✅ Bienvenido ${data.user.nombres}`);

      // Redirigir según rol (asegúrate que coincida con tu DB)
      const rol = typeof data.user.roles_id_rol === "string"
        ? parseInt(data.user.roles_id_rol)
        : data.user.roles_id_rol;

      if (rol === 1) {
        window.location.href = "usuarios.html"; // Admin
      } else if (rol === 2) {
        window.location.href = "Docente.html"; // Docente
      } else {
        window.location.href = "alumno.html"; // Alumno
      }
    } else {
      alert("⚠️ Usuario o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.");
    }
  } catch (error) {
    console.error("Error al conectar:", error);
    alert("Error al conectar con el servidor.");
  }
});

// 5️⃣ Botón de registro
const registerBtn = document.getElementById("registerBtn");
registerBtn.addEventListener("click", () => {
  window.location.href = "registro.html";
});

// 6️⃣ Validación visual de inputs
const inputs = document.querySelectorAll(".form-input");

inputs.forEach((input) => {
  input.addEventListener("blur", function () {
    this.style.borderColor = this.value.trim() === "" ? "#EF4444" : "#10B981";
  });
  input.addEventListener("focus", function () {
    this.style.borderColor = "var(--color-burgundy)";
  });
});


