resource "aws_s3_bucket" "blog_frontend_bucket" {
  bucket = "blog-frontend-bucket-607420117092"
}

resource "aws_s3_bucket_public_access_block" "blog_frontend_bucket" {
  bucket                  = aws_s3_bucket.blog_frontend_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "blog_frontend_oac" {
  name                              = "blog-frontend-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket_policy" "blog_frontend_bucket" {
  bucket = aws_s3_bucket.blog_frontend_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOACRead"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.blog_frontend_bucket.arn}/*"
        Condition = {
          StringEquals = {
            "aws:SourceArn" = aws_cloudfront_distribution.blog_frontend.arn
          }
        }
      }
    ]
  })
}

resource "aws_cloudfront_distribution" "blog_frontend" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  origin {
    domain_name              = aws_s3_bucket.blog_frontend_bucket.bucket_regional_domain_name
    origin_id                = "blog-frontend-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.blog_frontend_oac.id
  }

  origin {
    domain_name = "${aws_apigatewayv2_api.blog_api_gateway.id}.execute-api.${var.aws_region}.amazonaws.com"
    origin_id   = "blog-api-gateway"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "blog-api-gateway"
    viewer_protocol_policy = "https-only"
    compress               = true
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    default_ttl            = 0
    max_ttl                = 0
    min_ttl                = 0

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }
  }

  default_cache_behavior {
    target_origin_id       = "blog-frontend-s3"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  ordered_cache_behavior {
    path_pattern           = "index.html"
    target_origin_id       = "blog-frontend-s3"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    default_ttl            = 60
    max_ttl                = 60

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  ordered_cache_behavior {
    path_pattern           = "*"
    target_origin_id       = "blog-frontend-s3"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    default_ttl            = 86400
    max_ttl                = 31536000

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.blog_certificate.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
