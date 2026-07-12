# AGENTS.md

Slim map for AI agents in a Laradock repo. It points to sources; it does not copy them (keep it that way).

## What this is

Laradock is a full PHP/Docker dev environment. Each service (nginx, mysql, php-fpm, workspace, ...) is a self-contained image in its own top-level folder, wired together with Compose `include` and configured through `.env`.

## Operate it

Use the `./laradock` CLI (plain-English verbs that hide the Docker flags). Run **`./laradock help`** for the current command list, the CLI is the source of truth, not this file. Anything it doesn't recognize passes straight to `docker compose`; add `-y` for non-interactive/CI.

## Structure

- One folder = one container: `<svc>/Dockerfile`, `<svc>/compose.yml`, `<svc>/defaults.env` (pre-filled defaults).
- Root `docker-compose.yml` wires every service via Compose `include` (needs Compose v2.20+).
- `.env` (from `.env.example`) holds shared settings + your overrides; root `.env` beats `defaults.env`.

## Modifying it

- Configure via `.env`; never hardcode in compose files. Rebuild after a change: `./laradock rebuild <svc>`.
- Add a service = new folder (`Dockerfile` + `compose.yml` + `defaults.env`) + one `include` entry in the root `docker-compose.yml`.
- Before a PR, pass the same checks CI runs, see `.github/workflows/shellcheck.yml` and `hadolint.yml`. Tick the PR AI-disclosure box.

## Docs

Full docs https://laradock.io · machine index https://laradock.io/llms.txt · source in `DOCUMENTATION/`. No application code lives here. Any docs page returns raw Markdown by appending `.md` (e.g. https://laradock.io/docs/getting-started.md).
