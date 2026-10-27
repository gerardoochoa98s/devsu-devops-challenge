.PHONY: install test lint format docker-build docker-up docker-down deploy-local smoke

install:
	npm ci

test:
	npm run test:coverage

lint:
	npm run lint
	npm run format:check

format:
	npm run format

docker-build:
	docker build -t demo-devops-nodejs:local .

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down -v

deploy-local:
	kubectl apply -k k8s/overlays/local
	kubectl -n demo-devops rollout status deployment/demo-devops-api --timeout=180s

smoke:
	bash scripts/smoke-test.sh
