document.getElementById('fetchForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const id = document.getElementById('patientIDInput').value.trim();
  const box = document.getElementById('responseBox');
  const details = document.getElementById('patientDetails');

  if (!id) {
    box.innerHTML = `<p>Please enter a valid Patient ID.</p>`;
    styleBox(box, 'error');
    details.style.display = 'none';
    return;
  }

  try {
    const res = await fetch('/api/appointment-cpp-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const data = await res.json();

    if (data.found) {
      document.getElementById('pname').textContent = data.patient.name;
      document.getElementById('page').textContent = data.patient.age;
      document.getElementById('psex').textContent = data.patient.sex;
      document.getElementById('psymptoms').textContent = data.patient.symptoms;
      document.getElementById('pspecialization').textContent = data.patient.specialization || "Auto-detecting";
      document.getElementById('confirmedID').value = id;

      details.style.display = 'block';
      box.innerHTML = '';
      box.style.border = 'none';
    } else {
      details.style.display = 'none';
      box.innerHTML = `<p>ID not found in today's records. Please <a href='registration.html'>register</a> first.</p>`;
      styleBox(box, 'error');
    }
  } catch (err) {
    box.innerHTML = `<p>Error fetching patient details. Try again.</p>`;
    styleBox(box, 'error');
  }
});

document.getElementById('appointmentForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const id = document.getElementById('confirmedID').value.trim();
  const isEmergency = document.getElementById('isEmergency').value;
  const priorityInput = document.getElementById('priorityInput').value.trim();
  const box = document.getElementById('responseBox');

  if (!id) {
    box.innerHTML = `<p>Please fetch patient details first.</p>`;
    styleBox(box, 'error');
    return;
  }

  const priority = isEmergency === "1" ? parseInt(priorityInput) || 1 : -1;

  try {
    const res = await fetch('/api/book-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isEmergency, priority }),
    });

    const result = await res.json();

    if (result.success !== false && result.doctor && result.doctor !== "Not Assigned") {
      const readableTime = result.timestamp || "N/A";  // ✅ Show directly

      box.innerHTML = `
        <h3>Appointment Booked Successfully!</h3>
        <p><strong>Doctor:</strong> ${result.doctor}</p>
        <p><strong>Specialization:</strong> ${result.specialization}</p>
        <p><strong>Emergency:</strong> ${result.is_emergency ? "Yes" : "No"}</p>
        <p><strong>Appointment Time:</strong> ${readableTime}</p>
      `;
      styleBox(box, 'success');
      document.getElementById('appointmentForm').reset();
      document.getElementById('priorityField').style.display = 'none';
    } else {
      box.innerHTML = `<p>${result.message || "Doctor not available right now. Please try later or contact helpdesk."}</p>`;
      styleBox(box, 'error');
    }
  } catch (err) {
    console.error(err);
    box.innerHTML = `<p>Server error while booking appointment.</p>`;
    styleBox(box, 'error');
  }
});

document.getElementById('isEmergency').addEventListener('change', function () {
  const priorityField = document.getElementById('priorityField');
  priorityField.style.display = this.value === '1' ? 'block' : 'none';
});

// Utility function to style box
function styleBox(box, type) {
  if (type === 'success') {
    box.style.backgroundColor = "#d4edda";
    box.style.color = "#155724";
    box.style.border = "1px solid #c3e6cb";
  } else {
    box.style.backgroundColor = "#f8d7da";
    box.style.color = "#721c24";
    box.style.border = "1px solid #f5c6cb";
  }
}
