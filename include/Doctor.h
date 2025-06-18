#ifndef DOCTOR_H
#define DOCTOR_H

#include <string>

struct Doctor {
    int id;
    std::string name;
    std::string specialization;
    bool available;
    int currentPatients;

    // For min-heap priority queue (least loaded doctor first)
    bool operator>(const Doctor& other) const {
        return currentPatients > other.currentPatients;
    }
};

#endif
