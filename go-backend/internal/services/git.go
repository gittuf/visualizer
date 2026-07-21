// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package services

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"sync"

	"github.com/gittuf/visualizer/go-backend/internal/logger"
	"github.com/gittuf/visualizer/go-backend/internal/models"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
)

var remoteRepoCache = struct {
	sync.Mutex
	paths map[string]string
}{
	paths: map[string]string{},
}

// Clones a repository and fetches the custom gittuf policy ref
// Returns the temporary directory path and cleanup function
func CloneAndFetchRepo(url string) (string, func(), error) {
	remoteRepoCache.Lock()
	cachedPath := remoteRepoCache.paths[url]
	remoteRepoCache.Unlock()

	if cachedPath != "" {
		repo, err := git.PlainOpen(cachedPath)
		if err == nil {
			if err := fetchPolicyRef(repo); err == nil {
				return cachedPath, func() {}, nil
			}
		}

		remoteRepoCache.Lock()
		delete(remoteRepoCache.paths, url)
		remoteRepoCache.Unlock()
	}

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

	if err := fetchPolicyRef(repo); err != nil {
		cleanup()
		return "", nil, err
	}

	remoteRepoCache.Lock()
	remoteRepoCache.paths[url] = tempDir
	remoteRepoCache.Unlock()

	// ponytail: cached remote repos live for the backend process lifetime; add TTL cleanup only if temp dirs pile up.
	return tempDir, func() {}, nil
}

// Retrieve commits from the gittuf/policy ref
func GetPolicyCommits(repoPath string) ([]models.Commit, error) {
	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open repository: %w", err)
	}

	ref, err := getPolicyRef(repo, "refs/remotes/origin/gittuf/policy")
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

// Retrieve commits from the local gittuf policy ref
func GetLocalCommits(repoPath string) ([]models.Commit, error) {
	repo, err := git.PlainOpen(repoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open repository: %w", err)
	}

	ref, err := getPolicyRef(repo, "refs/remotes/origin/gittuf/policy", "refs/gittuf/policy")
	if err != nil {
		return nil, fmt.Errorf("failed to get local policy ref: %w", err)
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

func getPolicyRef(repo *git.Repository, refs ...string) (*plumbing.Reference, error) {
	for _, refName := range refs {
		ref, err := repo.Reference(plumbing.ReferenceName(refName), true)
		if err == nil {
			return ref, nil
		}
	}

	return nil, fmt.Errorf("policy ref not found in %s", strings.Join(refs, ", "))
}

func fetchPolicyRef(repo *git.Repository) error {
	refSpec := config.RefSpec("refs/gittuf/policy:refs/remotes/origin/gittuf/policy")
	err := repo.Fetch(&git.FetchOptions{
		RefSpecs: []config.RefSpec{refSpec},
		Progress: nil,
	})
	if err != nil && !errors.Is(err, git.NoErrAlreadyUpToDate) {
		return fmt.Errorf("failed to fetch refs/gittuf/policy: %w", err)
	}

	return nil
}
