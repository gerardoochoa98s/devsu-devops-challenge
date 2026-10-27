terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Remote state is strongly recommended for shared environments.
  # Configure it with `terraform init -backend-config=...` or uncomment:
  #
  # backend "s3" {
  #   bucket         = "gerardoochoa98s-terraform-state"
  #   key            = "devsu-devops/eks/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}
