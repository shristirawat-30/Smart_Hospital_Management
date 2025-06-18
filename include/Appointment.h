#ifndef APPOINTMENT_H
#define APPOINTMENT_H

#include <string>
#include <ctime>  // for std::time_t

// Represents an appointment between a patient and a doctor
struct Appointment {
    int patientID;              // ID of the patient
    std::string patientName;    // Name of the patient
    bool isEmergency;           // Whether it's an emergency case
    int priority;               // Priority level (lower = more urgent)
    std::string specialization; // Required/assigned specialization
    int doctorID;               // ID of the assigned doctor
    std::string doctorName;     // Name of the doctor
    std::time_t timestamp;      // Time of booking (UNIX time)
};

#endif // APPOINTMENT_H
