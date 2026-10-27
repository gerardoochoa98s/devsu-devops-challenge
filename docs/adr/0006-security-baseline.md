# ADR 0006 — Security baseline

## Context

The exercise evaluates good practices and code quality in addition to the functional requirements.

## Decision

Apply a defense-in-depth baseline:

- Container: multi-stage build, non-root `node` user, `dumb-init` as PID 1, no shell in the final
  stage, read-only root filesystem in Kubernetes, all capabilities dropped, seccomp
  `RuntimeDefault`, no privilege escalation.
- Kubernetes: Pod Security Standards `restricted` at namespace level, dedicated ServiceAccount with
  `automountServiceAccountToken: false`, NetworkPolicies with default deny, resource requests and
  limits, probes, PodDisruptionBudget and topology spread.
- CI: ESLint, Prettier, CodeQL, Trivy image scan with SARIF upload, `npm audit` (informational) and
  Dependabot.
- Secrets: no real secret in Git. The pipeline generates a random database password and creates the
  Kubernetes Secret at deploy time. The repository only contains `secret.example.yaml`.
- Application: Helmet, JSON body size limit, centralized error handling, generic 500 responses,
  input validation with Yup and a unique constraint as the final authority for duplicate DNIs.

## Consequences

- The app needs a writable `/tmp` (mounted as `emptyDir`) because the root filesystem is read-only.
- NetworkPolicies require the ingress controller namespace to be labeled `ingress-nginx`; this is
  the default for the official chart/manifest.
- For production, add image signing (Cosign), SBOM attestations, external secrets and a policy
  engine (Kyverno/Gatekeeper).
