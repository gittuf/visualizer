// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package handlers

import (
	"net/http"

	"github.com/gittuf/visualizer/go-backend/internal/logger"
	"github.com/gittuf/visualizer/go-backend/internal/models"
	"github.com/gittuf/visualizer/go-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// Lists commits from remote repo's gittuf policy ref
func ListCommits(c *gin.Context) {
	var req models.CommitsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeBindError(c, err)
		return
	}
	if !requireFields(c, "url", req.URL) {
		return
	}

	// Clone and fetch the repository
	repoPath, cleanup, ok := loadRemoteRepo(c, req.URL, "/commits")
	if !ok {
		return
	}
	defer cleanup()

	// Get commits from policy ref
	commits, err := services.GetPolicyCommits(repoPath)
	if err != nil {
		logger.Sugar.Errorf("Exception in /commits: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to retrieve commits",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, commits)
}

// Retrieves decoded metadata from remote repo
func GetMetadata(c *gin.Context) {
	var req models.MetadataRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeBindError(c, err)
		return
	}
	if !requireFields(c, "url", req.URL, "commit", req.Commit) {
		return
	}

	// Clone and fetch the repository
	repoPath, cleanup, ok := loadRemoteRepo(c, req.URL, "/metadata")
	if !ok {
		return
	}
	defer cleanup()

	metadata, err := services.LoadPolicySnapshot(repoPath, req.Commit)
	if err != nil {
		logger.Sugar.Errorf("Exception in /metadata: %v", err)
		writeMetadataError(c, "Failed to decode metadata", err)
		return
	}

	c.JSON(http.StatusOK, metadata)
}

// Retrieves a single decoded metadata file from remote repo
func GetMetadataSingle(c *gin.Context) {
	var req models.MetadataSingleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeBindError(c, err)
		return
	}
	if !requireFields(c, "url", req.URL, "commit", req.Commit, "file", req.File) {
		return
	}

	repoPath, cleanup, ok := loadRemoteRepo(c, req.URL, "/metadata-single")
	if !ok {
		return
	}
	defer cleanup()

	metadata, err := services.DecodeMetadataBlob(repoPath, req.Commit, req.File)
	if err != nil {
		logger.Sugar.Errorf("Exception in /metadata-single: %v", err)
		writeMetadataError(c, "Failed to decode metadata", err)
		return
	}

	c.JSON(http.StatusOK, metadata)
}

func QueryPolicyRemote(c *gin.Context) {
	var req models.PolicyQueryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeBindError(c, err)
		return
	}
	if !requireFields(c, "url", req.URL, "commit", req.Commit, "branch", req.Branch, "changedPath", req.ChangedPath) {
		return
	}

	repoPath, cleanup, ok := loadRemoteRepo(c, req.URL, "/policy-query")
	if !ok {
		return
	}
	defer cleanup()

	snapshot, err := services.LoadPolicySnapshot(repoPath, req.Commit)
	if err != nil {
		logger.Sugar.Errorf("Exception in /policy-query: %v", err)
		writeMetadataError(c, "Failed to load policy metadata", err)
		return
	}

	c.JSON(http.StatusOK, services.QueryPolicy(snapshot, req.Branch, req.ChangedPath))
}
