resource "google_cloud_scheduler_job" "blog_sync" {
  name        = "${local.blog_sync_function_name}-schedule"
  region      = var.google_cloud_region
  description = "Refresh the blog cache from Notion"
  schedule    = var.sync_schedule

  http_target {
    http_method = "POST"
    uri         = google_cloudfunctions2_function.blog_sync.service_config[0].uri

    oidc_token {
      service_account_email = google_service_account.blog_functions.email
    }
  }

  depends_on = [
    google_cloud_run_service_iam_member.blog_sync_scheduler_invoker,
    google_service_account_iam_member.cloud_scheduler_service_agent_token_creator,
  ]
}
