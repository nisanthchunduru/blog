locals {
  lambda_env_vars = merge(
    {
      CACHE_S3_BUCKET    = aws_s3_bucket.blog_cache.id
      NOTION_TOKEN       = var.notion_token
      CONTENT_NOTION_URL = var.content_notion_url
      NODE_ENV           = "production"
    },
    var.cache_provider == "dynamodb" ? { CACHE_DYNAMODB_TABLE = aws_dynamodb_table.blog_cache.name } : {}
  )
}

resource "aws_lambda_function" "blog_handle_http_request" {
  function_name    = "blog-handleHttpRequest"
  handler          = "dist/lambda-functions/handle-http-request.run"
  runtime          = "nodejs24.x"
  architectures    = ["arm64"]
  memory_size      = 1024
  role             = aws_iam_role.blog_lambda_role.arn
  filename         = "../../backend/dist/lambda.zip"
  source_code_hash = filebase64sha256("../../backend/dist/lambda.zip")
  timeout          = 30

  environment {
    variables = local.lambda_env_vars
  }
}

resource "aws_lambda_function" "blog_sync" {
  function_name    = "blog-sync"
  handler          = "dist/lambda-functions/sync.run"
  runtime          = "nodejs24.x"
  architectures    = ["arm64"]
  memory_size      = 1024
  role             = aws_iam_role.blog_lambda_role.arn
  filename         = "../../backend/dist/lambda.zip"
  source_code_hash = filebase64sha256("../../backend/dist/lambda.zip")
  timeout          = 300

  environment {
    variables = local.lambda_env_vars
  }
}
