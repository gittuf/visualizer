package tests

import (
	"os"
	"testing"

	"github.com/gittuf/visualizer/go-backend/internal/logger"
)

// TestMain sets up the test environment and initializes the logger.
func TestMain(m *testing.M) {
	logger.Initialize()
	code := m.Run()
	logger.Sync()
	os.Exit(code)
}
