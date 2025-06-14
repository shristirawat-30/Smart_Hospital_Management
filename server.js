const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 🔐 Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌐 Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// 📂 Data Directory
const dataDir = path.join(__dirname, 'data');

// 🧠 Helper function to read JSON files
function readJSON(fileName) {
    const filePath = path.join(dataDir, fileName);
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        console.error(`❌ Error reading ${fileName}:`, error.message);
        return null;
    }
}

// ==================== 📁 ROUTES ==================== //

// 🏠 Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 👨‍⚕️ Get all doctors
app.get('/api/doctors', (req, res) => {
    const doctors = readJSON('doctors.json');
    if (doctors) res.json(doctors);
    else res.status(500).json({ error: 'Failed to load doctors data.' });
});

// 🧑‍🤝‍🧑 Get all patients
app.get('/api/patients', (req, res) => {
    const patients = readJSON('patients.json');
    if (patients) res.json(patients);
    else res.status(500).json({ error: 'Failed to load patients data.' });
});

// 📅 Get all appointments
app.get('/api/appointments', (req, res) => {
    const appointments = readJSON('appointments.json');
    if (appointments) res.json(appointments);
    else res.status(500).json({ error: 'Failed to load appointments data.' });
});

// 📊 Analytics Export API
app.get('/api/analytics/:type', (req, res) => {
    const type = req.params.type;
    const fileMap = {
        patient: 'patients.json',
        doctor: 'doctors.json',
        appointment: 'appointments.json'
    };

    if (!fileMap[type]) {
        return res.status(400).json({ error: 'Invalid analytics type.' });
    }

    const data = readJSON(fileMap[type]);
    if (data) res.json(data);
    else res.status(500).json({ error: 'Analytics data not available.' });
});



// ✅ Server Start
app.listen(PORT, () => {
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
