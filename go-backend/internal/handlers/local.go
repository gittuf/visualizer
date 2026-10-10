// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gittuf/visualizer/go-backend/internal/logger"
	"github.com/gittuf/visualizer/go-backend/internal/models"
	"github.com/gittuf/visualizer/go-backend/internal/services"
	"github.com/gittuf/visualizer/go-backend/internal/validation"

	"github.com/gin-gonic/gin"
)

// Lists commits from local repo's gittuf policy ref
func ListCommitsLocal(c *gin.Context) {
	var req models.CommitsLocalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Missing 'path' in request body",
			Code:  http.StatusBadRequest,
		})
		return
	}

	// Get absolute path
	absPath, err := validation.GetAbsolutePath(req.Path)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid path",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		})
		return
	}

	// Check if path exists
	if !validation.PathExists(absPath) {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   fmt.Sprintf("Path does not exist: %s", absPath),
			Code:    http.StatusBadRequest,
			Details: absPath,
		})
		return
	}

	// Check if it's a valid git repository
	if !validation.IsValidGitRepo(absPath) {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   fmt.Sprintf("Not a valid Git repository: %s", absPath),
			Code:    http.StatusBadRequest,
			Details: absPath,
		})
		return
	}

	// Get commits from policy ref
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

// Retrieves decoded metadata from local repo
func GetMetadataLocal(c *gin.Context) {
	var req models.MetadataLocalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Missing 'path', 'commit', or 'file' in request body",
			Code:  http.StatusBadRequest,
		})
		return
	}

	// Get absolute path
	absPath, err := validation.GetAbsolutePath(req.Path)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid path",
			Code:    http.StatusBadRequest,
			Details: err.Error(),
		})
		return
	}

	// Check if path exists
	if !validation.PathExists(absPath) {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   fmt.Sprintf("Path does not exist: %s", absPath),
			Code:    http.StatusBadRequest,
			Details: absPath,
		})
		return
	}

	// Check if it's a valid git repository
	if !validation.IsValidGitRepo(absPath) {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   fmt.Sprintf("Not a valid Git repository: %s", absPath),
			Code:    http.StatusBadRequest,
			Details: absPath,
		})
		return
	}

	// Decode the metadata blob
	metadata, err := services.DecodeMetadataBlob(absPath, req.Commit, req.File)
	if err != nil {
		if strings.Contains(err.Error(), "not found in commit") {
			logger.Sugar.Infof("Missing %s at %s: %v", req.File, req.Commit, err)
			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Error:   "Metadata file not found in commit",
				Code:    http.StatusNotFound,
				Details: err.Error(),
			})
			return
		}
		logger.Sugar.Errorf("Exception in /metadata-local: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to fetch metadata",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, metadata)
}

func QueryPolicyLocal(c *gin.Context) {
	var req models.PolicyQueryLocalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Missing 'path', 'commit', 'branch', or 'changedPath' in request body",
			Code:  http.StatusBadRequest,
		})
		return
	}

	absPath, err := validation.GetAbsolutePath(req.Path)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid path",
			Code:    http.StatusBadRequest,
			Details: err.Error(),
		})
		return
	}

	if !validation.PathExists(absPath) {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   fmt.Sprintf("Path does not exist: %s", absPath),
			Code:    http.StatusBadRequest,
			Details: absPath,
		})
		return
	}

	if !validation.IsValidGitRepo(absPath) {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   fmt.Sprintf("Not a valid Git repository: %s", absPath),
			Code:    http.StatusBadRequest,
			Details: absPath,
		})
		return
	}

	root, err := services.DecodeMetadataBlob(absPath, req.Commit, "root.json")
	if err != nil {
		logger.Sugar.Errorf("Exception in /policy-query-local: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to decode root metadata",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		})
		return
	}

	targets, err := services.DecodeMetadataBlob(absPath, req.Commit, "targets.json")
	if err != nil {
		logger.Sugar.Errorf("Exception in /policy-query-local: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to decode targets metadata",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, services.QueryPolicy(root, targets, req.Branch, req.ChangedPath))
}
