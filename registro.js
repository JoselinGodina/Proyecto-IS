// Toggle password visibility para contraseña
const togglePasswordRegistro = document.getElementById("togglePasswordRegistro")
const passwordRegistroInput = document.getElementById("passwordRegistro")

togglePasswordRegistro.addEventListener("click", () => {
  const type = passwordRegistroInput.getAttribute("type") === "password" ? "text" : "password"
  passwordRegistroInput.setAttribute("type", type)
  togglePasswordRegistro.querySelector(".eye-icon").style.opacity = type === "text" ? "0.5" : "1"
})

// Toggle password visibility para confirmar contraseña
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword")
const confirmPasswordInput = document.getElementById("confirmPassword")

toggleConfirmPassword.addEventListener("click", () => {
  const type = confirmPasswordInput.getAttribute("type") === "password" ? "text" : "password"
  confirmPasswordInput.setAttribute("type", type)
  toggleConfirmPassword.querySelector(".eye-icon").style.opacity = type === "text" ? "0.5" : "1"
})

// Validar que las contraseñas coincidan
const passwordMatchHint = document.getElementById("passwordMatch")

confirmPasswordInput.addEventListener("input", () => {
  const password = passwordRegistroInput.value
  const confirmPassword = confirmPasswordInput.value

  if (confirmPassword === "") {
    passwordMatchHint.textContent = ""
    passwordMatchHint.className = "form-hint"
  } else if (password === confirmPassword) {
    passwordMatchHint.textContent = "Las contraseñas coinciden"
    passwordMatchHint.className = "form-hint success"
    confirmPasswordInput.style.borderColor = "#10B981"
  } else {
    passwordMatchHint.textContent = "Las contraseñas no coinciden"
    passwordMatchHint.className = "form-hint error"
    confirmPasswordInput.style.borderColor = "#EF4444"
  }
})

// Handle register form submission
const registerForm = document.getElementById("registerForm")

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  // Validar que las contraseñas coincidan
  const password = passwordRegistroInput.value
  const confirmPassword = confirmPasswordInput.value

  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden")
    return
  }

  // Recopilar datos del formulario
  const formData = {
    nombres: document.getElementById("nombres").value,
    apellidos: document.getElementById("apellidos").value,
    carrera: document.getElementById("carrera").value,
    semestre: document.getElementById("semestre").value,
    numeroControl: document.getElementById("numeroControl").value,
    email: document.getElementById("emailRegistro").value,
    password: password,
  }

  console.log("Registro attempt:", formData)

  // Aquí es donde conectarás con tu backend en el futuro
  /*
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Registro exitoso
            console.log('Registro successful:', data);
            alert('Cuenta creada exitosamente. Redirigiendo al login...');
            window.location.href = '/index.html';
        } else {
            // Error en registro
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
    */

  // Por ahora, solo mostramos un mensaje
  alert("Formulario de registro enviado. Conecta con tu backend para procesar el registro.")
})

// Botón para volver al login
const backToLoginBtn = document.getElementById("backToLoginBtn")

backToLoginBtn.addEventListener("click", () => {
  window.location.href = "index.html"
})

// Add input validation feedback
const inputs = document.querySelectorAll(".form-input")

inputs.forEach((input) => {
  input.addEventListener("blur", function () {
    if (this.value.trim() === "" && this.hasAttribute("required")) {
      this.style.borderColor = "#EF4444"
    } else if (this.value.trim() !== "") {
      this.style.borderColor = "#10B981"
    }
  })

  input.addEventListener("focus", function () {
    this.style.borderColor = "var(--color-burgundy)"
  })
})

// Validación del número de control (solo números)
const numeroControlInput = document.getElementById("numeroControl")

numeroControlInput.addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "")
})
