// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package main

import (
	"log"
	"os"

	"github.com/gittuf/visualizer/go-backend/internal/handlers"
	"github.com/gittuf/visualizer/go-backend/internal/logger"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Initialize zap logger
	logger.Initialize()
	defer logger.Sync()

	// Initialize Gin router
	router := gin.Default()

	// CORS configuration for React frontend
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{
		"http://localhost:3000",
		"http://localhost:5173",
	}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	router.Use(cors.New(config))

	// Remote repository endpoints
	router.POST("/commits", handlers.ListCommits)
	router.POST("/metadata", handlers.GetMetadata)

	// Local repository endpoints
	router.POST("/commits-local", handlers.ListCommitsLocal)
	router.POST("/metadata-local", handlers.GetMetadataLocal)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	if err := router.Run(":" + port); err != nil {
		logger.Sugar.Fatal(err)
	}
}
