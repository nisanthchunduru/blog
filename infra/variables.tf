variable "notion_token" {
  description = "Notion integration token used to authenticate requests to the Notion API"
  type        = string
  sensitive   = true
}

variable "content_notion_url" {
  description = "Notion URL for the content database"
  type        = string
}

variable "aws_region" {
  description = "AWS region in which all resources are deployed"
  type        = string
  default     = "us-east-1"
}

variable "terraform_state_bucket" {
  description = "Name of the S3 bucket used to store Terraform remote state"
  type        = string
}

variable "terraform_state_lock_table" {
  description = "Name of the DynamoDB table used for Terraform state locking"
  type        = string
  default     = "blog-terraform-state-lock"
}

variable "domain_name" {
  description = "Primary domain name for the blog"
  type        = string
  default     = "nisanthchunduru.com"
}
