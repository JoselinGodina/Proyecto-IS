// Obtener los elementos del formulario
const registerForm = document.getElementById("registerForm");
const passwordRegistroInput = document.getElementById("passwordRegistro");
const confirmPasswordInput = document.getElementById("confirmPassword");

// Manejo de toggle de contraseña
const togglePasswordRegistro = document.getElementById("togglePasswordRegistro");
togglePasswordRegistro.addEventListener("click", () => {
  const type = passwordRegistroInput.type === "password" ? "text" : "password";
  passwordRegistroInput.type = type;
});

const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
toggleConfirmPassword.addEventListener("click", () => {
  const type = confirmPasswordInput.type === "password" ? "text" : "password";
  confirmPasswordInput.type = type;
});

// Validar que coincidan las contraseñas
confirmPasswordInput.addEventListener("input", () => {
  const password = passwordRegistroInput.value;
  const confirm = confirmPasswordInput.value;
  const hint = document.getElementById("passwordMatch");
  if (confirm === "") {
    hint.textContent = "";
  } else if (password === confirm) {
    hint.textContent = "Las contraseñas coinciden";
    confirmPasswordInput.style.borderColor = "#10B981";
  } else {
    hint.textContent = "Las contraseñas no coinciden";
    confirmPasswordInput.style.borderColor = "#EF4444";
  }
});

// Validación de número de control
const numeroControlInput = document.getElementById("numeroControl");
numeroControlInput.addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

// Manejar envío del formulario
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id_usuario = document.getElementById("numeroControl").value.trim();
  const nombres = document.getElementById("nombres").value.trim();
  const apellidos = document.getElementById("apellidos").value.trim();
  const correo = document.getElementById("emailRegistro").value.trim();
  const contrasena = passwordRegistroInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validar contraseñas
  if (contrasena !== confirmPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  // Obtener valores de select
  const carreraSelect = document.getElementById("carrera");
  const carrera = carreraSelect.value;
  const semestreSelect = document.getElementById("semestre");
  const semestre = semestreSelect.value;

  // Validación básica antes de enviar
  if (!id_usuario || !nombres || !apellidos || !correo || !carrera || !semestre) {
    alert("Todos los campos son obligatorios");
    return;
  }

  const formData = {
    id_usuario,
    nombres,
    apellidos,
    carreras_id_carreras: carrera,
    correo,
    semestre,
    contrasena,
  };

  try {
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("✅ " + data.message);
      window.location.href = "index.html";
    } else {
      alert("⚠️ " + (data.error || "Error al registrar"));
    }
  } catch (error) {
    console.error(error);
    alert("❌ Error al conectar con el servidor");
  }
});
