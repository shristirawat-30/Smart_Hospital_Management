#ifndef PATIENT_H
#define PATIENT_H

#include <string>

struct Patient {
    std::string name, sex, symptoms, address, mobile;
    int age, id, priority;
};

#endif
