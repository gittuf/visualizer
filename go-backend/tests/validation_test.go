package tests

import (
	"os"
	"testing"

	"github.com/gittuf/visualizer/go-backend/internal/validation"
	"github.com/gittuf/visualizer/go-backend/tests/helpers"
	"github.com/stretchr/testify/assert"
)

func TestPathExists(t *testing.T) {
	repoPath, _, cleanup := helpers.SetupTestRepo(t)
	defer cleanup()

	assert.True(t, validation.PathExists(repoPath))
	assert.False(t, validation.PathExists("/nonexistent/path"))
}

func TestIsValidGitRepo(t *testing.T) {
	repoPath, _, cleanup := helpers.SetupTestRepo(t)
	defer cleanup()

	assert.True(t, validation.IsValidGitRepo(repoPath))

	plainDir, err := os.MkdirTemp("", "plain-dir-*")
	assert.NoError(t, err)
	defer os.RemoveAll(plainDir)
	assert.False(t, validation.IsValidGitRepo(plainDir))

	assert.False(t, validation.IsValidGitRepo("/nonexistent/path"))
}

func TestGetAbsolutePath(t *testing.T) {
	absPath, err := validation.GetAbsolutePath(".")
	assert.NoError(t, err)
	assert.True(t, validation.PathExists(absPath))
	t.Logf("Resolved: %s", absPath)
}
