#  Smart Hospital Management System

A modern, AI-integrated hospital platform built with **C++** and **Node.js** for efficient patient registration, symptom analysis, doctor assignment, appointment scheduling, and future-ready analytics.

---

##  Tech Stack

- **C++**
  - Binary Search for fast patient lookup
  - Levenshtein-based String Matching (Symptom Matcher)
  - Min-Heap Load Balancing (Doctor workload)
- **Node.js + Express.js**
  - REST API handling
  - C++ integration using `child_process`
- **HTML, CSS, JavaScript**
  - Responsive and dynamic frontend
- **JSON**
  - Lightweight data storage (doctors, patients, appointments)

---

##  Features Implemented

###  Patient Registration

- New patients fill in details (name, age, sex, symptoms, etc.).
- Returning patients are looked up via:
  - **ID-based Binary Search** or
  - **Mobile Number-based fallback**
- Data is stored in two ways:
  - `patients.json` → **Today's working file**
  - `permanent_storage.json` → **History log** (immutable)
- **Live timestamping** for every update.

###  Symptom Matcher

- Implements **Levenshtein Distance** algorithm.
- Matches patient symptoms with doctor specialization dynamically.
- Supports typos and partial keyword matching.

###  Doctor Assignment

- Matches based on specialization.
- Chooses doctor with **lowest workload** (Greedy using Min-Heap).
- Uses `doctors_daily.json` to update and reflect real-time workload changes.

###  Appointment Booking

- Emergency patients:
  - Go directly to doctors with **highest priority**.
  - Scheduled using **priority queue**.
- Normal patients:
  - Handled on **FCFS (First-Come-First-Serve)** with load balancing.
- Stored in `appointments.json` with **readable timestamps**.

###  Analytics (Coming Next)

- Planned features:
  - Patients per specialization chart
  - Doctor-wise load trends
  - Daily visit trends

---

##  File Structure

