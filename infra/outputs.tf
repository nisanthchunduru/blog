output "api_gateway_url" {
  description = "The invoke URL for the API Gateway default stage"
  value       = aws_apigatewayv2_stage.blog_api_default.invoke_url
}

output "cloudfront_url" {
  description = "The HTTPS URL for the CloudFront distribution serving the frontend"
  value       = "https://${aws_cloudfront_distribution.blog_frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution serving the frontend"
  value       = aws_cloudfront_distribution.blog_frontend.id
}
