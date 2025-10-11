// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadReceiptData()
})

// Load receipt data
function loadReceiptData() {
  const loanData = JSON.parse(localStorage.getItem("currentLoan"))
  const studentData = JSON.parse(localStorage.getItem("studentData"))

  if (!loanData || !studentData) {
    alert("No se encontraron datos del préstamo")
    window.location.href = "alumno.html"
    return
  }

  // Generate receipt number
  const receiptNumber = "VP-" + Date.now().toString().slice(-8)
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
  document.getElementById("studentNameReceipt").textContent = `${studentData.nombres} ${studentData.apellidos}`
  document.getElementById("studentControlReceipt").textContent = studentData.numeroControl
  document.getElementById("studentCareerReceipt").textContent = studentData.carrera
  document.getElementById("studentSemesterReceipt").textContent = `${studentData.semestre} Semestre`

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
