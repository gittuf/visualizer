// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package services

import (
	"path/filepath"
	"strings"

	"github.com/gittuf/visualizer/go-backend/internal/models"
)

func QueryPolicy(root, targets models.MetadataResponse, branch, changedPath string) models.PolicyQueryResponse {
	delegations, _ := targets["delegations"].(map[string]interface{})
	roles, _ := delegations["roles"].([]interface{})
	principalNames := buildPolicyPrincipalNames(root, targets)
	matchedRule := changedPath
	requiredApprovals := 0
	authorizedUsers := []string{}
	hasSpecificMatch := false

	for _, roleValue := range roles {
		role, ok := roleValue.(map[string]interface{})
		if !ok {
			continue
		}

		if !roleMatches(role, branch, changedPath) {
			continue
		}

		roleName := asPolicyString(role["name"])
		isDefaultAllowRule := roleName == "gittuf-allow-rule"
		if roleName != "" && (!hasSpecificMatch || !isDefaultAllowRule) {
			matchedRule = roleName
			if !isDefaultAllowRule {
				hasSpecificMatch = true
			}
		}

		if threshold, ok := role["threshold"].(float64); ok && int(threshold) > requiredApprovals {
			requiredApprovals = int(threshold)
		}

		principalIDs := getPolicyPrincipalIDs(role)
		if isDefaultAllowRule && len(principalIDs) == 0 {
			authorizedUsers = append(authorizedUsers, "Anyone")
			continue
		}

		for _, principalID := range principalIDs {
			if principalID == "" {
				continue
			}
			authorizedUsers = append(authorizedUsers, principalNames[principalID])
		}
	}

	return models.PolicyQueryResponse{
		MatchedBranch:     branch,
		MatchedRule:       matchedRule,
		RequiredApprovals: requiredApprovals,
		AuthorizedUsers:   uniquePolicyStrings(authorizedUsers),
	}
}

func roleMatches(role map[string]interface{}, branch, changedPath string) bool {
	paths, _ := role["paths"].([]interface{})
	branchPattern := "git:refs/heads/" + branch
	queryingRef := strings.HasPrefix(changedPath, "git:refs/")
	branchMatched := false
	fileMatched := false
	hasBranchPath := false
	refMatched := false

	for _, pathValue := range paths {
		path := asPolicyString(pathValue)
		if path == "" {
			continue
		}

		if strings.HasPrefix(path, "git:refs/") {
			if queryingRef {
				if matchesPolicyPath(path, changedPath) {
					refMatched = true
				}
				continue
			}

			if strings.HasPrefix(path, "git:refs/heads/") {
				hasBranchPath = true
				if matchesPolicyPath(path, branchPattern) {
					branchMatched = true
				}
			}
			continue
		}

		if !queryingRef && matchesPolicyPath(path, changedPath) {
			fileMatched = true
		}
	}

	if queryingRef {
		return refMatched
	}

	if !hasBranchPath {
		branchMatched = true
	}

	return branchMatched && fileMatched
}

func matchesPolicyPath(pattern, changedPath string) bool {
	if pattern == "*" {
		return true
	}

	if strings.HasSuffix(pattern, "/**") {
		return strings.HasPrefix(changedPath, strings.TrimSuffix(pattern, "/**")+"/")
	}

	matched, err := filepath.Match(pattern, changedPath)
	return err == nil && matched
}

func buildPolicyPrincipalNames(root, targets models.MetadataResponse) map[string]string {
	names := map[string]string{}

	if principals, ok := root["principals"].(map[string]interface{}); ok {
		for principalID := range principals {
			names[principalID] = principalID
		}
	}

	delegations, _ := targets["delegations"].(map[string]interface{})
	if principals, ok := delegations["principals"].(map[string]interface{}); ok {
		for principalID, principalValue := range principals {
			name := principalID
			if principal, ok := principalValue.(map[string]interface{}); ok {
				if personID := asPolicyString(principal["personID"]); personID != "" {
					name = personID
				}
			}
			names[principalID] = name
		}
	}

	return names
}

func getPolicyPrincipalIDs(role map[string]interface{}) []string {
	values, _ := role["principalIDs"].([]interface{})
	if len(values) == 0 {
		values, _ = role["principalIds"].([]interface{})
	}
	if len(values) == 0 {
		values, _ = role["principalids"].([]interface{})
	}
	if len(values) == 0 {
		values, _ = role["authorizedPrincipalIDs"].([]interface{})
	}
	if len(values) == 0 {
		values, _ = role["authorizedPrincipalIds"].([]interface{})
	}
	if len(values) == 0 {
		values, _ = role["authorizedPrincipals"].([]interface{})
	}
	if len(values) == 0 {
		values, _ = role["principals"].([]interface{})
	}

	principalIDs := make([]string, 0, len(values))
	for _, value := range values {
		switch typed := value.(type) {
		case string:
			principalIDs = append(principalIDs, typed)
		case map[string]interface{}:
			principalIDs = append(principalIDs,
				asPolicyString(typed["id"]),
				asPolicyString(typed["name"]),
				asPolicyString(typed["principalID"]),
				asPolicyString(typed["principalId"]),
				asPolicyString(typed["keyid"]),
			)
		}
	}

	return uniquePolicyStrings(principalIDs)
}

func asPolicyString(value interface{}) string {
	stringValue, _ := value.(string)
	return stringValue
}

func uniquePolicyStrings(values []string) []string {
	unique := make([]string, 0, len(values))
	seen := map[string]bool{}

	for _, value := range values {
		if value == "" || seen[value] {
			continue
		}
		seen[value] = true
		unique = append(unique, value)
	}

	return unique
}
