#ifndef APPOINTMENT_SYSTEM_H
#define APPOINTMENT_SYSTEM_H

#include <queue>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
#include <fstream>
#include <ctime>

#include "Appointment.h"
#include "Doctor.h"
#include "SymptomMatcher.h"
#include "../lib/json.hpp"

using json = nlohmann::json;

// Comparator for emergency queue: lower priority = higher urgency
struct AppointmentComparator {
    bool operator()(const Appointment& a, const Appointment& b) const {
        return a.priority > b.priority;
    }
};

class AppointmentSystem {
private:
    std::queue<Appointment> normalQueue; // FCFS queue for normal patients
    std::priority_queue<Appointment, std::vector<Appointment>, AppointmentComparator> emergencyQueue; // Min-heap for emergencies
    std::vector<Doctor> doctors;

    const std::string doctorDailyFile = "data/doctors_daily.json";
    const std::string appointmentFile = "data/appointments.json";

    void loadDoctors();
    void updateDoctorDailyFile();
    void saveAppointment(const Appointment& a); // Save appointment and update files

public:
    AppointmentSystem(); // Constructor

    std::string getSpecializationFromSymptom(const std::string& symptoms) const;

    Doctor assignDoctor(const std::string& specialization);

    Appointment processBooking(int patientID, const std::string& name, const std::string& symptoms, bool isEmergency, int priority);

    Appointment getNextAppointment();

    void clearAll();
};


std::string getReadableTime(long timestamp);

#endif // APPOINTMENT_SYSTEM_H
