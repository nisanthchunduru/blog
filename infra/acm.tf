resource "aws_acm_certificate" "blog_certificate" {
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

output "acm_validation_records" {
  description = "DNS records required for ACM certificate validation"
  value = {
    for dvo in aws_acm_certificate.blog_certificate.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  }
}
