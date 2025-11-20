// Copyright The gittuf Authors
// SPDX-License-Identifier: Apache-2.0

package models

import "time"

type Commit struct {
	Hash    string    `json:"hash"`
	Message string    `json:"message"`
	Author  string    `json:"author"`
	Date    time.Time `json:"date"`
}
