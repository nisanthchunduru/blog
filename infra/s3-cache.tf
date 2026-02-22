resource "aws_s3_bucket" "blog_cache" {
  bucket = "blog-cache-607420117092"
}

resource "aws_s3_bucket_public_access_block" "blog_cache" {
  bucket                  = aws_s3_bucket.blog_cache.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
