#ifndef PATIENT_H
#define PATIENT_H

#include <string>

struct Patient {
    std::string name;
    std::string sex;
    std::string symptoms;
    std::string address;
    std::string mobile;
    std::string date;     // ✅ Added for tracking visit/registration date
    int age;
    int id;
    int priority;
};

#endif
