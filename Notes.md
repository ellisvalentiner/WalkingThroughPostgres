# Notes



## Install

### System Specfic Instructions

#### macOS

Install using EnterpriseDB, BigSQL, Postgres.app, Fink, MacPorts, or Homebrew

```bash
brew install postgres
brew services start postgres
```
#### Windows

EnterpriseDB, BigSQL

#### Ubuntu

Install using EnterpriseDB or PostgreSQL Apt Repository

```bash
sudo apt install postgresql
```

#### Docker

```bash
docker run \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -v /tmp/postgresdb:/var/lib/postgresql/data \
  postgres:latest
```

If you use Docker to run your database be sure to persist the `PGDATA` directory _outside_ of the Docker container!

### General

The PostgreSQL database cluster is a collection of databases managed by a single server instance.

```bash
pg_ctl initdb --pgdata=/Users/${USER}/postgres_demo
pg_ctl -D /Users/${USER}/postgres_demo -l logfile start
```

By default the PostgreSQL database cluster has several databases:

```bash
psql -X -l
```

#### Creating a new database

Use `createdb` to create a new database in the PostgreSQL database cluster.

```bash
createdb project_db
psql -X -l
```

#### Enabling external connections

`pg_hba.conf` - client authorization configuration file

`postgresql.conf` - server configuration file

Modify `pg_hba.conf`:

```
host    project_db  all 0.0.0.0/0   trust
```

Modify `postgresql.conf`:

```bash
listen_addresses = '*'
```

Then restart the database

```bash
pg_ctl -D postgres_demo restart
```

## Connections

```bash
psql postgres_demo
psql -U user -h localhost -p 5432 -d postgres_demo
PGDATABASE=postgres_demo psql
psql postgres://user:pwd@host:port/dbname
```

Environment variables;

* `PGDATABASE`
* `PGHOST`
* `PGPORT`
* `PGUSER`

# Basic Administration

### Creating Roles

Roles are "users" and "groups".

```postgresql
CREATE ROLE dbadmin NOLOGIN NOINHERIT SUPERUSER;
CREATE ROLE bob;
GRANT dbadmin TO bob;
```

```
CREATE ROLE datascientist;
ALTER DEFAULT PERMISSIONS IN SCHEMA public GRANT SELECT ON TABLES TO datascientist;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO datascientist;
CREATE ROLE julia LOGIN PASSWORD 'hunter1';
GRANT datascientist TO julia;
```
