// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadReceiptData()
})

// Load receipt data
function loadReceiptData() {
  const loanData = JSON.parse(localStorage.getItem("currentLoan"))
  const usuario = JSON.parse(localStorage.getItem("usuario"))

  if (!loanData) {
    alert("No se encontraron datos del préstamo")
    window.location.href = "alumno.html"
    return
  }

  if (!usuario) {
    alert("No se encontraron datos del usuario")
    window.location.href = "index.html"
    return
  }

  // Generate receipt number
  const receiptNumber = "VP-" + loanData.id_vales.toString().padStart(8, '0')
  document.getElementById("receiptNumber").textContent = receiptNumber

  // Format date and time
  const date = new Date(loanData.timestamp)
  const formattedDate = date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  document.getElementById("receiptDateTime").textContent = formattedDate

  // Student data
  document.getElementById("studentNameReceipt").textContent = `${usuario.nombres} ${usuario.apellidos}`
  document.getElementById("studentControlReceipt").textContent = usuario.id_usuario
  document.getElementById("studentCareerReceipt").textContent = usuario.carrera || "N/A"
  document.getElementById("studentSemesterReceipt").textContent = `${usuario.semestre || "N/A"} Semestre`
  document.getElementById("studentTeacherReceipt").textContent = "N/A" // Puedes agregar este campo después

  // Materials table
  const tableBody = document.getElementById("materialsTableBody")
  tableBody.innerHTML = loanData.materials
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td class="text-center">${item.quantity}</td>
    </tr>
  `,
    )
    .join("")

  // Loan reason
  document.getElementById("loanReasonReceipt").textContent = loanData.reason
}

// Print receipt
function printReceipt() {
  window.print()
}