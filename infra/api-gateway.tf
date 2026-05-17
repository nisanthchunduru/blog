resource "aws_apigatewayv2_api" "blog_api_gateway" {
  name          = "blog-api-gateway"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "blog_handle_http_request" {
  api_id                 = aws_apigatewayv2_api.blog_api_gateway.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.blog_handle_http_request.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "blog_default_proxy" {
  api_id    = aws_apigatewayv2_api.blog_api_gateway.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.blog_handle_http_request.id}"
}

resource "aws_apigatewayv2_stage" "blog_api_default" {
  api_id      = aws_apigatewayv2_api.blog_api_gateway.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "blog_api_gateway_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.blog_handle_http_request.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.blog_api_gateway.execution_arn}/*/*"
}
