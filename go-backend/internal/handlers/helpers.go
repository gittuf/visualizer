// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/gittuf/visualizer/go-backend/internal/logger"
	"github.com/gittuf/visualizer/go-backend/internal/models"
	"github.com/gittuf/visualizer/go-backend/internal/services"
	"github.com/gittuf/visualizer/go-backend/internal/validation"
	"github.com/go-git/go-git/v5/plumbing/object"

	"github.com/gin-gonic/gin"
)

func loadRemoteRepo(c *gin.Context, url, endpoint string) (string, func(), bool) {
	repoPath, cleanup, err := services.CloneAndFetchRepo(url)
	if err != nil {
		logger.Sugar.Errorf("Exception in %s: %v", endpoint, err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to clone or fetch repository",
			Code:    http.StatusInternalServerError,
			Details: err.Error(),
		})
		return "", nil, false
	}

	return repoPath, cleanup, true
}

func validateLocalRepoPath(c *gin.Context, path string) (string, bool) {
	absPath, err := validation.GetAbsolutePath(path)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid path",
			Code:    http.StatusBadRequest,
			Details: err.Error(),
		})
		return "", false
	}

	if !validation.PathExists(absPath) {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   fmt.Sprintf("Path does not exist: %s", absPath),
			Code:    http.StatusBadRequest,
			Details: absPath,
		})
		return "", false
	}

	if !validation.IsValidGitRepo(absPath) {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   fmt.Sprintf("Not a valid Git repository: %s", absPath),
			Code:    http.StatusBadRequest,
			Details: absPath,
		})
		return "", false
	}

	return absPath, true
}

func writeBindError(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, models.ErrorResponse{
		Error:   "Invalid request body",
		Code:    http.StatusBadRequest,
		Details: err.Error(),
	})
}

func requireFields(c *gin.Context, fields ...string) bool {
	missing := make([]string, 0, len(fields)/2)
	for i := 0; i+1 < len(fields); i += 2 {
		if fields[i+1] == "" {
			missing = append(missing, fmt.Sprintf("'%s'", fields[i]))
		}
	}
	if len(missing) == 0 {
		return true
	}

	c.JSON(http.StatusBadRequest, models.ErrorResponse{
		Error: fmt.Sprintf("Missing required field(s): %s", strings.Join(missing, ", ")),
		Code:  http.StatusBadRequest,
	})
	return false
}

func writeMetadataError(c *gin.Context, action string, err error) {
	status := http.StatusInternalServerError
	if errors.Is(err, object.ErrFileNotFound) {
		status = http.StatusNotFound
	}

	c.JSON(status, models.ErrorResponse{
		Error:   action,
		Code:    status,
		Details: err.Error(),
	})
}
