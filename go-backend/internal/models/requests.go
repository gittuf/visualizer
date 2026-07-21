// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package models

type CommitsRequest struct {
	URL string `json:"url" binding:"required"`
}

type MetadataRequest struct {
	URL    string `json:"url" binding:"required"`
	Commit string `json:"commit" binding:"required"`
	File   string `json:"file" binding:"required"`
}

type CommitsLocalRequest struct {
	Path string `json:"path" binding:"required"`
}

type MetadataLocalRequest struct {
	Path   string `json:"path" binding:"required"`
	Commit string `json:"commit" binding:"required"`
	File   string `json:"file" binding:"required"`
}

type PolicyQueryRequest struct {
	URL         string `json:"url" binding:"required"`
	Commit      string `json:"commit" binding:"required"`
	Branch      string `json:"branch" binding:"required"`
	ChangedPath string `json:"changedPath" binding:"required"`
}

type PolicyQueryLocalRequest struct {
	Path        string `json:"path" binding:"required"`
	Commit      string `json:"commit" binding:"required"`
	Branch      string `json:"branch" binding:"required"`
	ChangedPath string `json:"changedPath" binding:"required"`
}
