// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package validation

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
)

var ErrInvalidLocalPath = errors.New("path must be inside the allowed local repository base path")

func GetAbsolutePath(path string) (string, error) {
	basePath, err := getLocalRepoBasePath()
	if err != nil {
		return "", err
	}

	return resolveLocalRepoPath(path, basePath)
}

func getLocalRepoBasePath() (string, error) {
	if configuredBase := strings.TrimSpace(os.Getenv("LOCAL_REPO_BASE_PATH")); configuredBase != "" {
		return filepath.Clean(configuredBase), nil
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	return filepath.Clean(homeDir), nil
}

func resolveLocalRepoPath(path, basePath string) (string, error) {
	path = strings.TrimSpace(path)
	if path == "" {
		return "", ErrInvalidLocalPath
	}

	if strings.Contains(path, "://") || strings.HasPrefix(path, "\\\\") || strings.ContainsRune(path, '\x00') {
		return "", ErrInvalidLocalPath
	}

	if !filepath.IsAbs(path) {
		return "", ErrInvalidLocalPath
	}

	basePath = filepath.Clean(basePath)
	if basePath == "" || !filepath.IsAbs(basePath) {
		return "", ErrInvalidLocalPath
	}

	cleanPath := filepath.Clean(path)
	relativePath, err := filepath.Rel(basePath, cleanPath)
	if err != nil {
		return "", ErrInvalidLocalPath
	}

	if relativePath != "." && !filepath.IsLocal(relativePath) {
		return "", ErrInvalidLocalPath
	}

	return filepath.Join(basePath, relativePath), nil
}

func IsValidGitRepo(path string) bool {
	gitPath := filepath.Join(path, ".git")
	info, err := os.Stat(gitPath)
	if err != nil {
		return false
	}
	return info.IsDir()
}

func PathExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
