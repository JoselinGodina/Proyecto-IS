const bcrypt = require("bcrypt");

(async () => {
  const password = "admin123"; // La contraseña que quieres usar
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
})();
