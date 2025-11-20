// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package services

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/gittuf/visualizer/go-backend/internal/logger"
	"github.com/gittuf/visualizer/go-backend/internal/models"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
)

// Extract and decode a metadata JSON file from a specific commit
func DecodeMetadataBlob(repoPath, commitHash, metadataFilename string) (models.MetadataResponse, error) {
	logger.Sugar.Infof("Decoding %s at %s", metadataFilename, commitHash)

	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open repository: %w", err)
	}

	hash := plumbing.NewHash(commitHash)
	commit, err := repo.CommitObject(hash)
	if err != nil {
		return nil, fmt.Errorf("failed to get commit: %w", err)
	}

	tree, err := commit.Tree()
	if err != nil {
		return nil, fmt.Errorf("failed to get commit tree: %w", err)
	}

	// Locate metadata file
	metadataPath := fmt.Sprintf("metadata/%s", metadataFilename)
	file, err := tree.File(metadataPath)
	if err != nil {
		if err == object.ErrFileNotFound {
			return nil, fmt.Errorf("file metadata/%s not found in commit", metadataFilename)
		}
		return nil, fmt.Errorf("failed to get file: %w", err)
	}

	contents, err := file.Contents()
	if err != nil {
		return nil, fmt.Errorf("failed to read file contents: %w", err)
	}

	var envelope map[string]interface{}
	if err := json.Unmarshal([]byte(contents), &envelope); err != nil {
		return nil, fmt.Errorf("failed to parse envelope JSON: %w", err)
	}

	payloadB64, ok := envelope["payload"].(string)
	if !ok {
		return nil, fmt.Errorf("payload field not found or not a string")
	}

	// Remove any whitespace/newlines from base64 string
	payloadB64 = strings.TrimSpace(payloadB64)

	decodedBytes, err := base64.StdEncoding.DecodeString(payloadB64)
	if err != nil {
		return nil, fmt.Errorf("failed to decode base64 payload: %w", err)
	}

	var decodedJSON models.MetadataResponse
	if err := json.Unmarshal(decodedBytes, &decodedJSON); err != nil {
		return nil, fmt.Errorf("failed to parse decoded JSON: %w", err)
	}

	return decodedJSON, nil
}
