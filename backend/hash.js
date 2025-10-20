const bcrypt = require("bcrypt");

(async () => {
  const password = "doc123"; // contraseña del docente
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
})();

