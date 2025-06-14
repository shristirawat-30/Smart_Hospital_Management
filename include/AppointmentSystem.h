#ifndef APPOINTMENT_SYSTEM_H
#define APPOINTMENT_SYSTEM_H

#include <queue>
#include <vector>
#include "Appointment.h"

using namespace std;

// Custom comparator for min-heap (lower priority value = higher priority)
struct AppointmentComparator {
    bool operator()(const Appointment& a, const Appointment& b) const {
        return a.priority > b.priority;
    }
};

class AppointmentSystem {
private:
    queue<Appointment> normalQueue;
    priority_queue<Appointment, vector<Appointment>, AppointmentComparator> emergencyQueue;

public:
    void bookAppointment(const Appointment& a) {
        if (a.isEmergency) {
            emergencyQueue.push(a);
        } else {
            normalQueue.push(a);
        }
    }

    Appointment getNextAppointment() {
        if (!emergencyQueue.empty()) {
            Appointment a = emergencyQueue.top();
            emergencyQueue.pop();
            return a;
        } else if (!normalQueue.empty()) {
            Appointment a = normalQueue.front();
            normalQueue.pop();
            return a;
        }
        return Appointment{-1, "", false, -1};
    }
};

#endif
