#include <iostream>
#include <fstream>
#include "../lib/json.hpp"
#include "../include/Registration.h"

using namespace std;
using json = nlohmann::json;

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << R"({"found": false})";
        return 1;
    }

    string query = argv[1];
    Registration reg;
    Patient* p = nullptr;

    if (isdigit(query[0])) {
        int id = stoi(query);
        p = reg.findPatientByID(id);
    } else {
        p = reg.findPatientByMobile(query);
    }

    if (p) {
        json output = {
            {"found", true},
            {"patient", {
                {"id", p->id},
                {"name", p->name},
                {"age", p->age},
                {"sex", p->sex},
                {"symptoms", p->symptoms},
                {"mobile", p->mobile},
                {"address", p->address},
                {"date", p->date}
            }}
        };
        cout << output.dump();
    } else {
        cout << R"({"found": false})";
    }

    return 0;
}
