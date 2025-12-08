// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package logger

import (
	"log"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Sugar *zap.SugaredLogger

// Initialize sets up the zap logger with a default configuration
func Initialize() {
	config := zap.NewProductionConfig()
	config.EncoderConfig.TimeKey = "timestamp"
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	logger, err := config.Build()
	if err != nil {
		log.Fatalf("can't initialize zap logger: %v", err)
	}

	Sugar = logger.Sugar()
}

// Sync flushes any buffered log entries.
// Zap provides a default Sync() function but we wrap it to handle nil logger cases
func Sync() {
	if Sugar == nil {
		return
	}
	_ = Sugar.Sync()
}
