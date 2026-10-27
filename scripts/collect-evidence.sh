#!/usr/bin/env bash
set -uo pipefail

NAMESPACE="${NAMESPACE:-demo-devops}"
EVIDENCE_DIR="${EVIDENCE_DIR:-docs/evidence}"
mkdir -p "${EVIDENCE_DIR}"

kubectl -n "${NAMESPACE}" get all -o wide >"${EVIDENCE_DIR}/kubectl-get-all.txt" 2>&1 || true
kubectl -n "${NAMESPACE}" get ingress,hpa,pdb,networkpolicy,statefulset,job,pvc -o wide \
    >"${EVIDENCE_DIR}/kubectl-resources.txt" 2>&1 || true
kubectl -n "${NAMESPACE}" describe deployment demo-devops-api \
    >"${EVIDENCE_DIR}/deployment-describe.txt" 2>&1 || true
kubectl -n "${NAMESPACE}" logs -l app.kubernetes.io/name=api --tail=200 --prefix \
    >"${EVIDENCE_DIR}/api-logs.txt" 2>&1 || true
kubectl -n "${NAMESPACE}" get events --sort-by=.lastTimestamp \
    >"${EVIDENCE_DIR}/events.txt" 2>&1 || true

{
    echo "# Kubernetes deployment evidence"
    echo
    echo "- Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "- Commit: ${GITHUB_SHA:-local}"
    echo "- Image: ${IMAGE_NAME:-local}:${IMAGE_TAG:-local}"
    echo "- Workflow run: ${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-lgochoa}/actions/runs/${GITHUB_RUN_ID:-local}"
    echo
    echo "## Pods"
    echo
    echo '```'
    kubectl -n "${NAMESPACE}" get pods -o wide 2>&1 || true
    echo '```'
    echo
    echo "## Services and ingress"
    echo
    echo '```'
    kubectl -n "${NAMESPACE}" get service,ingress 2>&1 || true
    echo '```'
    echo
    echo "## Autoscaling and disruption budget"
    echo
    echo '```'
    kubectl -n "${NAMESPACE}" get hpa,pdb 2>&1 || true
    echo '```'
    echo
    echo "## Rollout status"
    echo
    echo '```'
    kubectl -n "${NAMESPACE}" rollout status deployment/demo-devops-api --timeout=10s 2>&1 || true
    echo '```'
} >"${EVIDENCE_DIR}/summary.md"
