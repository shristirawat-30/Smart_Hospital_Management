#ifndef SYMPTOM_MATCHER_H
#define SYMPTOM_MATCHER_H

#include <unordered_map>
#include <string>
#include <vector>
#include <algorithm>
#include <sstream>
#include <climits>

class SymptomMatcher {
private:
    std::unordered_map<std::string, std::string> knownSymptoms;
 // Known as edit distance problem-->
    int levenshteinDistance(const std::string& a, const std::string& b) const {
        int m = a.size(), n = b.size();
        std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1));

        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (a[i - 1] == b[j - 1])
                    dp[i][j] = dp[i - 1][j - 1];
                else
                    dp[i][j] = 1 + std::min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
            }
        }
        return dp[m][n];
    }

    static std::string toLower(const std::string& str) {
        std::string lower = str;
        std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
        return lower;
    }

public:
    SymptomMatcher() {
        knownSymptoms = {
            {"chest pain", "Cardiology"},
            {"shortness of breath", "Cardiology"},
            {"skin rash", "Dermatology"},
            {"itching", "Dermatology"},
            {"joint pain", "Orthopedics"},
            {"knee pain", "Orthopedics"},
            {"migraine", "Neurology"},
            {"blurred vision", "Neurology"},
            {"cough", "Pulmonology"},
            {"congestion", "Pulmonology"},
            {"fever", "General"},
            {"headache", "Neurology"},
            {"nausea", "Neurology"},
            {"fatigue", "General"}
        };
    }

    std::string matchSpecialization(const std::string& symptoms) {
        std::string bestMatch = "General";
        int minDistance = INT_MAX;

        for (const auto& entry : knownSymptoms) {
            int dist = levenshteinDistance(toLower(symptoms), toLower(entry.first));
            if (dist < minDistance && dist <= 5) {
                minDistance = dist;
                bestMatch = entry.second;
            }
        }

        return bestMatch;
    }
};

#endif
