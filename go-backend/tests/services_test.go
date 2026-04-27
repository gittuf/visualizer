package tests

import (
	"os"
	"testing"

	"github.com/gittuf/visualizer/go-backend/internal/services"
	"github.com/gittuf/visualizer/go-backend/tests/helpers"
	"github.com/stretchr/testify/assert"
)

func TestCloneAndFetchRepo_Success(t *testing.T) {
	remotePath, _, cleanupRemote := helpers.SetupTestRepo(t)
	defer cleanupRemote()

	localPath, cleanupLocal, err := services.CloneAndFetchRepo(remotePath)
	assert.NoError(t, err)
	defer cleanupLocal()

	t.Logf("Cloned to: %s", localPath)
	_, statErr := os.Stat(localPath)
	assert.NoError(t, statErr)
}

func TestCloneAndFetchRepo_InvalidURL(t *testing.T) {
	_, _, err := services.CloneAndFetchRepo("invalid-url")
	assert.Error(t, err)
	t.Logf("Error: %v", err)
}

func TestGetPolicyCommits_Success(t *testing.T) {
	remotePath, commitHash, cleanupRemote := helpers.SetupTestRepo(t)
	defer cleanupRemote()

	localPath, cleanupLocal, err := services.CloneAndFetchRepo(remotePath)
	assert.NoError(t, err)
	defer cleanupLocal()

	commits, err := services.GetPolicyCommits(localPath)
	assert.NoError(t, err)
	assert.NotEmpty(t, commits)
	assert.Equal(t, commitHash, commits[0].Hash)
	t.Logf("Retrieved %d policy commit(s), latest: %s", len(commits), commits[0].Hash)
}

func TestGetPolicyCommits_InvalidPath(t *testing.T) {
	_, err := services.GetPolicyCommits("invalid-path")
	assert.Error(t, err)
	t.Logf("Error: %v", err)
}

func TestGetLocalCommits_Success(t *testing.T) {
	repoPath, _, cleanup := helpers.SetupTestRepo(t)
	defer cleanup()

	commits, err := services.GetLocalCommits(repoPath)
	assert.NoError(t, err)
	assert.NotEmpty(t, commits)
	t.Logf("Retrieved %d local commit(s)", len(commits))
}

func TestGetLocalCommits_InvalidPath(t *testing.T) {
	_, err := services.GetLocalCommits("invalid-path")
	assert.Error(t, err)
	t.Logf("Error: %v", err)
}

func TestDecodeMetadataBlob_Success(t *testing.T) {
	remotePath, commitHash, cleanupRemote := helpers.SetupTestRepo(t)
	defer cleanupRemote()

	localPath, cleanupLocal, err := services.CloneAndFetchRepo(remotePath)
	assert.NoError(t, err)
	defer cleanupLocal()

	metadata, err := services.DecodeMetadataBlob(localPath, commitHash, "root.json")
	assert.NoError(t, err)
	assert.NotNil(t, metadata)
	assert.Equal(t, "root", metadata["type"])
	t.Logf("Decoded metadata type: %v", metadata["type"])
}

func TestDecodeMetadataBlob_InvalidPath(t *testing.T) {
	_, err := services.DecodeMetadataBlob("invalid-path", "HEAD", "root.json")
	assert.Error(t, err)
	t.Logf("Error: %v", err)
}

func TestDecodeMetadataBlob_InvalidFile(t *testing.T) {
	remotePath, commitHash, cleanupRemote := helpers.SetupTestRepo(t)
	defer cleanupRemote()

	localPath, cleanupLocal, err := services.CloneAndFetchRepo(remotePath)
	assert.NoError(t, err)
	defer cleanupLocal()

	_, err = services.DecodeMetadataBlob(localPath, commitHash, "nonexistent.json")
	assert.Error(t, err)
	t.Logf("Error: %v", err)
}
