output "blog_handle_http_request_uri" {
  description = "Public URL for the blog HTTP function"
  value       = google_cloudfunctions2_function.blog_handle_http_request.service_config[0].uri
}

output "blog_sync_uri" {
  description = "Authenticated URL for the blog sync function"
  value       = google_cloudfunctions2_function.blog_sync.service_config[0].uri
}

output "cache_bucket_name" {
  description = "Google Cloud Storage bucket used for the blog cache"
  value       = google_storage_bucket.blog_cache.name
}
