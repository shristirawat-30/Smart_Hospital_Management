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
const permanentFile = path.join(dataDir, 'permanent_storage.json');
const patientFile = path.join(dataDir, 'patients.json');

// Utility: Read JSON
function readJSON(fileName) {
    const filePath = path.join(dataDir, fileName);
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return [];
    }
}

// Utility: Get today’s file name
function getTodayFileName() {
    const now = new Date();
    return `patients_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.json`;
}

// Utility: Write to a specific file
function writeToFile(fileName, entry) {
    const filePath = path.join(dataDir, fileName);
    let data = [];

    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    data.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

// Utility: Append to permanent storage
function appendToPermanentStorage(entry) {
    writeToFile('permanent_storage.json', entry);
}

// ---------------- ROUTES ---------------- //

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get doctors
app.get('/api/doctors', (req, res) => {
    const doctors = readJSON('doctors.json');
    res.json(doctors);
});

// Get all patients
app.get('/api/patients', (req, res) => {
    const patients = readJSON('patients.json');
    res.json(patients);
});

// Get appointments
app.get('/api/appointments', (req, res) => {
    const appointments = readJSON('appointments.json');
    res.json(appointments);
});

// Analytics
app.get('/api/analytics/:type', (req, res) => {
    const map = {
        patient: 'patients.json',
        doctor: 'doctors.json',
        appointment: 'appointments.json'
    };
    const file = map[req.params.type];
    if (!file) return res.status(400).json({ error: 'Invalid analytics type.' });

    const data = readJSON(file);
    res.json(data);
});

// Register new patient
app.post('/api/register', (req, res) => {
    const patient = req.body;
    let patients = readJSON('patients.json');

    const newId = patients.length > 0 ? patients[patients.length - 1].id + 1 : 1;
    patient.id = newId;

    patients.push(patient);
    fs.writeFileSync(patientFile, JSON.stringify(patients, null, 4));

    // Save to today's log and permanent storage
    writeToFile(getTodayFileName(), patient);
    appendToPermanentStorage(patient);

    res.status(201).json({ message: "Patient registered", id: newId });
});

// Lookup patient by ID
app.get('/api/patient/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const patients = readJSON('patients.json');
    const patient = patients.find(p => p.id === id);
    res.json(patient ? { found: true, patient } : { found: false });
});

// Lookup by Mobile
app.get('/api/patient-mobile/:mobile', (req, res) => {
    const mobile = req.params.mobile;
    const patients = readJSON('patients.json');
    const patient = patients.find(p => p.mobile === mobile);
    res.json(patient ? { found: true, patient } : { found: false });
});

// Book appointment
app.post('/api/book-appointment', (req, res) => {
    const { id, isEmergency, priority } = req.body;
    const patients = readJSON('patients.json');
    const patient = patients.find(p => p.id == id);
    if (!patient) return res.json({ success: false, message: 'Patient not found' });

    const doctors = readJSON('doctors.json');

    const matchSpec = symptom => {
        const lower = symptom.toLowerCase();
        if (lower.includes("chest")) return "Cardiology";
        if (lower.includes("bone")) return "Orthopedics";
        if (lower.includes("skin")) return "Dermatology";
        return "General";
    };

    const specialization = matchSpec(patient.symptoms);
    const doctor = doctors.find(d => d.specialization === specialization) || doctors.find(d => d.specialization === "General");

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
    const appointments = readJSON('appointments.json');
    appointments.push(newAppointment);
    fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));

    res.json({ success: true, doctor: doctor.name });
});

// Update symptoms (Returning patient - new entry, not overwrite)
app.patch('/api/update-symptoms/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { symptoms, date } = req.body;

    const permanentData = readJSON('permanent_storage.json');
    const patient = permanentData.find(p => p.id === id);

    if (!patient) return res.status(404).json({ error: "Patient not found in permanent storage." });

    const newEntry = {
        ...patient,
        symptoms,
        date
    };

    writeToFile('patients.json', newEntry);               // Add as new in patients.json
    appendToPermanentStorage(newEntry);                   // Also in permanent
    writeToFile(getTodayFileName(), newEntry);            // Daily log

    res.json({ success: true, message: "Symptoms updated and entry stored." });
});

// Optional: C++ lookup
app.post('/api/lookup-patient', (req, res) => {
    const { idOrMobile } = req.body;
    const cppExecutable = path.join(__dirname, 'build', 'lookup');

    exec(`${cppExecutable} ${idOrMobile}`, (err, stdout, stderr) => {
        if (err) {
            console.error("C++ Lookup Error:", stderr);
            return res.status(500).json({ error: "Lookup failed." });
        }

        try {
            const result = JSON.parse(stdout);
            res.json(result.found ? { found: true, patient: result.patient } : { found: false });
        } catch {
            res.status(500).json({ error: "Invalid C++ output." });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
