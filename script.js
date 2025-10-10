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
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  // Aquí es donde conectarás con tu backend en el futuro
  console.log("Login attempt:", { email, password })

  // Ejemplo de cómo se vería la llamada al backend:
  /*
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login exitoso
            console.log('Login successful:', data);
            // Redirigir al dashboard o guardar token
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard';
        } else {
            // Error en login
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
    */

  // Por ahora, solo mostramos un mensaje
  alert("Formulario enviado. Conecta con tu backend para procesar el login.")
})

// Handle register button
const registerBtn = document.getElementById("registerBtn")

registerBtn.addEventListener("click", () => {
  // Aquí redirigirías a la página de registro
  console.log("Redirect to register page")
  alert("Redirigiendo a página de registro...")
  // window.location.href = '/register';
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
