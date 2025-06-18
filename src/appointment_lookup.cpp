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

    int id = stoi(argv[1]);
    ifstream file("data/patients.json");
    if (!file) {
        cerr << R"({"found": false})";
        return 1;
    }

    json data;
    file >> data;

    for (const auto& p : data) {
        if (p.contains("id") && p["id"] == id) {
            json output = {
                {"found", true},
                {"patient", {
                    {"id", p["id"]},
                    {"name", p["name"]},
                    {"age", p["age"]},
                    {"sex", p["sex"]},
                    {"symptoms", p["symptoms"]},
                    {"mobile", p["mobile"]},
                    {"address", p["address"]},
                    {"date", p["date"]}
                }}
            };
            cout << output.dump();
            return 0;
        }
    }

    cout << R"({"found": false})";
    return 0;
}
