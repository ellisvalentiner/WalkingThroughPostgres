# Notes

These are the presenter notes for my Introduction to Postgres talk at the Ann Arbor Computer Society Meetup on March 6th.

## Installing Postgres

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

There are two important files:

`postgresql.conf` - Specifies the configuration for the server

`pg_hba.conf` - Specifies the configuration file for host-based authentication

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

## Connecting to Databases

There are a few different ways to form connections using the CLI client (i.e. `psql`).

```bash
psql postgres_demo
psql -U user -h localhost -p 5432 -d postgres_demo
PGDATABASE=postgres_demo psql
psql postgres://user:pwd@host:port/dbname
```

Environment variables:

* `PGDATABASE`
* `PGHOST`
* `PGPORT`
* `PGUSER`

.pgpass file:

```
hostname:port:database:username:password
```

# Basic Administration

### Creating Roles

Roles are "users" and "groups".

```sql
CREATE ROLE dbadmin NOLOGIN NOINHERIT SUPERUSER;
CREATE ROLE bob;
GRANT dbadmin TO bob;
```

```sql
CREATE ROLE datascientist;
ALTER DEFAULT PERMISSIONS IN SCHEMA public GRANT SELECT ON TABLES TO datascientist;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO datascientist;
CREATE ROLE julia LOGIN PASSWORD 'hunter1';
GRANT datascientist TO julia;
```

# Example 1: DNS

## Create tables and indexes

We're going to create the following tables:

* `blocks` - IP address blocks
* `locations` - cities
* `domains` - domain names resolved to IP address
* `queries` - DNS queries on the client's network

```sql
CREATE TABLE blocks (
  network cidr,
  geoname_id int,
  registered_country_geoname_id int,
  represented_country_geoname_id int,
  is_anonymous_proxy boolean,
  is_satellite_provider boolean,
  postal_code text,
  latitude numeric,
  longitude numeric,
  accuracy_radius int
);
CREATE INDEX blocks_network_idx ON blocks USING GIST (network);
CREATE INDEX blocks_geoname_idx ON blocks (geoname_id);

CREATE TABLE locations (
  geoname_id int,
  locale_code text,
  continent_code text,
  continent_name text,
  country_iso_code text,
  country_name text,
  subdivision_1_iso_code text,
  subdivision_1_name text,
  subdivision_2_iso_code text,
  subdivision_2_name text,
  city_name text,
  metro_code int,
  time_zone text,
  is_in_european_union boolean)
;
CREATE UNIQUE INDEX locations_geoname_idx ON locations (geoname_id);
CREATE INDEX locations_country_name_idx ON locations (country_name);

CREATE TABLE domains (
  domain  TEXT,
  address INET,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX domains_domain_idx ON domains (domain);
CREATE INDEX domains_address_idx ON domains USING GIST (address);

CREATE TABLE queries (
  id        INTEGER,
  timestamp TIMESTAMP,
  type      INTEGER,
  status    INTEGER,
  domain    TEXT,
  client    INET,
  forward   INET
);
CREATE UNIQUE INDEX queries_id_idx ON queries (id);
CREATE INDEX queries_domain_index ON queries (domain);
CREATE INDEX queries_timestamp_idx ON queries (timestamp);
CREATE INDEX queries_day_timestamp_idx ON queries (DATE_TRUNC('d', timestamp));
```

## Add data

You can add data using the `\copy` command.

In this case the files we want to load are CSV files in a local directory. We can specifiy the delimiter and that the files have a header.

```sql
\copy blocks FROM 'GeoLite2-City-Blocks-IPv4.csv' DELIMITER ',' CSV HEADER;
\copy blocks FROM 'GeoLite2-City-Blocks-IPv6.csv' DELIMITER ',' CSV HEADER;
\copy locations FROM 'GeoLite2-City-Locations-en.csv' DELIMITER ',' CSV HEADER;
```
