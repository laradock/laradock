# AGENTS.md

Guidance for AI agents and contributors working in this repository.

## What this is

Laradock is a full PHP development environment for Docker. Each service is a self-contained Docker image in its own top-level folder; you compose them with `docker-compose` and configure everything through `.env`.

## How it works

- Each top-level folder (e.g. `nginx/`, `mysql/`, `php-fpm/`, `workspace/`) is one container with its own `Dockerfile`, its compose definition in `<folder>/compose.yml`, and its pre-filled settings in `<folder>/defaults.env`.
- The root `docker-compose.yml` declares the shared networks/volumes and pulls every service in via Compose `include` (requires Docker Compose v2.20+). Each `include` entry sets `project_directory: .` (relative paths resolve from the repo root) and `env_file: <folder>/defaults.env`.
- `.env` (copied from the small `.env.example`) holds shared settings (paths, PHP version, project name) and user overrides. Precedence: root `.env` beats `defaults.env`. Old full `.env` files from before the split keep working unchanged.
- Run services: `docker compose up -d <container-name>` , the name matches the folder name.

## Conventions

- Configure via `.env`. Do not hardcode values in compose files.
- Each service extends an official base image; keep Dockerfiles clean and minimal.
- After editing a `compose.yml`, `.env`, or any `Dockerfile`, rebuild: `docker compose build <container>`.
- Adding a service = new folder + `Dockerfile` + `compose.yml` + `defaults.env` (pre-filled, working values) + an `include` entry in the root `docker-compose.yml`. Only truly shared variables go in `.env.example`.

## Docs

- Full documentation: https://laradock.io
- Machine-readable index: https://laradock.io/llms.txt
- Docs source lives in `DOCUMENTATION/` (Docusaurus).

## Notes

- No application code here. Laradock provisions environments; it does not run business logic.
