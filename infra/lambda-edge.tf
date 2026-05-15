resource "aws_iam_role" "blog_lambda_edge_role" {
  name = "blog-lambda-edge-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "edgelambda.amazonaws.com"
          ]
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "blog_lambda_edge_basic" {
  role       = aws_iam_role.blog_lambda_edge_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "blog_ssr" {
  function_name    = "blog-ssr"
  handler          = "handler.handler"
  runtime          = "nodejs20.x"
  role             = aws_iam_role.blog_lambda_edge_role.arn
  filename         = "../lambda-edge/dist/lambda.zip"
  source_code_hash = filebase64sha256("../lambda-edge/dist/lambda.zip")
  timeout          = 10
  memory_size      = 512
  publish          = true

  lifecycle {
    create_before_destroy = true
  }
}
