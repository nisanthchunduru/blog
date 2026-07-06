locals {
  google_cloud_function_environment_variables = {
    CACHE_GOOGLE_CLOUD_STORAGE_BUCKET = google_storage_bucket.blog_cache.name
    CONTENT_NOTION_URL                = var.content_notion_url
    NODE_ENV                          = "production"
  }
}

resource "google_cloudfunctions2_function" "blog_handle_http_request" {
  name        = local.blog_handle_http_request_function_name
  location    = var.google_cloud_region
  description = "Serve blog HTTP requests"

  build_config {
    runtime     = "nodejs24"
    entry_point = "run"

    source {
      storage_source {
        bucket = google_storage_bucket.blog_function_source.name
        object = google_storage_bucket_object.google_cloud_functions_source.name
      }
    }
  }

  service_config {
    available_memory      = "512M"
    max_instance_count    = 3
    min_instance_count    = 0
    service_account_email = google_service_account.blog_functions.email
    timeout_seconds       = 30

    environment_variables = merge(
      local.google_cloud_function_environment_variables,
      { BLOG_GOOGLE_CLOUD_FUNCTION = local.blog_handle_http_request_function_name }
    )

    secret_environment_variables {
      key        = "NOTION_TOKEN"
      project_id = var.google_cloud_project_id
      secret     = google_secret_manager_secret.notion_token.secret_id
      version    = "latest"
    }
  }

  depends_on = [
    google_project_service.enabled,
    google_secret_manager_secret_version.notion_token,
    google_secret_manager_secret_iam_member.blog_functions_notion_token_reader,
    google_service_account_iam_member.cloud_functions_service_agent_user,
  ]
}

resource "google_cloudfunctions2_function" "blog_sync" {
  name        = local.blog_sync_function_name
  location    = var.google_cloud_region
  description = "Refresh blog cache from Notion"

  build_config {
    runtime     = "nodejs24"
    entry_point = "run"

    source {
      storage_source {
        bucket = google_storage_bucket.blog_function_source.name
        object = google_storage_bucket_object.google_cloud_functions_source.name
      }
    }
  }

  service_config {
    available_memory      = "512M"
    max_instance_count    = 1
    min_instance_count    = 0
    service_account_email = google_service_account.blog_functions.email
    timeout_seconds       = 300

    environment_variables = merge(
      local.google_cloud_function_environment_variables,
      { BLOG_GOOGLE_CLOUD_FUNCTION = local.blog_sync_function_name }
    )

    secret_environment_variables {
      key        = "NOTION_TOKEN"
      project_id = var.google_cloud_project_id
      secret     = google_secret_manager_secret.notion_token.secret_id
      version    = "latest"
    }
  }

  depends_on = [
    google_project_service.enabled,
    google_secret_manager_secret_version.notion_token,
    google_secret_manager_secret_iam_member.blog_functions_notion_token_reader,
    google_service_account_iam_member.cloud_functions_service_agent_user,
  ]
}

resource "google_cloud_run_service_iam_member" "blog_handle_http_request_public_invoker" {
  project  = var.google_cloud_project_id
  location = var.google_cloud_region
  service  = google_cloudfunctions2_function.blog_handle_http_request.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "blog_sync_scheduler_invoker" {
  project  = var.google_cloud_project_id
  location = var.google_cloud_region
  service  = google_cloudfunctions2_function.blog_sync.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.blog_functions.email}"
}
