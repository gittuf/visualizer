// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package models

type ErrorResponse struct {
	Error   string `json:"error"`
	Code    int    `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

type CommitsResponse []Commit
type MetadataResponse map[string]interface{}

type PolicySnapshotResponse struct {
	Root    MetadataResponse `json:"root"`
	Targets MetadataResponse `json:"targets"`
}

type PolicyQueryResponse struct {
	MatchedBranch     string   `json:"matchedBranch"`
	MatchedRule       string   `json:"matchedRule"`
	RequiredApprovals int      `json:"requiredApprovals"`
	AuthorizedUsers   []string `json:"authorizedUsers"`
}
