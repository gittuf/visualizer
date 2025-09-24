export interface Commit {
  hash: string
  message: string
  author: string
  date: string
}

export interface MetadataRequest {
  url: string
  commit: string
  file: string
}

export interface CommitsRequest {
  url: string
}
