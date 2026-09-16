// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package services

import (
	"path/filepath"
	"strings"

	"github.com/gittuf/visualizer/go-backend/internal/models"
)

type policyData struct {
	principalNames map[string]string
	roles          []policyRole
}

type policyRole struct {
	name         string
	paths        []string
	principalIDs []string
	threshold    int
}

func QueryPolicy(root, targets models.MetadataResponse, branch, changedPath string) models.PolicyQueryResponse {
	data := buildPolicyData(root, targets)
	matchedRule := changedPath
	requiredApprovals := 0
	authorizedUsers := []string{}
	hasSpecificMatch := false

	for _, role := range data.roles {
		if !roleMatches(role, branch, changedPath) {
			continue
		}

		isDefaultAllowRule := role.name == "gittuf-allow-rule"
		if role.name != "" && (!hasSpecificMatch || !isDefaultAllowRule) {
			matchedRule = role.name
			if !isDefaultAllowRule {
				hasSpecificMatch = true
			}
		}

		if role.threshold > requiredApprovals {
			requiredApprovals = role.threshold
		}

		if isDefaultAllowRule && len(role.principalIDs) == 0 {
			authorizedUsers = append(authorizedUsers, "Anyone")
			continue
		}

		for _, principalID := range role.principalIDs {
			if principalID == "" {
				continue
			}
			authorizedUsers = append(authorizedUsers, data.principalNames[principalID])
		}
	}

	return models.PolicyQueryResponse{
		MatchedBranch:     branch,
		MatchedRule:       matchedRule,
		RequiredApprovals: requiredApprovals,
		AuthorizedUsers:   uniquePolicyStrings(authorizedUsers),
	}
}

func buildPolicyData(root, targets models.MetadataResponse) policyData {
	return policyData{
		principalNames: buildPolicyPrincipalNames(root, targets),
		roles:          buildPolicyRoles(targets),
	}
}

func roleMatches(role policyRole, branch, changedPath string) bool {
	branchPattern := "git:refs/heads/" + branch
	queryingRef := strings.HasPrefix(changedPath, "git:refs/")
	branchMatched := false
	fileMatched := false
	hasBranchPath := false
	refMatched := false

	for _, path := range role.paths {
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

func buildPolicyRoles(targets models.MetadataResponse) []policyRole {
	delegations, _ := targets["delegations"].(map[string]interface{})
	values, _ := delegations["roles"].([]interface{})
	roles := make([]policyRole, 0, len(values))

	for _, value := range values {
		roleMap, ok := value.(map[string]interface{})
		if !ok {
			continue
		}

		roles = append(roles, policyRole{
			name:         asPolicyString(roleMap["name"]),
			paths:        getPolicyPaths(roleMap),
			principalIDs: getPolicyPrincipalIDs(roleMap),
			threshold:    getPolicyThreshold(roleMap),
		})
	}

	return roles
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

func getPolicyPaths(role map[string]interface{}) []string {
	values, _ := role["paths"].([]interface{})
	paths := make([]string, 0, len(values))
	for _, value := range values {
		if path := asPolicyString(value); path != "" {
			paths = append(paths, path)
		}
	}

	return paths
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

func getPolicyThreshold(role map[string]interface{}) int {
	threshold, _ := role["threshold"].(float64)
	return int(threshold)
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
