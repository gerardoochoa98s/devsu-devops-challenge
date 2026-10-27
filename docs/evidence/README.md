# Deployment evidence

This directory is populated by the `deploy` job of the CI/CD workflow:

- `smoke-test.txt` — HTTP contract checks executed through the ingress.
- `load-test.txt` — optional `ab` load test used to exercise the HPA.
- `hpa.txt` — HPA status and pod list after the load test.
- `kubectl-get-all.txt` — workloads, services and pods.
- `kubectl-resources.txt` — ingress, HPA, PDB, NetworkPolicies, StatefulSet, Job and PVCs.
- `deployment-describe.txt` — probes, resources, security context and rollout details.
- `api-logs.txt` — application logs.
- `events.txt` — namespace events.
- `summary.md` — human-readable summary used in the GitHub Actions job summary.

The workflow uploads this directory as the `k8s-evidence` artifact on every run.

## Validated run

- **Workflow run:** [CI/CD #40590810021](https://github.com/gerardoochoa98s/devsu-devops-challenge/actions/runs/40590810021)
- **Commit:** `eb0ed14`
- **Result:** all jobs green: quality/coverage, CodeQL, image build + Trivy + GHCR push, and kind deployment.
- **Deployment:** 2 API replicas, 1 PostgreSQL replica, migration Job completed, HPA `2–6`,
  PDB, Ingress and NetworkPolicies present.
- **Smoke test:** 10/10 HTTP checks passed through the ingress (`/health`, `/ready`, create,
  get, list, duplicate, validation and 404).
- **HPA snapshot:** `4%/70%` CPU and `24%/80%` memory at the time of collection.

The raw evidence is in the run's `k8s-evidence` artifact; a screenshot of the green run is stored
as `docs/evidence/ci-run-40590810021.png`.

## Reproducing locally

```bash
kubectl apply -k k8s/overlays/local
kubectl -n demo-devops wait --for=condition=complete job/demo-devops-migrate --timeout=180s
kubectl -n demo-devops rollout status deployment/demo-devops-api --timeout=180s
bash scripts/smoke-test.sh
bash scripts/collect-evidence.sh
```

Screenshots of the pipeline and the Kubernetes resources can be added here for the final submission.
