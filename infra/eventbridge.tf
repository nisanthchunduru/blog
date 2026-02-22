resource "aws_cloudwatch_event_rule" "blog_sync_schedule" {
  name                = "blog-sync-schedule"
  schedule_expression = "rate(1 minute)"
}

resource "aws_cloudwatch_event_target" "blog_sync_target" {
  rule = aws_cloudwatch_event_rule.blog_sync_schedule.name
  arn  = aws_lambda_function.blog_sync.arn

  retry_policy {
    maximum_retry_attempts       = 2
    maximum_event_age_in_seconds = 60
  }
}

resource "aws_lambda_permission" "blog_eventbridge_invoke" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.blog_sync.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.blog_sync_schedule.arn
}
