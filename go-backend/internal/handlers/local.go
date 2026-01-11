// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package handlers

import (
	"fmt"
	"net/http"

	"github.com/gittuf/visualizer/go-backend/internal/logger"
	"github.com/gittuf/visualizer/go-backend/internal/models"
	"github.com/gittuf/visualizer/go-backend/internal/services"
	"github.com/gittuf/visualizer/go-backend/internal/validation"

	"github.com/gin-gonic/gin"
)

// Lists commits from local repo's HEAD
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

	// Get commits from HEAD
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
