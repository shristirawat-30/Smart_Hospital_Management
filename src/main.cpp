#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>
#include <ctime>  //  Needed for timestamp conversion
#include "json.hpp"

#include "AppointmentSystem.h"
#include "Patient.h"  // Contains full Patient struct

using json = nlohmann::json;
using namespace std;

//  Function to convert UNIX timestamp to readable time
string getReadableTime(time_t timestamp) {
    char buffer[100];
    strftime(buffer, sizeof(buffer), "%A, %B %d, %Y, %I:%M:%S %p", localtime(&timestamp));
    return string(buffer);
}

// Load patient list from JSON file
vector<Patient> loadPatients(const string& filePath) {
    vector<Patient> patients;
    ifstream file(filePath);
    if (!file) {
        cerr << R"({"success": false, "message": "Could not open patients.json"})" << endl;
        return patients;
    }

    json j;
    file >> j;

    for (const auto& p : j) {
        if (p.contains("id") && p.contains("name") && p.contains("symptoms")) {
            Patient patient;
            patient.id = p["id"];
            patient.name = p["name"];
            patient.symptoms = p["symptoms"];
            patients.push_back(patient);
        }
    }

    return patients;
}

int main(int argc, char* argv[]) {
    if (argc < 4) {
        cout << R"({"success": false, "message": "Missing arguments. Usage: ./appointmentSystem <patientID> <isEmergency> <priority>"})" << endl;
        return 1;
    }

    // Parse command line arguments safely
    int patientID = stoi(argv[1]);
    bool isEmergency = stoi(argv[2]) != 0;
    int priority = stoi(argv[3]);

    // Load patients from JSON
    vector<Patient> patients = loadPatients("data/patients.json");
    if (patients.empty()) {
        cout << R"({"success": false, "message": "No patients data found"})" << endl;
        return 1;
    }

    // Find the patient by ID
    auto it = find_if(patients.begin(), patients.end(), [&](const Patient& p) {
        return p.id == patientID;
    });

    if (it == patients.end()) {
        cout << R"({"success": false, "message": "Patient not found"})" << endl;
        return 1;
    }

    // Extract patient details
    string name = it->name;
    string symptoms = it->symptoms;

    // Create AppointmentSystem object and process booking
    AppointmentSystem system;
    Appointment appointment = system.processBooking(patientID, name, symptoms, isEmergency, priority);

    // Output JSON result
    json result = {
        {"success", true},
        {"doctor", appointment.doctorName},
        {"specialization", appointment.specialization},
        {"is_emergency", appointment.isEmergency},
        {"timestamp", getReadableTime(appointment.timestamp)},  //  Output readable time here
        {"patient", {
            {"id", appointment.patientID},
            {"name", appointment.patientName},
            {"symptoms", symptoms}
        }}
    };

    cout << result.dump() << endl;
    return 0;
}
