# ADR 0003 — GitHub Actions and GHCR

## Context

The deliverable requires a public GitHub repository and evidence of pipeline execution. The
exercise allows any CI/CD platform and any container registry.

## Decision

Use GitHub Actions as the CI/CD platform and GitHub Container Registry (GHCR) as the image
registry.

## Rationale

- The repository is already public, so workflow runs, logs and artifacts have public URLs that
  can be shared as evidence.
- No extra account or secret is required: `GITHUB_TOKEN` can push to GHCR and upload SARIF results.
- CodeQL and Dependabot are native to GitHub and add static analysis and dependency maintenance
  without additional infrastructure.
- The same workflow can create an ephemeral `kind` cluster and run a real Kubernetes deployment,
  which satisfies the "pipeline includes Kubernetes deployment" requirement.

## Consequences

- The pipeline is tied to GitHub. The Docker and Kubernetes artifacts are portable, but the YAML
  would need to be translated for GitLab CI or Azure DevOps.
- Image tags are immutable per commit (`sha-<full-sha>`), with `latest` only on `main`.
