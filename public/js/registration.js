document.addEventListener('DOMContentLoaded', () => {
    const newPatientBtn = document.getElementById('newPatientBtn');
    const returningPatientBtn = document.getElementById('returningPatientBtn');
    const registerForm = document.getElementById('registerForm');
    const lookupForm = document.getElementById('lookupForm');
    const lookupResult = document.getElementById('lookupResult');

    function getFormattedDateTime() {
        const now = new Date();
        return now.toLocaleString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: true
        });
    }

    newPatientBtn.addEventListener('click', () => {
        registerForm.style.display = 'block';
        lookupForm.style.display = 'none';
        lookupResult.style.display = 'none';
    });

    returningPatientBtn.addEventListener('click', () => {
        registerForm.style.display = 'none';
        lookupForm.style.display = 'block';
        lookupResult.style.display = 'none';
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const currentDateTime = getFormattedDateTime();

        const patientData = {
            name: form.name.value,
            age: parseInt(form.age.value),
            sex: form.sex.value,
            symptoms: form.symptoms.value,
            mobile: form.mobile.value,
            address: form.address.value,
            date: currentDateTime
        };

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patientData)
            });

            const result = await res.json();

            if (res.ok) {
                alert(`Registered successfully. Your Patient ID is ${result.id}`);
                sessionStorage.setItem('patientId', result.id);
                sessionStorage.setItem('symptoms', patientData.symptoms);
                form.reset();
                window.location.href = 'appointment.html';
            } else {
                alert("Registration failed: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Network error.");
        }
    });

    lookupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('lookupId').value.trim();
        const mobile = document.getElementById('lookupMobile').value.trim();

        let queryURL = '';
        if (id) {
            queryURL = `/api/patient/${id}`;
        } else if (mobile) {
            queryURL = `/api/patient-mobile/${mobile}`;
        } else {
            alert("Please enter Patient ID or Mobile Number.");
            return;
        }

        try {
            const res = await fetch(queryURL);
            const result = await res.json();

            if (result.found) {
                const p = result.patient;

                lookupResult.innerHTML = `
                    <p><strong>Name:</strong> ${p.name}</p>
                    <p><strong>Age:</strong> ${p.age}</p>
                    <p><strong>Sex:</strong> ${p.sex}</p>
                    <p><strong>Mobile:</strong> ${p.mobile}</p>
                    <p><strong>Address:</strong> ${p.address}</p>

                    <label>Current Symptoms:
                        <input type="text" id="symptomsUpdate" required>
                    </label>
                    <button id="proceedToAppointment">Proceed to Appointment</button>
                `;
                lookupResult.style.display = 'block';

                document.getElementById('proceedToAppointment').addEventListener('click', async () => {
                    const newSymptoms = document.getElementById('symptomsUpdate').value.trim();
                    if (!newSymptoms) {
                        alert("Please enter your current symptoms.");
                        return;
                    }

                    const currentDateTime = getFormattedDateTime();

                    try {
                        const patchRes = await fetch(`/api/update-symptoms/${p.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                symptoms: newSymptoms,
                                date: currentDateTime,
                                name: p.name,
                                age: p.age,
                                sex: p.sex,
                                mobile: p.mobile,
                                address: p.address
                            })
                        });

                        const patchResult = await patchRes.json();
                        if (!patchResult.success) {
                            alert("Failed to update symptoms.");
                            return;
                        }
                    } catch (err) {
                        console.error("Failed to update symptoms", err);
                        alert("Error updating symptoms.");
                        return;
                    }

                    sessionStorage.setItem('patientId', p.id);
                    sessionStorage.setItem('symptoms', newSymptoms);
                    window.location.href = 'appointment.html';
                });

            } else {
                alert("Patient not found. Redirecting you to registration.");
                lookupForm.reset();
                lookupForm.style.display = 'none';
                lookupResult.style.display = 'none';
                registerForm.style.display = 'block';
            }
        } catch (err) {
            console.error(err);
            alert("Failed to fetch patient.");
        }
    });
});
