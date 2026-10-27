# ADR 0004 — Kubernetes with kind in CI and Kustomize overlays

## Context

The exercise requires a Kubernetes deployment with at least two replicas, autoscaling, ConfigMaps,
Secrets, Ingress and a deployment stage in the pipeline. A public cloud account is optional.

## Decision

- Use `kind` (Kubernetes in Docker) inside the GitHub Actions runner for the pipeline deployment
  and smoke test.
- Use Kustomize with a `base` and two overlays (`local`, `production`) for environment-specific
  configuration.
- Keep the manifests portable to minikube, AKS, EKS or GKE.

## Rationale

- `kind` gives a real Kubernetes API server and scheduler in CI without cloud credentials or cost.
- The deployment is exercised on every push to `main`: manifests are applied, the migration Job
  runs, the rollout is awaited and the HTTP contract is tested through the ingress.
- Kustomize is built into `kubectl` and keeps the manifests readable without adding Helm
  templating for a single application.

## Consequences

- The CI cluster is ephemeral; it is not a public endpoint.
- The `production` overlay contains placeholders for the hostname and TLS secret. A real
  environment must provide DNS, a certificate (cert-manager or a managed certificate) and a
  production-grade database.
