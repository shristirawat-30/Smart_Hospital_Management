#include <iostream>
#include <fstream>
#include "../lib/json.hpp"
#include "../include/Registration.h"

using json = nlohmann::json;

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << R"({"found": false})";
        return 1;
    }

    std::string query = argv[1];
    Registration reg;
    Patient* p = nullptr;

    if (isdigit(query[0])) {
        int id = std::stoi(query);
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
                {"address", p->address}
            }}
        };
        std::cout << output.dump();
    } else {
        std::cout << R"({"found": false})";
    }

    return 0;
}
