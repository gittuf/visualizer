// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package models

type CommitsRequest struct {
	URL string `json:"url"`
}

type MetadataRequest struct {
	URL    string `json:"url"`
	Commit string `json:"commit"`
}

type MetadataSingleRequest struct {
	MetadataRequest
	File string `json:"file"`
}

type CommitsLocalRequest struct {
	Path string `json:"path"`
}

type MetadataLocalRequest struct {
	Path   string `json:"path"`
	Commit string `json:"commit"`
}

type MetadataLocalSingleRequest struct {
	MetadataLocalRequest
	File string `json:"file"`
}

type PolicyQueryRequest struct {
	URL         string `json:"url"`
	Commit      string `json:"commit"`
	Branch      string `json:"branch"`
	ChangedPath string `json:"changedPath"`
}

type PolicyQueryLocalRequest struct {
	Path        string `json:"path"`
	Commit      string `json:"commit"`
	Branch      string `json:"branch"`
	ChangedPath string `json:"changedPath"`
}
