resource "google_secret_manager_secret" "notion_token" {
  secret_id = "NOTION_TOKEN"

  replication {
    auto {}
  }

  depends_on = [google_project_service.enabled]
}

resource "google_secret_manager_secret_version" "notion_token" {
  secret      = google_secret_manager_secret.notion_token.id
  secret_data = var.notion_token
}

resource "google_secret_manager_secret_iam_member" "blog_functions_notion_token_reader" {
  secret_id = google_secret_manager_secret.notion_token.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.blog_functions.email}"
}
