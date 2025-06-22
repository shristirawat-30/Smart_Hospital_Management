#  Smart Hospital Management System

A modern AI-integrated hospital platform that uses **C++**, **Node.js**, and **Web Technologies** to enable **efficient patient registration**, **intelligent symptom analysis**, **automated doctor assignment**, **real-time appointment booking**, and **insightful analytics dashboards**.

---

##  Tech Stack

###  Backend & Core Logic
- **C++**
  -  Binary Search for returning patient lookup
  -  Levenshtein-based Symptom Matcher
  -  Min-Heap for Load Balancing (Doctor assignment)
- **Node.js + Express**
  - RESTful API endpoints
  - File I/O & C++ integration via `child_process`

###  Frontend
- **HTML, CSS, JavaScript**
  - Responsive design with Chart.js for analytics
  - Dynamic UI interactions and dashboard views

###  Data Management
- **JSON Files**
  - `patients.json`, `appointments.json`, `doctors_daily.json`, `permanent_storage.json`

---

##  Core Features

### 1️ Patient Registration
- Unique ID-based and mobile-based returning patient identification
- Registration stored in:
  - `patients.json` → Temporary (Today's records)
  - `permanent_storage.json` → Permanent log
- Auto-timestamp for medical records

### 2 Symptom Matching (AI Logic)
- Matches symptoms to relevant departments using **Levenshtein distance**
- Supports minor typos and similar symptom patterns

### 3️ Doctor Assignment System
- Greedy strategy using **min-heap**
- Assigns doctor based on:
  - Specialization
  - Lowest current workload (`doctors_daily.json` is updated in real-time)

### 4️ Appointment Scheduling
- **Emergency cases:** High-priority queue
- **Normal cases:** First-Come-First-Serve (FCFS) with load balancing
- All appointments stored in `appointments.json` with real timestamps

---

##  Analytics Dashboard

- All analytics pages are interactive and powered by real-time JSON data and Chart.js visualizations.

###  Patient Analytics
- Total patients today
- Emergency cases
- Average age of patients
- Gender distribution (Pie Chart)
- Real-time alerts & insights

###  Appointment Analytics
- Appointment trends across weekdays (Line Chart)
- Emergency vs Regular vs Follow-ups (Doughnut Chart)
- Recent appointment logs with types and patient names

###  Doctor Analytics
- Doctor availability
- Average workload percentage
- Specialization distribution (Bar Chart)
- Doctor-wise workload comparison (Bar Chart)
- Top-performing doctors list
- Department summary & staffing status

###  Doctor Category Analytics
- Visualization of doctor count across departments
- Specialization frequency chart + tabular listing

---

##  Data Management & Export

- **Export CSV** for:
  - `patients.json`
  - `appointments.json`
  - `doctors_daily.json`
- **Reset Functions** (POST endpoints):
  - Clear appointments
  - Clear today's patients
  - Reset doctor workload to 0

---

### Run Locally

- git clone https://github.com/shristirawat-30/Smart_Hospital_Management.git
- cd Smart_Hospital_Management
- npm install
- node server.js

