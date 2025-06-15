const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process'); // <- Added for C++ integration

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
        console.error(` Error reading ${fileName}:`, error.message);
        return null;
    }
}

//  ROUTES

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/doctors', (req, res) => {
    const doctors = readJSON('doctors.json');
    if (doctors) res.json(doctors);
    else res.status(500).json({ error: 'Failed to load doctors data.' });
});

app.get('/api/patients', (req, res) => {
    const patients = readJSON('patients.json');
    if (patients) res.json(patients);
    else res.status(500).json({ error: 'Failed to load patients data.' });
});

app.get('/api/appointments', (req, res) => {
    const appointments = readJSON('appointments.json');
    if (appointments) res.json(appointments);
    else res.status(500).json({ error: 'Failed to load appointments data.' });
});

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

//  C++ Execution Route
app.post('/run-cpp', (req, res) => {
    const cppExecutablePath = path.join(__dirname, 'build', 'hospital_app');

    exec(cppExecutablePath, (err, stdout, stderr) => {
        if (err) {
            console.error(` Error executing C++ app:`, stderr);
            return res.status(500).send('C++ logic execution failed.');
        }

        console.log(` C++ Output:\n${stdout}`);
        res.send({ message: 'C++ logic ran successfully', output: stdout });
    });
});

// POST: Register new patient and update patients.json
app.post('/api/register', (req, res) => {
    const patient = req.body;

    const filePath = path.join(dataDir, 'patients.json');
    let patients = [];

    try {
        if (fs.existsSync(filePath)) {
            patients = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }

        // Auto-generate ID
        const newId = patients.length > 0 ? patients[patients.length - 1].id + 1 : 1;
        patient.id = newId;

        patients.push(patient);

        fs.writeFileSync(filePath, JSON.stringify(patients, null, 4));
        console.log(`Registered patient: ${patient.name} (ID: ${newId})`);

        res.status(201).json({ message: "Patient registered successfully", id: newId });
    } catch (error) {
        console.error(" Error saving patient:", error.message);
        res.status(500).json({ error: "Failed to register patient." });
    }
});


//  Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
