// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package validation

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
)

var ErrInvalidLocalPath = errors.New("path must be an absolute local filesystem path")

func GetAbsolutePath(path string) (string, error) {
	path = strings.TrimSpace(path)
	if path == "" {
		return "", ErrInvalidLocalPath
	}

	// Reject URL-like and UNC/network-style paths. Local endpoints should only
	// read from the machine's filesystem.
	if strings.Contains(path, "://") || strings.HasPrefix(path, "\\\\") || strings.ContainsRune(path, '\x00') {
		return "", ErrInvalidLocalPath
	}

	if !filepath.IsAbs(path) {
		return "", ErrInvalidLocalPath
	}

	return filepath.Clean(path), nil
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
