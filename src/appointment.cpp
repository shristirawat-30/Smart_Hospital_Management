#include "../include/AppointmentSystem.h"
#include "../include/DoctorAssignment.h"
#include "../include/Registration.h"
#include "../include/SymptomMatcher.h"
#include "../lib/json.hpp"

#include <iostream>
#include <fstream>
#include <string>
#include <ctime>

using json = nlohmann::json;

// ✅ Convert timestamp to readable format
std::string getReadableTime(long timestamp) {
    std::time_t t = timestamp;
    char buffer[100];
    std::strftime(buffer, sizeof(buffer), "%A, %B %d, %Y, %I:%M:%S %p", std::localtime(&t));
    return std::string(buffer);
}

// Define constructor
AppointmentSystem::AppointmentSystem() {
    // No initialization needed currently
}

// Main booking logic
Appointment AppointmentSystem::processBooking(int patientID, const std::string& patientName, const std::string& symptoms, bool isEmergency, int priority) {
    SymptomMatcher matcher;
    std::string specialization = matcher.matchSpecialization(symptoms);

    DoctorAssignment doctorAssigner;
    Doctor* assignedDoctor = doctorAssigner.assignDoctor(specialization);

    if (!assignedDoctor) {
        // No doctor assigned
        return Appointment{
            patientID,
            patientName,
            isEmergency,
            priority,
            specialization,
            -1,
            "Not Assigned",
            static_cast<long>(std::time(nullptr))
        };
    }

    Appointment app;
    app.patientID = patientID;
    app.patientName = patientName;
    app.isEmergency = isEmergency;
    app.priority = priority;
    app.specialization = assignedDoctor->specialization;
    app.doctorID = assignedDoctor->id;
    app.doctorName = assignedDoctor->name;
    app.timestamp = static_cast<long>(std::time(nullptr));

    saveAppointment(app);
    return app;
}

// Save appointment and update doctor workload
void AppointmentSystem::saveAppointment(const Appointment& app) {
    // Step 1: Append to appointments.json
    std::ifstream inFile("data/appointments.json");
    json appointments = json::array();
    if (inFile) {
        inFile >> appointments;
        inFile.close();
    }

    json newAppointment = {
        {"patientID", app.patientID},
        {"patientName", app.patientName},
        {"doctorID", app.doctorID},
        {"doctorName", app.doctorName},
        {"specialization", app.specialization},
        {"isEmergency", app.isEmergency},
        {"priority", app.priority},
        {"timestamp", getReadableTime(app.timestamp)}  // ✅ Human-readable timestamp
    };

    appointments.push_back(newAppointment);
    std::ofstream outFile("data/appointments.json");
    outFile << appointments.dump(4);

    // Step 2: Update doctor workload in doctors_daily.json
    std::ifstream docIn("data/doctors_daily.json");
    json doctorsDaily;
    if (docIn) {
        docIn >> doctorsDaily;
        docIn.close();
    }

    std::ofstream docOut("data/doctors_daily.json");
    docOut << doctorsDaily.dump(4);
}
