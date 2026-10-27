#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-demo-devops}"
HOST="${HOST:-demo-devops.local}"
BASE_URL="${BASE_URL:-http://localhost}"
EVIDENCE_DIR="${EVIDENCE_DIR:-docs/evidence}"
LOG_FILE="${EVIDENCE_DIR}/smoke-test.txt"

mkdir -p "${EVIDENCE_DIR}"
: > "${LOG_FILE}"

log() {
    echo "$*" | tee -a "${LOG_FILE}"
}

fail() {
    log "FAIL: $*"
    exit 1
}

request() {
    local method="$1"
    local path="$2"
    local data="${3:-}"
    local body_file
    body_file="$(mktemp)"

    if [[ -n "${data}" ]]; then
        LAST_STATUS="$(curl -sS -o "${body_file}" -w '%{http_code}' \
            -X "${method}" \
            -H "Host: ${HOST}" \
            -H 'Content-Type: application/json' \
            -d "${data}" \
            "${BASE_URL}${path}")"
    else
        LAST_STATUS="$(curl -sS -o "${body_file}" -w '%{http_code}' \
            -X "${method}" \
            -H "Host: ${HOST}" \
            "${BASE_URL}${path}")"
    fi

    LAST_BODY="$(cat "${body_file}")"
    rm -f "${body_file}"
}

expect_status() {
    local expected="$1"
    local description="$2"

    if [[ "${LAST_STATUS}" != "${expected}" ]]; then
        log "Response body: ${LAST_BODY}"
        fail "${description}: expected HTTP ${expected}, got ${LAST_STATUS}"
    fi

    log "PASS: ${description} (HTTP ${LAST_STATUS})"
}

log "Smoke test against ${BASE_URL} with Host: ${HOST}"
log "Namespace: ${NAMESPACE}"
log ""

log "Waiting for the ingress to answer..."
for _ in $(seq 1 60); do
    if curl -fsS -H "Host: ${HOST}" "${BASE_URL}/health" >/dev/null 2>&1; then
        break
    fi
    sleep 2
done

request GET /health
expect_status 200 "GET /health"
log "Body: ${LAST_BODY}"

request GET /ready
expect_status 200 "GET /ready"

DNI="dni-$(date +%s)-${RANDOM}"
USER_PAYLOAD="{\"dni\":\"${DNI}\",\"name\":\"Smoke Test\"}"

request POST /api/users "${USER_PAYLOAD}"
expect_status 201 "POST /api/users"
USER_ID="$(echo "${LAST_BODY}" | jq -r '.id')"
log "Created user id=${USER_ID} dni=${DNI}"

request GET "/api/users/${USER_ID}"
expect_status 200 "GET /api/users/${USER_ID}"

request GET /api/users
expect_status 200 "GET /api/users"
if ! echo "${LAST_BODY}" | grep -q "${DNI}"; then
    fail "GET /api/users did not return the created user"
fi
log "PASS: GET /api/users contains ${DNI}"

request POST /api/users "${USER_PAYLOAD}"
expect_status 400 "POST /api/users with duplicate dni"

request POST /api/users '{"dni":"only-dni"}'
expect_status 400 "POST /api/users with missing name"

request GET /api/users/999999
expect_status 404 "GET /api/users/999999"

request GET /api/users/not-a-number
expect_status 400 "GET /api/users/not-a-number"

log ""
log "Smoke test completed successfully."

if command -v ab >/dev/null 2>&1; then
    log ""
    log "Running a short load test to exercise the HorizontalPodAutoscaler..."
    ab -n 3000 -c 50 -H "Host: ${HOST}" "${BASE_URL}/api/users" \
        >"${EVIDENCE_DIR}/load-test.txt" 2>&1 || true
    sleep 45
    kubectl -n "${NAMESPACE}" get hpa demo-devops-api -o wide \
        >"${EVIDENCE_DIR}/hpa.txt" 2>&1 || true
    kubectl -n "${NAMESPACE}" get pods -l app.kubernetes.io/name=api -o wide \
        >>"${EVIDENCE_DIR}/hpa.txt" 2>&1 || true
    log "HPA and pod state captured in ${EVIDENCE_DIR}/hpa.txt"
fi
