variable "aws_region" {
  description = "AWS region used for every resource."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Short project name used as a prefix for resources."
  type        = string
  default     = "devsu-devops"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod."
  }
}

variable "repository_url" {
  description = "Repository URL included in resource tags."
  type        = string
  default     = "https://github.com/gerardoochoa98s/devsu-devops-challenge"
}

variable "cluster_version" {
  description = "Kubernetes version for the EKS control plane. Use a version currently supported by EKS."
  type        = string
  default     = "1.32"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "node_instance_types" {
  description = "Instance types for the managed node group."
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_disk_size" {
  description = "Disk size (GiB) for each node."
  type        = number
  default     = 30
}

variable "node_min_size" {
  description = "Minimum number of nodes."
  type        = number
  default     = 2
}

variable "node_max_size" {
  description = "Maximum number of nodes."
  type        = number
  default     = 4
}

variable "node_desired_size" {
  description = "Desired number of nodes."
  type        = number
  default     = 2
}

variable "tags" {
  description = "Additional tags applied to every resource."
  type        = map(string)
  default     = {}
}
