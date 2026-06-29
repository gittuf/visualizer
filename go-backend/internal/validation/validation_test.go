// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package validation

import (
	"path/filepath"
	"testing"
)

func TestGetAbsolutePath(t *testing.T) {
	t.Parallel()

	validPath := filepath.Join(string(filepath.Separator), "tmp", "repo", "..", "repo")

	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{
			name:  "accepts absolute local path",
			input: validPath,
			want:  filepath.Clean(validPath),
		},
		{
			name:    "rejects relative path",
			input:   "repo",
			wantErr: true,
		},
		{
			name:    "rejects url style path",
			input:   "https://invalid.example/repo",
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
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := GetAbsolutePath(tt.input)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("GetAbsolutePath(%q) expected error", tt.input)
				}
				return
			}

			if err != nil {
				t.Fatalf("GetAbsolutePath(%q) unexpected error: %v", tt.input, err)
			}

			if got != tt.want {
				t.Fatalf("GetAbsolutePath(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}
