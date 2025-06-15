// public/js/registration.js
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const form = e.target;

    const patientData = {
        name: form.name.value,
        age: parseInt(form.age.value),
        sex: form.sex.value,
        symptoms: form.symptoms.value,
        mobile: form.mobile.value,
        address: form.address.value
    };

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });

        const result = await res.json();

        if (res.ok) {
            alert(` Registered successfully. Your Patient ID is ${result.id}`);
            form.reset();
        } else {
            alert("❌ Registration failed: " + result.error);
        }
    } catch (err) {
        alert("❌ Network error.");
        console.error(err);
    }
});
