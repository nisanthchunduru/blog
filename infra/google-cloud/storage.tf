resource "google_storage_bucket" "blog_cache" {
  name                        = local.cache_bucket_name
  location                    = var.google_cloud_region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  depends_on = [google_project_service.enabled]
}

resource "google_storage_bucket" "blog_function_source" {
  name                        = local.source_bucket_name
  location                    = var.google_cloud_region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = true

  depends_on = [google_project_service.enabled]
}

resource "google_storage_bucket_iam_member" "blog_functions_cache_object_admin" {
  bucket = google_storage_bucket.blog_cache.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.blog_functions.email}"
}

data "archive_file" "google_cloud_functions_source" {
  type        = "zip"
  source_dir  = "../.."
  output_path = "${path.module}/.terraform/build/google-cloud-functions.zip"

  excludes = [
    ".DS_Store",
    ".env",
    ".envrc",
    ".git/**",
    ".github/**",
    "backend/dist/**",
    "backend/public/assets/application.css",
    "backend/public/assets/application.js",
    "backend/public/assets/fingerprinted/**",
    "backend/public/assets/fingerprints.json",
    "content/**",
    "infra/**",
    "node_modules/**",
    "public/**",
    "static/**",
    "tmp/**",
    "vendor/**",
  ]
}

resource "google_storage_bucket_object" "google_cloud_functions_source" {
  name   = "functions/${data.archive_file.google_cloud_functions_source.output_md5}.zip"
  bucket = google_storage_bucket.blog_function_source.name
  source = data.archive_file.google_cloud_functions_source.output_path
}
