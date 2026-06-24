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

// Lists commits from local repo
func ListCommitsLocal(c *gin.Context) {
	var req models.CommitsLocalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeBindError(c, err)
		return
	}
	if !requireFields(c, "path", req.Path) {
		return
	}

	absPath, ok := validateLocalRepoPath(c, req.Path)
	if !ok {
		return
	}

	// Get commits from the local gittuf policy ref
	commits, err := services.GetLocalCommits(absPath)
	if err != nil {
		logger.Sugar.Errorf("Exception in /commits-local: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to load commits",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, commits)
}

// Retrieves decoded metadata from local repo, requires commit to have both root.json and targets.json
func GetMetadataLocal(c *gin.Context) {
	var req models.MetadataLocalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeBindError(c, err)
		return
	}
	if !requireFields(c, "path", req.Path, "commit", req.Commit) {
		return
	}

	absPath, ok := validateLocalRepoPath(c, req.Path)
	if !ok {
		return
	}

	metadata, err := services.LoadPolicySnapshot(absPath, req.Commit)
	if err != nil {
		logger.Sugar.Errorf("Exception in /metadata-local: %v", err)
		writeMetadataError(c, "Failed to fetch metadata", err)
		return
	}

	c.JSON(http.StatusOK, metadata)
}

// Retrieves a single decoded metadata file from local repo
func GetMetadataLocalSingle(c *gin.Context) {
	var req models.MetadataLocalSingleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeBindError(c, err)
		return
	}
	if !requireFields(c, "path", req.Path, "commit", req.Commit, "file", req.File) {
		return
	}

	absPath, ok := validateLocalRepoPath(c, req.Path)
	if !ok {
		return
	}

	metadata, err := services.DecodeMetadataBlob(absPath, req.Commit, req.File)
	if err != nil {
		logger.Sugar.Errorf("Exception in /metadata-local-single: %v", err)
		writeMetadataError(c, "Failed to fetch metadata", err)
		return
	}

	c.JSON(http.StatusOK, metadata)
}

// Queries policy from local repo
func QueryPolicyLocal(c *gin.Context) {
	var req models.PolicyQueryLocalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeBindError(c, err)
		return
	}
	if !requireFields(c, "path", req.Path, "commit", req.Commit, "branch", req.Branch, "changedPath", req.ChangedPath) {
		return
	}

	absPath, ok := validateLocalRepoPath(c, req.Path)
	if !ok {
		return
	}

	snapshot, err := services.LoadPolicySnapshot(absPath, req.Commit)
	if err != nil {
		logger.Sugar.Errorf("Exception in /policy-query-local: %v", err)
		writeMetadataError(c, "Failed to load policy metadata", err)
		return
	}

	c.JSON(http.StatusOK, services.QueryPolicy(snapshot, req.Branch, req.ChangedPath))
}
