// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package utils

import (
	"os"
	"path/filepath"
)

func GetAbsolutePath(path string) (string, error) {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}
	return absPath, nil
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
