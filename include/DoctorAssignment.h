#ifndef DOCTOR_ASSIGNMENT_H
#define DOCTOR_ASSIGNMENT_H

#include <vector>
#include <queue>
#include <fstream>
#include <unordered_map>
#include "../lib/json.hpp"
#include "Doctor.h"

using json = nlohmann::json;
using namespace std;

// Comparator for min-heap based on currentPatients
struct DoctorComparator {
    bool operator()(const Doctor* a, const Doctor* b) const {
        return a->currentPatients > b->currentPatients;
    }
};

class DoctorAssignment {
private:
    vector<Doctor> allDoctors;
    string permanentDoctorFile = "data/doctors.json";
    string dailyDoctorFile = "data/doctors_daily.json";

    unordered_map<string, priority_queue<Doctor*, vector<Doctor*>, DoctorComparator>> specialtyMap;

    // Generate doctors_daily.json from permanent one if not exists
    void initializeDailyFromPermanent() {
        ifstream base(permanentDoctorFile);
        ofstream daily(dailyDoctorFile);
        if (base && daily) {
            json data;
            base >> data;
            for (auto& d : data) {
                d["currentPatients"] = 0;
                d["available"] = true;
            }
            daily << data.dump(4);
        }
    }

    void loadDoctors() {
        ifstream inFile(dailyDoctorFile);
        if (!inFile) {
            initializeDailyFromPermanent();
            inFile.open(dailyDoctorFile);
        }

        json j;
        if (inFile) {
            inFile >> j;
            for (auto& el : j) {
                Doctor d;
                d.id = el["id"];
                d.name = el["name"];
                d.specialization = el["specialization"];
                d.currentPatients = el["currentPatients"];
                d.available = el["available"];
                allDoctors.push_back(d);
            }

            // Load pointers into the queue from allDoctors vector
            for (auto& d : allDoctors) {
                if (d.available)
                    specialtyMap[d.specialization].push(&d);
            }
        }
    }

    void saveDoctors() {
        json j = json::array();
        for (const auto& d : allDoctors) {
            j.push_back({
                {"id", d.id},
                {"name", d.name},
                {"specialization", d.specialization},
                {"currentPatients", d.currentPatients},
                {"available", d.available}
            });
        }

        ofstream outFile(dailyDoctorFile);
        outFile << j.dump(4);
    }

public:
    DoctorAssignment(const string& customDailyFile = "data/doctors_daily.json") {
        dailyDoctorFile = customDailyFile;
        loadDoctors();
    }

    Doctor* assignDoctor(const string& specialization) {
        if (specialtyMap[specialization].empty()) {
            if (!specialtyMap["General"].empty()) {
                return assignDoctor("General");
            }
            return nullptr;
        }

        Doctor* top = specialtyMap[specialization].top();
        specialtyMap[specialization].pop();

        top->currentPatients++;
        if (top->currentPatients >= 10) {
            top->available = false;
        } else {
            specialtyMap[specialization].push(top);
        }

        saveDoctors();
        return top;
    }

    const vector<Doctor>& getAllDoctors() const {
        return allDoctors;
    }
};

#endif
