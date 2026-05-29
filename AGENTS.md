# AGENTS.md

Guidance for AI agents and contributors working in this repository.

## What this is

Laradock is a full PHP development environment for Docker. Each service is a self-contained Docker image in its own top-level folder; you compose them with `docker-compose` and configure everything through `.env`.

## How it works

- Each top-level folder (e.g. `nginx/`, `mysql/`, `php-fpm/`, `workspace/`) is one container with its own `Dockerfile`.
- `docker-compose.yml` wires the services together; `.env` (copied from `.env.example`) controls versions, ports, and which software is installed.
- Run services: `docker-compose up -d <container-name>` , the name matches the folder name.

## Conventions

- Configure via `.env`. Do not hardcode values in `docker-compose.yml`.
- Each service extends an official base image; keep Dockerfiles clean and minimal.
- After editing `docker-compose.yml`, `.env`, or any `Dockerfile`, rebuild: `docker-compose build <container>`.
- Adding a service = new folder + `Dockerfile` + a `docker-compose.yml` block + `.env` entries.

## Docs

- Full documentation: https://laradock.io
- Machine-readable index: https://laradock.io/llms.txt
- Docs source lives in `DOCUMENTATION/` (Docusaurus).

## Notes

- No application code here. Laradock provisions environments; it does not run business logic.
