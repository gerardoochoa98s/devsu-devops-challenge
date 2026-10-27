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

## Reproducing locally

```bash
kubectl apply -k k8s/overlays/local
kubectl -n demo-devops wait --for=condition=complete job/demo-devops-migrate --timeout=180s
kubectl -n demo-devops rollout status deployment/demo-devops-api --timeout=180s
bash scripts/smoke-test.sh
bash scripts/collect-evidence.sh
```

Screenshots of the pipeline and the Kubernetes resources can be added here for the final submission.
