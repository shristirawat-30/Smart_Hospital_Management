const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, 'data');

function readJSON(fileName) {
    const filePath = path.join(dataDir, fileName);
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error.message);
        return null;
    }
}

function getTodayFileName() {
    const now = new Date();
    return `patients_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.json`;
}

function writeToFile(fileName, data) {
    const filePath = path.join(dataDir, fileName);
    let currentData = [];

    if (fs.existsSync(filePath)) {
        currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    currentData.push(data);
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 4));
}

// ----------------- ROUTES -----------------

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🔍 Get all doctors
app.get('/api/doctors', (req, res) => {
    const doctors = readJSON('doctors.json');
    doctors ? res.json(doctors) : res.status(500).json({ error: 'Failed to load doctors.' });
});

// 🔍 Get all patients
app.get('/api/patients', (req, res) => {
    const patients = readJSON('patients.json');
    patients ? res.json(patients) : res.status(500).json({ error: 'Failed to load patients.' });
});

// 🔍 Get all appointments
app.get('/api/appointments', (req, res) => {
    const appointments = readJSON('appointments.json');
    appointments ? res.json(appointments) : res.status(500).json({ error: 'Failed to load appointments.' });
});

// 📊 Analytics route
app.get('/api/analytics/:type', (req, res) => {
    const fileMap = {
        patient: 'patients.json',
        doctor: 'doctors.json',
        appointment: 'appointments.json'
    };
    const file = fileMap[req.params.type];
    if (!file) return res.status(400).json({ error: 'Invalid analytics type.' });

    const data = readJSON(file);
    data ? res.json(data) : res.status(500).json({ error: 'Analytics data not available.' });
});

// 🏥 Register Patient
app.post('/api/register', (req, res) => {
    const patient = req.body;
    const filePath = path.join(dataDir, 'patients.json');
    let patients = [];

    try {
        if (fs.existsSync(filePath)) {
            patients = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }

        const newId = patients.length > 0 ? patients[patients.length - 1].id + 1 : 1;
        patient.id = newId;

        patients.push(patient);
        fs.writeFileSync(filePath, JSON.stringify(patients, null, 4));

        // 🔄 Also write to daily log
        writeToFile(getTodayFileName(), patient);

        res.status(201).json({ message: "Patient registered", id: newId });
    } catch (error) {
        console.error("❌ Registration error:", error.message);
        res.status(500).json({ error: "Registration failed." });
    }
});

// 🔍 Lookup patient by ID
app.get('/api/patient/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const patients = readJSON('patients.json') || [];
    const patient = patients.find(p => p.id === id);
    patient ? res.json({ found: true, patient }) : res.json({ found: false });
});

// 🔍 Lookup patient by Mobile
app.get('/api/patient-mobile/:mobile', (req, res) => {
    const mobile = req.params.mobile;
    const patients = readJSON('patients.json') || [];
    const patient = patients.find(p => p.mobile === mobile);
    patient ? res.json({ found: true, patient }) : res.json({ found: false });
});

// 🩺 Book Appointment
app.post('/api/book-appointment', (req, res) => {
    const { id, isEmergency, priority } = req.body;
    const patients = readJSON('patients.json') || [];
    const patient = patients.find(p => p.id == id);
    if (!patient) return res.json({ success: false, message: 'Patient not found.' });

    const doctors = readJSON('doctors.json') || [];

    const matchSpec = symptom => {
        const lower = symptom.toLowerCase();
        if (lower.includes("chest")) return "Cardiology";
        if (lower.includes("bone")) return "Orthopedics";
        if (lower.includes("skin")) return "Dermatology";
        return "General";
    };

    const specialization = matchSpec(patient.symptoms);
    let doctor = doctors.find(d => d.specialization === specialization) || doctors.find(d => d.specialization === "General");

    const newAppointment = {
        patient_id: patient.id,
        patient_name: patient.name,
        is_emergency: !!parseInt(isEmergency),
        priority: parseInt(priority),
        doctor_id: doctor ? doctor.id : -1,
        doctor: doctor ? doctor.name : "Not Assigned",
        specialization,
        timestamp: Date.now()
    };

    const appointmentsFile = path.join(dataDir, 'appointments.json');
    const existing = fs.existsSync(appointmentsFile) ? JSON.parse(fs.readFileSync(appointmentsFile)) : [];
    existing.push(newAppointment);
    fs.writeFileSync(appointmentsFile, JSON.stringify(existing, null, 2));

    res.json({ success: true, doctor: doctor.name });
});

// 🔄 PATCH: Update patient's symptoms
app.patch('/api/update-symptoms/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { symptoms, date } = req.body;
    const filePath = path.join(dataDir, 'patients.json');

    try {
        let patients = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        const index = patients.findIndex(p => p.id === id);
        if (index === -1) return res.status(404).json({ error: "Patient not found." });

        patients[index].symptoms = symptoms;
        if (date) patients[index].date = date;

        fs.writeFileSync(filePath, JSON.stringify(patients, null, 4));

        // Log update to daily file
        const updatedEntry = { ...patients[index] };
        writeToFile(getTodayFileName(), updatedEntry);

        res.json({ success: true, message: "Symptoms updated." });
    } catch (error) {
        console.error("❌ Write error:", error.message);
        res.status(500).json({ error: "Failed to update symptoms." });
    }
});

// 🧠 Optional: C++ Patient Lookup via Executable
app.post('/api/lookup-patient', (req, res) => {
    const { idOrMobile } = req.body;
    const cppExecutable = path.join(__dirname, 'build', 'lookup');

    exec(`${cppExecutable} ${idOrMobile}`, (err, stdout, stderr) => {
        if (err) {
            console.error("❌ C++ Lookup Error:", stderr);
            return res.status(500).json({ error: "Lookup failed." });
        }

        try {
            const result = JSON.parse(stdout);
            if (result.found) {
                res.json({ found: true, patient: result.patient });
            } else {
                res.json({ found: false });
            }
        } catch (parseErr) {
            res.status(500).json({ error: "Invalid C++ output." });
        }
    });
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
    console.log(` Server running at: http://localhost:${PORT}`);
});
