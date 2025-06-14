#ifndef REGISTRATION_H
#define REGISTRATION_H

#include <vector>
#include <fstream>
#include <json.hpp>
#include "Patient.h"

using json = nlohmann::json;
using namespace std;

class Registration {
private:
    vector<Patient> patientList;
    string filePath = "data/patients.json";  // ✅ use correct path

    void loadPatients() {
        ifstream inFile(filePath);
        if (inFile) {
            json j;
            inFile >> j;
            for (auto& el : j) {
                Patient p;
                p.id = el["id"];
                p.name = el["name"];
                p.age = el["age"];
                p.sex = el["sex"];
                p.symptoms = el["symptoms"]; // ✅ Make sure symptoms are loaded
                p.mobile = el["mobile"];
                p.address = el["address"];
                patientList.push_back(p);
            }
        }
    }

    void savePatients() {
        json j = json::array();
        for (auto& p : patientList) {
            j.push_back({
                {"id", p.id},
                {"name", p.name},
                {"age", p.age},
                {"sex", p.sex},
                {"symptoms", p.symptoms}, // ✅ Save symptoms
                {"mobile", p.mobile},
                {"address", p.address}
            });
        }
        ofstream outFile(filePath);
        outFile << j.dump(4);
    }

public:
    Registration() {
        loadPatients();
    }

    int registerPatient(Patient p) {
        p.id = patientList.size() + 1;
        patientList.push_back(p);
        savePatients();
        return p.id;
    }

    Patient* findPatientByID(int id) {
        for (auto& p : patientList) {
            if (p.id == id) return &p;
        }
        return nullptr;
    }

    Patient* findPatientByMobile(const string& mobile) {
        for (auto& p : patientList) {
            if (p.mobile == mobile) return &p;
        }
        return nullptr;
    }
};

#endif
