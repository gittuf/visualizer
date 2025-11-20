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
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Missing 'url' in request body",
			Code:  http.StatusBadRequest,
		})
		return
	}

	// Clone and fetch the repository
	repoPath, cleanup, err := services.CloneAndFetchRepo(req.URL)
	if err != nil {
		logger.Sugar.Errorf("Exception in /commits: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to clone or fetch repository",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		})
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
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error: "Missing 'url', 'commit', or 'file' in request body",
			Code:  http.StatusBadRequest,
		})
		return
	}

	// Clone and fetch the repository
	repoPath, cleanup, err := services.CloneAndFetchRepo(req.URL)
	if err != nil {
		logger.Sugar.Errorf("Exception in /metadata: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to clone or fetch repository",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		})
		return
	}
	defer cleanup()

	// Decode the metadata blob
	metadata, err := services.DecodeMetadataBlob(repoPath, req.Commit, req.File)
	if err != nil {
		logger.Sugar.Errorf("Exception in /metadata: %v", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to decode metadata",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, metadata)
}
