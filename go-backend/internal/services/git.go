// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package services

import (
	"fmt"
	"os"
	"strings"

	"github.com/gittuf/visualizer/go-backend/internal/logger"
	"github.com/gittuf/visualizer/go-backend/internal/models"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing/object"
)

// Clones a repository and fetches the custom gittuf policy ref
// Returns the temporary directory path and cleanup function
func CloneAndFetchRepo(url string) (string, func(), error) {
	tempDir, err := os.MkdirTemp("", "gittuf-viz-*")
	if err != nil {
		return "", nil, fmt.Errorf("failed to create temp directory: %w", err)
	}

	cleanup := func() {
		logger.Sugar.Infof("Cleaning up temp directory: %s", tempDir)
		os.RemoveAll(tempDir)
	}

	repo, err := git.PlainClone(tempDir, false, &git.CloneOptions{
		URL:      url,
		Progress: nil,
	})
	if err != nil {
		cleanup()
		return "", nil, fmt.Errorf("failed to clone repository: %w", err)
	}

	// Fetch the custom ref
	refSpec := config.RefSpec("refs/gittuf/policy:refs/remotes/origin/gittuf/policy")
	err = repo.Fetch(&git.FetchOptions{
		RefSpecs: []config.RefSpec{refSpec},
		Progress: nil,
	})
	if err != nil && err != git.NoErrAlreadyUpToDate {
		cleanup()
		return "", nil, fmt.Errorf("failed to fetch refs/gittuf/policy: %w", err)
	}

	return tempDir, cleanup, nil
}

// Retrieve commits from the gittuf/policy ref
func GetPolicyCommits(repoPath string) ([]models.Commit, error) {
	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open repository: %w", err)
	}

	ref, err := repo.Reference("refs/remotes/origin/gittuf/policy", true)
	if err != nil {
		return nil, fmt.Errorf("failed to get policy ref: %w", err)
	}

	commitIter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
	if err != nil {
		return nil, fmt.Errorf("failed to get commit log: %w", err)
	}

	var commits []models.Commit
	err = commitIter.ForEach(func(c *object.Commit) error {
		commits = append(commits, models.Commit{
			Hash:    c.Hash.String(),
			Message: strings.TrimSpace(c.Message),
			Author:  c.Author.Name,
			Date:    c.Author.When,
		})
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to iterate commits: %w", err)
	}

	return commits, nil
}

// Retrieve commits from HEAD of a local repository
func GetLocalCommits(repoPath string) ([]models.Commit, error) {
	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open repository: %w", err)
	}

	ref, err := repo.Head()
	if err != nil {
		return nil, fmt.Errorf("failed to get HEAD: %w", err)
	}

	commitIter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
	if err != nil {
		return nil, fmt.Errorf("failed to get commit log: %w", err)
	}

	var commits []models.Commit
	err = commitIter.ForEach(func(c *object.Commit) error {
		commits = append(commits, models.Commit{
			Hash:    c.Hash.String(),
			Message: strings.TrimSpace(c.Message),
			Author:  c.Author.Name,
			Date:    c.Author.When,
		})
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to iterate commits: %w", err)
	}

	return commits, nil
}
