# ADR 0002 — PostgreSQL and explicit migrations

## Context

The starter application uses SQLite and runs `sequelize.sync({ force: true })` on every start.
That model is incompatible with the requirement of running at least two replicas:

- Each pod would have its own SQLite file, so data would diverge.
- `force: true` drops and recreates the schema on every restart.
- A `ReadWriteOnce` volume shared by replicas is not a safe multi-writer design.

## Decision

- Make the database dialect configurable (`sqlite` for local tests, `postgres` for Docker and
  Kubernetes).
- Provision PostgreSQL as a StatefulSet with a PersistentVolumeClaim in Kubernetes.
- Replace `sync({ force: true })` with Umzug migrations executed by a Kubernetes Job.
- Readiness (`/ready`) checks both connectivity and the presence of the `users` table, so pods do
  not receive traffic before migrations finish.

## Consequences

- The app can scale horizontally behind a Service.
- Schema changes are versioned and repeatable.
- PostgreSQL becomes a stateful dependency. For production, a managed database (RDS, Cloud SQL,
  Azure Database) with backups and HA is recommended instead of the in-cluster StatefulSet.
