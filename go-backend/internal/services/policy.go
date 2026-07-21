// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package services

import (
	"sort"
	"strings"

	"github.com/gittuf/visualizer/go-backend/internal/models"
)

type policyRole struct {
	Name         string
	Paths        []string
	PrincipalIDs []string
	Threshold    int
}

// loads the decoded root and targets metadata for a commit.
func LoadPolicySnapshot(repoPath, commitHash string) (models.PolicySnapshotResponse, error) {
	root, err := DecodeMetadataBlob(repoPath, commitHash, "root.json")
	if err != nil {
		return models.PolicySnapshotResponse{}, err
	}

	targets, err := DecodeMetadataBlob(repoPath, commitHash, "targets.json")
	if err != nil {
		return models.PolicySnapshotResponse{}, err
	}

	return models.PolicySnapshotResponse{
		Root:    root,
		Targets: targets,
	}, nil
}

// find the matching rule for a branch/path query and returns its required approvals and auth users.
func QueryPolicy(snapshot models.PolicySnapshotResponse, branch, changedPath string) models.PolicyQueryResponse {
	role := findMatchingRole(snapshot.Targets, branch, changedPath)
	if role == nil {
		return models.PolicyQueryResponse{
			MatchedBranch:     branch,
			MatchedRule:       changedPath,
			RequiredApprovals: 0,
			AuthorizedUsers:   []string{},
		}
	}

	matchedRule := role.Name
	if matchedRule == "" {
		matchedRule = firstNonEmpty(role.Paths, changedPath)
	}

	return models.PolicyQueryResponse{
		MatchedBranch:     branch,
		MatchedRule:       matchedRule,
		RequiredApprovals: role.Threshold,
		AuthorizedUsers:   resolveAuthorizedUsers(snapshot, role.PrincipalIDs),
	}
}

// scans targets delegations and picks the first role that matches the branch/path input.
func findMatchingRole(targets models.MetadataResponse, branch, changedPath string) *policyRole {
	delegations, ok := targets["delegations"].(map[string]interface{})
	if !ok {
		return nil
	}

	rawRoles, ok := delegations["roles"].([]interface{})
	if !ok {
		return nil
	}

	branchRef := normalizeBranch(branch)
	var fallback *policyRole

	for _, rawRole := range rawRoles {
		roleMap, ok := rawRole.(map[string]interface{})
		if !ok {
			continue
		}

		role := policyRole{
			Name:         stringValue(roleMap["name"]),
			Paths:        stringSlice(roleMap["paths"]),
			PrincipalIDs: stringSlice(roleMap["principalIDs"]),
			Threshold:    intValue(roleMap["threshold"]),
		}

		if len(role.Paths) == 0 {
			continue
		}

		matchesBranch := false
		matchesPath := false
		hasBranchPattern := false

		for _, pattern := range role.Paths {
			if strings.HasPrefix(pattern, "git:refs/heads/") {
				hasBranchPattern = true
				if pattern == branchRef {
					matchesBranch = true
				}
				continue
			}

			if matchesPattern(pattern, changedPath) {
				matchesPath = true
			}
		}

		if hasBranchPattern {
			if matchesBranch && (matchesPath || onlyBranchPatterns(role.Paths)) {
				return &role
			}
			continue
		}

		if matchesPath {
			return &role
		}

		if fallback == nil && containsWildcard(role.Paths) {
			roleCopy := role
			fallback = &roleCopy
		}
	}

	return fallback
}

// maps principal IDs from a role to user-facing names when possible.
func resolveAuthorizedUsers(snapshot models.PolicySnapshotResponse, principalIDs []string) []string {
	if len(principalIDs) == 0 {
		return []string{}
	}

	results := make([]string, 0, len(principalIDs))
	seen := map[string]struct{}{}

	targetsDelegations, _ := snapshot.Targets["delegations"].(map[string]interface{})
	targetsPrincipals, _ := targetsDelegations["principals"].(map[string]interface{})
	rootPrincipals, _ := snapshot.Root["principals"].(map[string]interface{})

	for _, principalID := range principalIDs {
		name := principalID

		if principal, ok := targetsPrincipals[principalID].(map[string]interface{}); ok {
			if personID := stringValue(principal["personID"]); personID != "" {
				name = personID
			}
		} else if _, ok := rootPrincipals[principalID]; ok {
			name = principalID
		}

		if _, ok := seen[name]; ok {
			continue
		}
		seen[name] = struct{}{}
		results = append(results, name)
	}

	sort.Strings(results)
	return results
}

// converts a branch name into the git ref format used by policy rules.
func normalizeBranch(branch string) string {
	if strings.HasPrefix(branch, "refs/heads/") {
		return "git:" + branch
	}
	return "git:refs/heads/" + strings.TrimPrefix(branch, "git:refs/heads/")
}

// tells you whether every pattern in the rule is a branch ref pattern.
func onlyBranchPatterns(patterns []string) bool {
	for _, pattern := range patterns {
		if !strings.HasPrefix(pattern, "git:refs/heads/") {
			return false
		}
	}
	return true
}

// tells you whether a rule contains a catch-all path pattern.
func containsWildcard(patterns []string) bool {
	for _, pattern := range patterns {
		if pattern == "*" || pattern == "**" {
			return true
		}
	}
	return false
}

func matchesPattern(pattern, value string) bool {
	switch {
	case pattern == "*" || pattern == "**":
		return true
	case strings.HasSuffix(pattern, "/**"):
		prefix := strings.TrimSuffix(pattern, "/**")
		return value == prefix || strings.HasPrefix(value, prefix+"/")
	case strings.HasSuffix(pattern, "/*"):
		prefix := strings.TrimSuffix(pattern, "/*")
		if !strings.HasPrefix(value, prefix+"/") {
			return false
		}
		rest := strings.TrimPrefix(value, prefix+"/")
		return rest != "" && !strings.Contains(rest, "/")
	default:
		return value == pattern
	}
}

// converts a decoded JSON array into a slice of strings.
func stringSlice(value interface{}) []string {
	items, ok := value.([]interface{})
	if !ok {
		return nil
	}

	result := make([]string, 0, len(items))
	for _, item := range items {
		if str, ok := item.(string); ok && str != "" {
			result = append(result, str)
		}
	}
	return result
}

// reads a string from a decoded JSON field.
func stringValue(value interface{}) string {
	str, _ := value.(string)
	return str
}

// reads an integer value from a decoded JSON field.
func intValue(value interface{}) int {
	switch v := value.(type) {
	case float64:
		return int(v)
	case int:
		return v
	default:
		return 0
	}
}

// returns the first non-empty string in a slice or a fallback value.
func firstNonEmpty(values []string, fallback string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return fallback
}
