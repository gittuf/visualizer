package models

type ErrorResponse struct {
	Error   string `json:"error"`
	Code    int    `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

type CommitsResponse []Commit
type MetadataResponse map[string]interface{}
