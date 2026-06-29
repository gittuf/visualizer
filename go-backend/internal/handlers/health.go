// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// simple health check endpoint for the backend server
func Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "Looks good!",
	})
}
