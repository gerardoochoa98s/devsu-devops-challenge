# Terraform — AWS EKS + ECR

This module provisions the infrastructure needed to run the application on a production-like AWS
cluster:

- VPC with three AZs, public/private subnets and a single NAT gateway (cost-conscious for a demo).
- EKS cluster with private worker nodes, managed node group and control-plane logs.
- ECR repository with scan-on-push, AES256 encryption and a lifecycle policy.
- Outputs for the cluster endpoint, CA, ECR URL and the `kubectl` configuration command.

## Status

> **Not applied.** No AWS account or credentials were available for this submission. The module is
> validated in CI with `terraform fmt`, `terraform init -backend=false`, `terraform validate`,
> TFLint and Checkov. The optional `plan` job runs only when `ENABLE_AWS_PLAN=true` and the AWS
> secrets are configured.

## Requirements

- Terraform >= 1.6
- AWS credentials with permissions to create VPC, EKS, IAM, EC2, CloudWatch and ECR resources.
- AWS CLI (optional, to configure `kubectl`).

## Usage

```bash
cd terraform/aws
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

Configure `kubectl`:

```bash
$(terraform output -raw configure_kubectl)
kubectl get nodes
```

Build and push the image to ECR (example):

```bash
AWS_ACCOUNT_ID="$(terraform output -raw aws_account_id)"
ECR_URL="$(terraform output -raw ecr_repository_url)"

aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin "${ECR_URL}"

docker build -t "${ECR_URL}:sha-$(git rev-parse HEAD)" .
docker push "${ECR_URL}:sha-$(git rev-parse HEAD)"
```

Deploy the production overlay after updating the image and hostname:

```bash
cd k8s/overlays/production
kustomize edit set image demo-devops-api="${ECR_URL}:sha-$(git rev-parse HEAD)"
kubectl apply -k .
```

> The ECR repository is created with `IMMUTABLE` tags. Push unique tags (commit SHA or semver), not
> `latest`. The GHCR pipeline uses `sha-<commit>` and `latest`; if you switch the pipeline to ECR,
> keep only immutable tags.

## Outputs

| Output                               | Description                                      |
| ------------------------------------ | ------------------------------------------------ |
| `aws_account_id`                     | AWS account used by the current credentials      |
| `cluster_name`                       | EKS cluster name                                 |
| `cluster_endpoint`                   | EKS API server endpoint                          |
| `cluster_certificate_authority_data` | CA data (sensitive)                              |
| `ecr_repository_url`                 | ECR repository URL                               |
| `configure_kubectl`                  | Ready-to-run `aws eks update-kubeconfig` command |
| `vpc_id`                             | VPC identifier                                   |

## Remote state

The S3 backend is commented out in `versions.tf`. For shared environments, create a bucket and a
DynamoDB table, then uncomment the backend block or run:

```bash
terraform init \
  -backend-config="bucket=gerardoochoa98s-terraform-state" \
  -backend-config="key=devsu-devops/eks/terraform.tfstate" \
  -backend-config="region=us-east-1" \
  -backend-config="dynamodb_table=terraform-locks" \
  -backend-config="encrypt=true"
```

## Cost warning

EKS control plane, NAT gateway and EC2 nodes are billable. This is not a free-tier workload. Run
`terraform destroy` when finished.

## CI validation

The `Terraform` workflow runs on changes under `terraform/**`:

1. `terraform fmt -check -recursive`
2. `terraform init -backend=false`
3. `terraform validate`
4. TFLint with the AWS ruleset
5. Checkov (soft fail)

The optional `plan` job requires `ENABLE_AWS_PLAN=true` and the `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY` (and optionally `AWS_SESSION_TOKEN`) repository secrets.
