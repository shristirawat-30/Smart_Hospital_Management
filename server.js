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
app.use('/data', express.static(path.join(__dirname, 'data'))); // ✅ This line makes data visible to browser


// Ensure required directories exist
const dataDir = path.join(__dirname, 'data');
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir);

const patientFile = path.join(dataDir, 'patients.json');
const permanentFile = path.join(dataDir, 'permanent_storage.json');

// Utility: Read JSON
function readJSON(fileName) {
    const filePath = path.join(dataDir, fileName);
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return [];
    }
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

// Analytics endpoint
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

    if (!patient.name || !patient.symptoms || !patient.mobile) {
        return res.status(400).json({ message: "Missing required patient fields." });
    }

    let patients = readJSON('patients.json');
    const newId = patients.length > 0 ? patients[patients.length - 1].id + 1 : 1;
    patient.id = newId;

    patients.push(patient);
    fs.writeFileSync(patientFile, JSON.stringify(patients, null, 4));

    appendToPermanentStorage(patient);
    res.status(201).json({ message: "Patient registered", id: newId });
});

// Lookup patient by ID
app.get('/api/patient/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const patients = readJSON('permanent_storage.json');
    const patient = patients.find(p => p.id === id);
    res.json(patient ? { found: true, patient } : { found: false });
});

// Lookup patient by mobile
app.get('/api/patient-mobile/:mobile', (req, res) => {
    const mobile = req.params.mobile;
    const patients = readJSON('permanent_storage.json');
    const patient = patients.find(p => p.mobile === mobile);
    res.json(patient ? { found: true, patient } : { found: false });
});

// C++ Executable Path
const cppAppointmentSystem = path.join(__dirname, 'build', process.platform === 'win32' ? 'hospital_app.exe' : './hospital_app');

// Book appointment (via C++)
app.post('/api/book-appointment', (req, res) => {
    const { id, isEmergency, priority } = req.body;
    if (!id || typeof isEmergency === 'undefined') {
        return res.status(400).json({ success: false, message: "Missing required fields: id or isEmergency" });
    }

    const safePriority = isEmergency ? (priority || 1) : 999;
    const command = `"${cppAppointmentSystem}" ${id} ${isEmergency} ${safePriority}`;

    exec(command, { timeout: 5000 }, (err, stdout, stderr) => {
        if (err) {
            console.error(" C++ Execution Error:", stderr);
            return res.status(500).json({ success: false, message: "C++ execution failed." });
        }

        try {
            const result = JSON.parse(stdout);

            //  Ensure timestamp is included and passed to frontend
            const response = {
                success: result.success || false,
                doctor: result.doctor || "Not Assigned",
                specialization: result.specialization || "General",
                is_emergency: result.is_emergency || false,
                timestamp: result.timestamp || null,
                patient: result.patient || null,
                message: result.message || ""
            };

            console.log(" Appointment processed via C++:", response);
            res.json(response);

        } catch (e) {
            console.error(" Invalid JSON from C++:", stdout);
            res.status(500).json({ success: false, message: "Invalid C++ output format." });
        }
    });
});


// Update symptoms for returning patient
app.patch('/api/update-symptoms/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { symptoms, date } = req.body;

    const permanentData = readJSON('permanent_storage.json');
    const patient = permanentData.find(p => p.id === id);
    if (!patient) return res.status(404).json({ error: "Patient not found in permanent storage." });

    const newEntry = { ...patient, symptoms, date };
    writeToFile('patients.json', newEntry);
    appendToPermanentStorage(newEntry);

    res.json({ success: true, message: "Symptoms updated and entry stored." });
});


// New C++-based appointment lookup (only searches today's patients.json)
app.post('/api/appointment-cpp-lookup', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Missing patient ID" });

    const cppExecutable = path.join(__dirname, 'build', process.platform === 'win32' ? 'appointment_lookup.exe' : './appointment_lookup');

    exec(`"${cppExecutable}" ${id}`, { timeout: 5000 }, (err, stdout, stderr) => {
        if (err) {
            console.error("Appointment C++ Lookup Error:", stderr);
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

//patient-analytics

app.get('/api/patient-analytics-today', (req, res) => {
    const allPatients = readJSON('patients.json');

    const totalPatients = allPatients.length;

    const emergencyKeywords = ['emergency', 'serious', 'critical'];
    const emergencyCases = allPatients.filter(p =>
        emergencyKeywords.some(kw => (p.symptoms || "").toLowerCase().includes(kw))
    ).length;

    const averageAge = totalPatients
        ? allPatients.reduce((sum, p) => sum + parseInt(p.age || 0), 0) / totalPatients
        : 0;

    const genderDistribution = { Male: 0, Female: 0, Other: 0 };
    allPatients.forEach(p => {
        const genderRaw = (p.sex || '').trim().toLowerCase();
        if (genderRaw === 'male') genderDistribution.Male++;
        else if (genderRaw === 'female') genderDistribution.Female++;
        else genderDistribution.Other++;
    });

    res.json({
        totalPatients,
        emergencyCases,
        averageAge: parseFloat(averageAge.toFixed(1)),
        genderDistribution
    });
});



//doctor-analytics

app.get('/api/doctor-analytics-today', (req, res) => {
    const doctors = readJSON('daily_doctor.json');  // real-time doctor workload

    const totalDoctors = doctors.length;
    const availableDoctors = doctors.filter(d => d.available).length;

    // Workload info
    const doctorWorkloadComparison = doctors.map(d => ({
        name: d.name,
        workload: d.currentPatients * 10  // assuming max workload is 10 patients = 100%
    }));

    // Average workload
    const averageWorkload = doctorWorkloadComparison.length > 0
        ? parseFloat((doctorWorkloadComparison.reduce((sum, d) => sum + d.workload, 0) / doctorWorkloadComparison.length).toFixed(1))
        : 0;

    // Specialization count
    const specializationDistribution = {};
    for (const doc of doctors) {
        if (!specializationDistribution[doc.specialization]) {
            specializationDistribution[doc.specialization] = 1;
        } else {
            specializationDistribution[doc.specialization]++;
        }
    }

    // Most Popular Department
    let mostPopularDepartment = "";
    let maxCount = 0;
    for (const [spec, count] of Object.entries(specializationDistribution)) {
        if (count > maxCount) {
            maxCount = count;
            mostPopularDepartment = spec;
        }
    }

    // Fully staffed? (Optional logic: e.g. no unavailable doctors)
    const departmentsFullyStaffed = doctors.every(d => d.available);

    res.json({
        totalDoctors,
        availableDoctors,
        averageWorkload,
        doctorWorkloadComparison,
        specializationDistribution,
        mostPopularDepartment,
        departmentsFullyStaffed
    });
});



// Server start
app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
});
