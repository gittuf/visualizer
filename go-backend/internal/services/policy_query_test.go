package services

import (
	"testing"

	"github.com/gittuf/visualizer/go-backend/internal/models"
)

func TestQueryPolicyUsesNormalizedRoles(t *testing.T) {
	root := models.MetadataResponse{
		"principals": map[string]interface{}{
			"key-1": map[string]interface{}{},
		},
	}
	targets := models.MetadataResponse{
		"delegations": map[string]interface{}{
			"principals": map[string]interface{}{
				"person-1": map[string]interface{}{"personID": "alice"},
			},
			"roles": []interface{}{
				map[string]interface{}{
					"name":         "protect-main",
					"paths":        []interface{}{"git:refs/heads/main", "src/**"},
					"principalIDs": []interface{}{"person-1"},
					"threshold":    float64(2),
				},
				map[string]interface{}{
					"name":  "gittuf-allow-rule",
					"paths": []interface{}{"*"},
				},
			},
		},
	}

	response := QueryPolicy(root, targets, "main", "src/app.go")

	if response.MatchedRule != "protect-main" {
		t.Fatalf("MatchedRule = %q, want %q", response.MatchedRule, "protect-main")
	}
	if response.RequiredApprovals != 2 {
		t.Fatalf("RequiredApprovals = %d, want %d", response.RequiredApprovals, 2)
	}
	if len(response.AuthorizedUsers) != 2 || response.AuthorizedUsers[0] != "alice" || response.AuthorizedUsers[1] != "Anyone" {
		t.Fatalf("AuthorizedUsers = %#v, want %#v", response.AuthorizedUsers, []string{"alice", "Anyone"})
	}
}
