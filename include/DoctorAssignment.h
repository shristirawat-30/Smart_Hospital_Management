#ifndef DOCTOR_ASSIGNMENT_H
#define DOCTOR_ASSIGNMENT_H

#include <vector>
#include <queue>
#include <fstream>
//#include <json.hpp>
#include "json.hpp"

#include "Doctor.h"

using json = nlohmann::json;
using namespace std;

class DoctorAssignment {
private:
    vector<Doctor> allDoctors;
    string doctorFile = "data/doctors.json";

    unordered_map<string, priority_queue<Doctor, vector<Doctor>, greater<>>> specialtyMap;

    void loadDoctors() {
        ifstream inFile(doctorFile);
        if (inFile) {
            json j;
            inFile >> j;
            for (auto& el : j) {
                Doctor d;
                d.id = el["id"];
                d.name = el["name"];
                d.specialization = el["specialization"];
                d.currentPatients = el["currentPatients"];
                d.available = el["available"];
                allDoctors.push_back(d);

                // Add to specialization-based min-heap if available
                if (d.available)
                    specialtyMap[d.specialization].push(d);
            }
        }
    }

    void saveDoctors() {
        json j = json::array();
        for (auto& d : allDoctors) {
            j.push_back({
                {"id", d.id},
                {"name", d.name},
                {"specialization", d.specialization},
                {"currentPatients", d.currentPatients},
                {"available", d.available}
            });
        }
        ofstream outFile(doctorFile);
        outFile << j.dump(4);
    }

public:
    DoctorAssignment() { loadDoctors(); }

    Doctor* assignDoctor(const string& specialization) {
        auto& pq = specialtyMap[specialization];

        if (pq.empty()) {
            return nullptr;
        }

        Doctor top = pq.top();
        pq.pop();

        // Update in allDoctors
        for (auto& d : allDoctors) {
            if (d.id == top.id) {
                d.currentPatients++;
                if (d.currentPatients > 10) {
                    d.available = false;
                } else {
                    specialtyMap[specialization].push(d); // reinsert with updated load
                }
                saveDoctors();
                return &d;
            }
        }

        return nullptr;
    }
};

#endif

