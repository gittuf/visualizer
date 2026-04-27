package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/gittuf/visualizer/go-backend/internal/handlers"
	"github.com/gittuf/visualizer/go-backend/internal/models"
	"github.com/gittuf/visualizer/go-backend/tests/helpers"
	"github.com/stretchr/testify/assert"
)

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/commits", handlers.ListCommits)
	r.POST("/metadata", handlers.GetMetadata)
	r.POST("/commits-local", handlers.ListCommitsLocal)
	r.POST("/metadata-local", handlers.GetMetadataLocal)
	return r
}

func TestListCommits_Success(t *testing.T) {
	remotePath, _, cleanupRemote := helpers.SetupTestRepo(t)
	defer cleanupRemote()

	r := setupRouter()
	jsonValue, _ := json.Marshal(models.CommitsRequest{URL: remotePath})
	req, _ := http.NewRequest("POST", "/commits", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusOK, w.Code)
	var commits []models.Commit
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &commits))
	assert.NotEmpty(t, commits)
}

func TestListCommits_MissingURL(t *testing.T) {
	r := setupRouter()
	jsonValue, _ := json.Marshal(models.CommitsRequest{})
	req, _ := http.NewRequest("POST", "/commits", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestListCommits_InvalidURL(t *testing.T) {
	r := setupRouter()
	jsonValue, _ := json.Marshal(models.CommitsRequest{URL: "invalid-url"})
	req, _ := http.NewRequest("POST", "/commits", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestGetMetadata_Success(t *testing.T) {
	remotePath, commitHash, cleanupRemote := helpers.SetupTestRepo(t)
	defer cleanupRemote()

	r := setupRouter()
	jsonValue, _ := json.Marshal(models.MetadataRequest{URL: remotePath, Commit: commitHash, File: "root.json"})
	req, _ := http.NewRequest("POST", "/metadata", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusOK, w.Code)
	var metadata map[string]interface{}
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &metadata))
	assert.Equal(t, "root", metadata["type"])
}

func TestGetMetadata_MissingURL(t *testing.T) {
	r := setupRouter()
	jsonValue, _ := json.Marshal(models.MetadataRequest{})
	req, _ := http.NewRequest("POST", "/metadata", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestListCommitsLocal_Success(t *testing.T) {
	repoPath, _, cleanup := helpers.SetupTestRepo(t)
	defer cleanup()

	r := setupRouter()
	jsonValue, _ := json.Marshal(models.CommitsLocalRequest{Path: repoPath})
	req, _ := http.NewRequest("POST", "/commits-local", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusOK, w.Code)
	var commits []models.Commit
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &commits))
	assert.NotEmpty(t, commits)
}

func TestListCommitsLocal_MissingPath(t *testing.T) {
	r := setupRouter()
	jsonValue, _ := json.Marshal(models.CommitsLocalRequest{})
	req, _ := http.NewRequest("POST", "/commits-local", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestListCommitsLocal_InvalidPath(t *testing.T) {
	r := setupRouter()
	jsonValue, _ := json.Marshal(models.CommitsLocalRequest{Path: "/invalid/path"})
	req, _ := http.NewRequest("POST", "/commits-local", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetMetadataLocal_Success(t *testing.T) {
	repoPath, commitHash, cleanup := helpers.SetupTestRepo(t)
	defer cleanup()

	r := setupRouter()
	jsonValue, _ := json.Marshal(models.MetadataLocalRequest{Path: repoPath, Commit: commitHash, File: "root.json"})
	req, _ := http.NewRequest("POST", "/metadata-local", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusOK, w.Code)
	var metadata map[string]interface{}
	assert.NoError(t, json.Unmarshal(w.Body.Bytes(), &metadata))
	assert.Equal(t, "root", metadata["type"])
}

func TestGetMetadataLocal_MissingFields(t *testing.T) {
	r := setupRouter()
	jsonValue, _ := json.Marshal(models.MetadataLocalRequest{})
	req, _ := http.NewRequest("POST", "/metadata-local", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetMetadataLocal_InvalidPath(t *testing.T) {
	r := setupRouter()
	jsonValue, _ := json.Marshal(models.MetadataLocalRequest{Path: "/invalid/path", Commit: "HEAD", File: "root.json"})
	req, _ := http.NewRequest("POST", "/metadata-local", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	t.Logf("Response: %d %s", w.Code, w.Body.String())
	assert.Equal(t, http.StatusBadRequest, w.Code)
}
