const bloodInventory = JSON.parse(localStorage.getItem('bloodInventory')) || {
  "A+": 0, "B+": 0, "AB+": 0, "O+": 0,
  "A-": 0, "B-": 0, "AB-": 0, "O-": 0
};
const donors = JSON.parse(localStorage.getItem('donors')) || [];

function renderBloodSummary(group = 'all') {
  const summaryContainer = document.getElementById('bloodSummary');
  summaryContainer.innerHTML = '';

  const groups = Object.keys(bloodInventory);
  const displayGroups = group === 'all' ? groups : [group];

  displayGroups.forEach(type => {
    const unit = bloodInventory[type];
    const card = document.createElement('div');
    card.className = 'p-4 bg-red-100 rounded shadow text-center';
    card.innerHTML = `<h4 class="text-lg font-semibold">${type}</h4><p class="text-2xl font-bold">${unit}</p>`;
    summaryContainer.appendChild(card);
  });
}

function renderDonors() {
  const tbody = document.querySelector('#donorTable tbody');
  tbody.innerHTML = '';
  donors.forEach(d => {
    const row = `<tr>
      <td class="p-2 border">${d.name}</td>
      <td class="p-2 border">${d.group}</td>
      <td class="p-2 border">${d.qty}</td>
      <td class="p-2 border">${d.date}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function openBloodModal() {
  document.getElementById('bloodModal').classList.remove('hidden');
}

function closeBloodModal() {
  document.getElementById('bloodModal').classList.add('hidden');
  document.getElementById('donorName').value = '';
  document.getElementById('bloodGroup').value = '';
  document.getElementById('quantity').value = '';
}

function addBloodUnit() {
  const donor = document.getElementById('donorName').value.trim();
  const group = document.getElementById('bloodGroup').value;
  const quantity = parseInt(document.getElementById('quantity').value);

  if (!donor || !group || isNaN(quantity) || quantity <= 0) {
    alert('Please fill all fields correctly.');
    return;
  }

  bloodInventory[group] += quantity;
  donors.push({
    name: donor,
    group: group,
    qty: quantity,
    date: new Date().toLocaleString()
  });

  localStorage.setItem('bloodInventory', JSON.stringify(bloodInventory));
  localStorage.setItem('donors', JSON.stringify(donors));

  closeBloodModal();
  renderBloodSummary();
  renderDonors();
}

function filterInventory() {
  const group = document.getElementById('filterGroup').value;
  renderBloodSummary(group);
}

function exportCSV() {
  let csv = "Donor,Blood Group,Quantity,Date\n";
  donors.forEach(d => {
    csv += `${d.name},${d.group},${d.qty},${d.date}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "blood_donors.csv";
  link.click();
}

function exportPDF() {
  const doc = new window.jspdf.jsPDF();
  doc.text("Blood Donor Report", 10, 10);
  donors.forEach((d, i) => {
    doc.text(`${i + 1}. ${d.name} | ${d.group} | ${d.qty} unit(s) | ${d.date}`, 10, 20 + (i * 10));
  });
  doc.save("donor_report.pdf");
}

// Initialize
renderBloodSummary();
renderDonors();
