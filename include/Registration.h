#ifndef REGISTRATION_H
#define REGISTRATION_H

#include <vector>
#include <fstream>
#include <algorithm>
#include "../lib/json.hpp"
#include "Patient.h"

using json = nlohmann::json;
using namespace std;

class Registration {
private:
    vector<Patient> patientList;
    string patientFile = "data/patients.json";
    string permanentFile = "data/permanent_storage.json";

    void loadPatients() {
        ifstream inFile(patientFile);
        if (inFile) {
            json j;
            inFile >> j;
            for (auto& el : j) {
                Patient p;
                p.id = el["id"];
                p.name = el["name"];
                p.age = el["age"];
                p.sex = el["sex"];
                p.symptoms = el["symptoms"];
                p.mobile = el["mobile"];
                p.address = el["address"];
                p.date = el.value("date", "");  // fallback
                patientList.push_back(p);
            }
            // Sort the list by ID for binary search
            sort(patientList.begin(), patientList.end(), [](const Patient& a, const Patient& b) {
                return a.id < b.id;
            });
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
                {"symptoms", p.symptoms},
                {"mobile", p.mobile},
                {"address", p.address},
                {"date", p.date}
            });
        }
        ofstream outFile(patientFile);
        outFile << j.dump(4);
    }

    void appendToPermanentStorage(const Patient& p) {
        json current = json::array();
        ifstream inFile(permanentFile);
        if (inFile) {
            inFile >> current;
        }

        current.push_back({
            {"id", p.id},
            {"name", p.name},
            {"age", p.age},
            {"sex", p.sex},
            {"symptoms", p.symptoms},
            {"mobile", p.mobile},
            {"address", p.address},
            {"date", p.date}
        });

        ofstream outFile(permanentFile);
        outFile << current.dump(4);
    }

public:
    Registration() {
        loadPatients();
    }

    int registerPatient(Patient p) {
        p.id = patientList.empty() ? 1 : patientList.back().id + 1;
        patientList.push_back(p);
        sort(patientList.begin(), patientList.end(), [](const Patient& a, const Patient& b) {
            return a.id < b.id;
        });
        savePatients();
        appendToPermanentStorage(p);
        return p.id;
    }

    Patient* findPatientByID(int id) {
        int low = 0, high = patientList.size() - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (patientList[mid].id == id)
                return &patientList[mid];
            else if (patientList[mid].id < id)
                low = mid + 1;
            else
                high = mid - 1;
        }
        return nullptr;
    }

    Patient* findPatientByMobile(const string& mobile) {
        for (auto& p : patientList) {
            if (p.mobile == mobile)
                return &p;
        }
        return nullptr;
    }
};

#endif
