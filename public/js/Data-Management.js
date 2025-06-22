// Utility function for date string
function getDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// ✅ Export Data as CSV
function exportCSV(type) {
  window.location.href = `/export/${type}`; // triggers file download via backend
}

// ✅ Reset Workload to Zero (server handles it)
function resetWorkload() {
  fetch('/api/reset-workload', { method: 'POST' })
    .then(res => res.json())
    .then(() => alert('Doctor workload reset to 0!'));
}

// ✅ Clear Appointments File
function clearAppointments() {
  fetch('/api/reset-appointments', { method: 'POST' })
    .then(res => res.json())
    .then(() => alert('Appointments reset for new day!'));
}

// ✅ Clear Temporary Patients
function clearTempPatients() {
  fetch('/api/reset-patients', { method: 'POST' })
    .then(res => res.json())
    .then(() => alert('Temporary patients cleared!'));
}

// Real-time DateTime
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  const formatted = now.toLocaleString('en-IN', options);
  document.getElementById("datetime").textContent = `📅 ${formatted}`;
}
updateDateTime();
setInterval(updateDateTime, 1000);
