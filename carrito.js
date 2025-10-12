let cart = JSON.parse(localStorage.getItem("cart")) || []

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  renderCartItems()
  updateSummary()
})

// Render cart items
function renderCartItems() {
  const cartList = document.getElementById("cartItemsList")
  const emptyCart = document.getElementById("emptyCart")
  const confirmBtn = document.getElementById("confirmLoanBtn")

  if (cart.length === 0) {
    cartList.style.display = "none"
    emptyCart.style.display = "block"
    confirmBtn.disabled = true
    return
  }

  cartList.style.display = "block"
  emptyCart.style.display = "none"
  confirmBtn.disabled = false

  cartList.innerHTML = cart
    .map(
      (item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h3 class="cart-item-name">${item.name}</h3>
        <p class="cart-item-category">${item.category}</p>
        <div class="cart-item-quantity">
          <span>Cantidad: ${item.quantity}</span>
        </div>
      </div>
      <div class="cart-item-actions">
        <button class="cart-qty-btn" onclick="decreaseQuantity(${index})">-</button>
        <button class="cart-qty-btn" onclick="increaseQuantity(${index})">+</button>
        <button class="remove-btn" onclick="removeItem(${index})">Eliminar</button>
      </div>
    </div>
  `,
    )
    .join("")
}

// Update summary
function updateSummary() {
  const totalItems = cart.length
  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0)

  document.getElementById("totalItems").textContent = totalItems
  document.getElementById("totalUnits").textContent = totalUnits
}

// Increase quantity
function increaseQuantity(index) {
  cart[index].quantity++
  localStorage.setItem("cart", JSON.stringify(cart))
  renderCartItems()
  updateSummary()
}

// Decrease quantity
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--
    localStorage.setItem("cart", JSON.stringify(cart))
    renderCartItems()
    updateSummary()
  }
}

// Remove item
function removeItem(index) {
  if (confirm("¿Estás seguro de eliminar este material del carrito?")) {
    cart.splice(index, 1)
    localStorage.setItem("cart", JSON.stringify(cart))
    renderCartItems()
    updateSummary()
  }
}

// Confirm loan
function confirmLoan() {
  const reason = document.getElementById("loanReason").value.trim()

  if (!reason) {
    alert("Por favor, ingresa el motivo del préstamo")
    document.getElementById("loanReason").focus()
    return
  }

  if (cart.length === 0) {
    alert("El carrito está vacío")
    return
  }

  // Save loan data
  const loanData = {
    materials: cart,
    reason: reason,
    timestamp: new Date().toISOString(),
  }

  localStorage.setItem("currentLoan", JSON.stringify(loanData))

  // Clear cart
  cart = []
  localStorage.setItem("cart", JSON.stringify(cart))

  // Redirect to receipt
  window.location.href = "vale-prestamo.html"
}
