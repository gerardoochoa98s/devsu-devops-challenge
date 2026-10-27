# ADR 0005 — Terraform for AWS (extra credit)

## Context

The exercise awards extra points for infrastructure as code in a public cloud provider, including
`terraform apply`/outputs evidence. No cloud account was available for this submission.

## Decision

Provide a production-oriented Terraform module for AWS:

- VPC with public/private subnets and a single NAT gateway (cost-conscious for a demo).
- EKS managed node group with private worker nodes.
- ECR repository with scan-on-push, encryption and a lifecycle policy.
- Control-plane audit/API logs with 30-day retention.
- Outputs for the cluster endpoint, CA, ECR URL and `kubectl` configuration command.

The module is validated in CI (`terraform fmt`, `terraform init -backend=false`, `terraform validate`,
TFLint and Checkov). An optional `plan` job runs only when `ENABLE_AWS_PLAN=true` and AWS
credentials are configured as repository secrets.

## Consequences

- The configuration is ready to apply, but it was not applied because there was no AWS account or
  credentials. This is documented as a known limitation instead of claiming evidence that does not
  exist.
- Applying it creates billable resources (EKS control plane, NAT gateway, EC2 nodes). Run
  `terraform destroy` after validating.
- Remote state (S3 + DynamoDB) is documented but not configured, since it depends on an account.
