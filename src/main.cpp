#include <iostream>
#include <fstream>
#include <ctime>
#include "json.hpp"


#include "Patient.h"
#include "Doctor.h"
#include "Appointment.h"
#include "Registration.h"
#include "AppointmentSystem.h"
#include "DoctorAssignment.h"
#include "SymptomMatcher.h"

using namespace std;
using json = nlohmann::json;

int main() {
    Registration reg;
    AppointmentSystem appSys;
    DoctorAssignment docAssign;

    while (true) {
        cout << "\n--- Smart Hospital Management System ---\n";
        cout << "1. Register Patient\n";
        cout << "2. Book Appointment\n";
        cout << "3. Get Next Appointment\n";
        cout << "4. Exit\n";
        cout << "Enter your choice: ";
        int choice;
        cin >> choice;

        if (choice == 1) {
            Patient p;
            cout << "Enter Name: "; cin >> ws; getline(cin, p.name);
            cout << "Enter Age: "; cin >> p.age;
            cout << "Enter Sex: "; cin >> p.sex;
            cout << "Enter Symptoms: "; cin >> ws; getline(cin, p.symptoms);
            cout << "Enter Mobile: "; cin >> p.mobile;
            cout << "Enter Address: "; cin >> ws; getline(cin, p.address);
            int id = reg.registerPatient(p);
            cout << "Patient Registered. ID: " << id << endl;

        } else if (choice == 2) {
            int id;
            cout << "Enter Patient ID: ";
            cin >> id;
            Patient* p = reg.findPatientByID(id);
            if (!p) {
                string mob;
                cout << "ID not found. Enter Mobile Number: ";
                cin >> mob;
                p = reg.findPatientByMobile(mob);
            }
            if (!p) {
                cout << "Patient not found. Please register first." << endl;
                continue;
            }

            Appointment a;
            a.patientID = p->id;
            a.patientName = p->name;

            cout << "Is it an emergency case? (1 for Yes / 0 for No): ";
            cin >> a.isEmergency;
            if (a.isEmergency) {
                cout << "Enter Emergency Priority (lower number = more urgent): ";
                cin >> a.priority;
            }

            SymptomMatcher matcher;
            string specialization = matcher.matchSpecialization(p->symptoms);
            cout << "Detected specialization: " << specialization << endl;

            Doctor* doc = docAssign.assignDoctor(specialization);
            if (!doc && specialization != "General") {
                cout << "No doctor available in " << specialization << ". Trying General..." << endl;
                doc = docAssign.assignDoctor("General");
                if (!doc) {
                    cout << "No doctor available in General either." << endl;
                    continue;
                }
            }

            if (doc) {
                cout << "Assigned Doctor: " << doc->name << " (ID: " << doc->id << ")" << endl;
            }

            // Save appointment to appointments.json
            json j;
            ifstream in("data/appointments.json");
            if (in) in >> j;
            in.close();

            json newApp = {
                {"patient_id", a.patientID},
                {"patient_name", a.patientName},
                {"is_emergency", a.isEmergency},
                {"priority", a.isEmergency ? a.priority : -1},
                {"doctor_id", doc ? doc->id : -1},
                {"doctor_name", doc ? doc->name : "Not Assigned"},
                {"specialization", specialization},
                {"timestamp", time(nullptr)}
            };

            j.push_back(newApp);

            ofstream out("data/appointments.json");
            out << j.dump(4);
            out.close();

            appSys.bookAppointment(a);
            cout << "Appointment booked and saved successfully." << endl;

        } else if (choice == 3) {
            Appointment a = appSys.getNextAppointment();
            if (a.patientID == -1) {
                cout << "No appointments in queue." << endl;
                continue;
            }
            cout << "Next Patient: " << a.patientName << " (ID: " << a.patientID << ")" << endl;
            string spec;
            cout << "Enter required doctor specialization: ";
            cin >> spec;
            Doctor* doc = docAssign.assignDoctor(spec);
            if (doc) {
                cout << "Assigned Doctor: " << doc->name << " (ID: " << doc->id << ")" << endl;
            } else {
                cout << "No available doctor found." << endl;
            }

        } else if (choice == 4) {
            break;
        } else {
            cout << "Invalid choice. Try again." << endl;
        }
    }

    return 0;
}
