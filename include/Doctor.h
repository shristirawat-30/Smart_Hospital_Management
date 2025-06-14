#ifndef DOCTOR_H
#define DOCTOR_H

#include <string>

struct Doctor {
    std::string name, specialization;
    int id;
    int currentPatients;
    bool available;

    // For priority queue (min-heap)
    bool operator>(const Doctor& other) const {
        return currentPatients > other.currentPatients;
    }
};

#endif
