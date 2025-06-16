#  Smart Hospital Management System

A modern, AI-integrated hospital platform built with C++ and Node.js for efficient patient registration, doctor assignment, appointment scheduling, and analytics.

---

##  Tech Stack

- **C++** – DAA-based core logic (Binary Search, Min-Heap, String Matching)
- **Node.js + Express.js** – Backend server & API handling
- **HTML, CSS, JavaScript** – Responsive and dynamic frontend
- **JSON** – Lightweight storage for patients, doctors, and appointments

---

##  Features (As of Now)

###  Patient Registration
- New patients provide full details with current symptoms.
- Returning patients are searched via **C++-based binary search** (ID or mobile).
- **Live Date-Time** is recorded automatically for every entry or symptom update.
- Symptoms are editable only for today — historical data remains unchanged.

###  Dual JSON Storage System
- `patients.json`: For **today’s records** (editable).
- `permanent_storage.json`: **Non-editable**, full patient logs with time-stamped records of every visit or update.

###  Doctor Assignment
- Auto-matching based on **Levenshtein similarity** between symptoms and specializations.
- Uses **Greedy + Min-Heap Load Balancing** for doctor workload distribution.

###  Appointments
- Scheduled via **priority queues** for emergencies and regular cases.
- Emergency cases skip the line for immediate doctor assignment.

###  Analytics (coming next)
- Interactive charts for patients per department, doctor workloads, and trends.

---

##  Run Locally

```bash
git clone https://github.com/shristirawat-30/Smart_Hospital_Management.git
cd Smart_Hospital_Management
npm install
node server.js
