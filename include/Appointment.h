#ifndef APPOINTMENT_H
#define APPOINTMENT_H

#include <string>

struct Appointment {
    int patientID;
    std::string patientName;
    bool isEmergency;
    int priority;
};

#endif
