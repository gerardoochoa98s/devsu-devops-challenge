# ADR 0001 — Node.js as the base application

## Context

The exercise allows choosing one of three equivalent applications (Java, Node.js, Python).
The evaluation focuses on Docker, CI/CD, Kubernetes and documentation, not on the language.

## Decision

Use `devsu-demo-devops-nodejs` (Express + Sequelize).

## Rationale

- Fast feedback loop: dependency install, tests and image build are significantly faster than
  Maven/Spring Boot, which keeps the pipeline short and easy to review.
- Jest + Supertest already provide a test harness, so unit and HTTP contract tests are cheap.
- The small runtime surface makes the container image and the security posture easier to reason
  about.

## Consequences

- The application is rewritten slightly to support PostgreSQL, health endpoints, graceful
  shutdown and migrations (see ADR 0002).
- Node.js 20 LTS is used in Docker and CI; local development can use any Node.js >= 20.
