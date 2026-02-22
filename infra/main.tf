terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "blog-terraform-state-607420117092"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "blog-terraform-state-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}
