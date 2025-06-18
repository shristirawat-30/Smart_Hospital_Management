// public/js/appointment.js

document.getElementById('appointmentForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const id = this.id.value;
  const isEmergency = document.getElementById('isEmergency').value;
  const priority = isEmergency === "1" ? parseInt(document.getElementById('priorityInput').value) : -1;

  const res = await fetch('/api/book-appointment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, isEmergency, priority }),
  });

  const result = await res.json();
  if (result.success) {
    alert('✅ Appointment Booked Successfully!\nDoctor: ' + result.doctor);
    document.getElementById('appointmentForm').reset();
    document.getElementById('patientDetails').style.display = 'none';
  } else {
    alert(result.message);
  }
});

document.querySelector('input[name="id"]').addEventListener('change', async function () {
  const res = await fetch('/api/patient/' + this.value);
  const data = await res.json();
  const details = document.getElementById('patientDetails');

  if (data.found) {
    document.getElementById('pname').textContent = data.patient.name;
    document.getElementById('psymptoms').textContent = data.patient.symptoms;
    details.style.display = 'block';
  } else {
    alert('❌ Patient not found. Please register first.');
    details.style.display = 'none';
  }
});

document.getElementById('isEmergency').addEventListener('change', function () {
  document.getElementById('priorityField').style.display = this.value === '1' ? 'block' : 'none';
});
