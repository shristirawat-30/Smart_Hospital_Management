#ifndef PATIENT_H
#define PATIENT_H

#include <string>

struct Patient {
    int id;
    std::string name;
    int age;
    std::string sex;
    std::string symptoms;
    std::string address;
    std::string mobile;
    std::string date;      // Optional: Visit/registration date (ISO or simple format)

    // Optional: used only during emergency booking, not stored in base patient.json
    int priority{-1};  // default value
};

#endif
