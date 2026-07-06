variable "google_cloud_project_id" {
  description = "Google Cloud project ID that will host the blog"
  type        = string
}

variable "google_cloud_region" {
  description = "Google Cloud region for Cloud Run functions and Cloud Scheduler"
  type        = string
  default     = "us-central1"
}

variable "resource_name_prefix" {
  description = "Prefix used for Google Cloud resources"
  type        = string
  default     = "blog"
}

variable "content_notion_url" {
  description = "Notion URL for the content database"
  type        = string
}

variable "notion_token" {
  description = "Notion integration token used to authenticate requests to the Notion API"
  type        = string
  sensitive   = true
}

variable "cache_bucket_name" {
  description = "Optional globally unique Google Cloud Storage bucket name for the blog cache"
  type        = string
  default     = null
}

variable "source_bucket_name" {
  description = "Optional globally unique Google Cloud Storage bucket name for Cloud Functions source archives"
  type        = string
  default     = null
}

variable "sync_schedule" {
  description = "Cloud Scheduler cron expression for refreshing the blog cache"
  type        = string
  default     = "* * * * *"
}
