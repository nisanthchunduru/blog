terraform {
  required_providers {
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0.0"
    }
  }
}

provider "google" {
  project = var.google_cloud_project_id
  region  = var.google_cloud_region
}

data "google_project" "blog" {
  project_id = var.google_cloud_project_id
}

locals {
  google_cloud_service_names = toset([
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudscheduler.googleapis.com",
    "iam.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "storage.googleapis.com",
  ])

  blog_handle_http_request_function_name = "${var.resource_name_prefix}-handle-http-request"
  blog_sync_function_name                = "${var.resource_name_prefix}-sync"
  cache_bucket_name                      = coalesce(var.cache_bucket_name, "${var.google_cloud_project_id}-${var.resource_name_prefix}-cache")
  source_bucket_name                     = coalesce(var.source_bucket_name, "${var.google_cloud_project_id}-${var.resource_name_prefix}-function-source")
}

resource "google_project_service" "enabled" {
  for_each = local.google_cloud_service_names

  project            = var.google_cloud_project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_service_account" "blog_functions" {
  account_id   = "${var.resource_name_prefix}-functions"
  display_name = "Blog Cloud Functions"

  depends_on = [google_project_service.enabled]
}

resource "google_service_account_iam_member" "cloud_functions_service_agent_user" {
  service_account_id = google_service_account.blog_functions.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:service-${data.google_project.blog.number}@gcf-admin-robot.iam.gserviceaccount.com"

  depends_on = [google_project_service.enabled]
}

resource "google_service_account_iam_member" "cloud_scheduler_service_agent_token_creator" {
  service_account_id = google_service_account.blog_functions.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = "serviceAccount:service-${data.google_project.blog.number}@gcp-sa-cloudscheduler.iam.gserviceaccount.com"

  depends_on = [google_project_service.enabled]
}
