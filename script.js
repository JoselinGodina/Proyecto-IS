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
  window.location.href = "alumno.html"; // redirige al portal del alumno
}

  } catch (error) {
    console.error("Error al conectar:", error);
    alert("Error al conectar con el servidor.");
  }
 
})

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
