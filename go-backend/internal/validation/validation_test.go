// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package validation

import (
	"path/filepath"
	"testing"
)

func TestGetAbsolutePath(t *testing.T) {
	t.Parallel()

	basePath := filepath.Join(string(filepath.Separator), "tmp", "workspace")

	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{
			name:  "accepts path under allowed base",
			input: filepath.Join(basePath, "repo"),
			want:  filepath.Join(basePath, "repo"),
		},
		{
			name:  "accepts nested path under allowed base",
			input: filepath.Join(basePath, "team", "repo"),
			want:  filepath.Join(basePath, "team", "repo"),
		},
		{
			name:    "rejects path outside allowed base",
			input:   filepath.Join(string(filepath.Separator), "tmp", "other", "repo"),
			wantErr: true,
		},
		{
			name:    "rejects url style path",
			input:   "https://evil.example/repo",
			wantErr: true,
		},
		{
			name:    "rejects unc path",
			input:   "\\\\server\\share\\repo",
			wantErr: true,
		},
		{
			name:    "rejects empty path",
			input:   "   ",
			wantErr: true,
		},
		{
			name:    "rejects relative path",
			input:   "repo",
			wantErr: true,
		},
		{
			name:    "rejects escaping traversal",
			input:   basePath + string(filepath.Separator) + ".." + string(filepath.Separator) + ".." + string(filepath.Separator) + "other",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := resolveLocalRepoPath(tt.input, basePath)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("resolveLocalRepoPath(%q) expected error", tt.input)
				}
				return
			}

			if err != nil {
				t.Fatalf("resolveLocalRepoPath(%q) unexpected error: %v", tt.input, err)
			}

			if got != tt.want {
				t.Fatalf("resolveLocalRepoPath(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}
