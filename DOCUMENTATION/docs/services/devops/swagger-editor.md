---
slug: /services/swagger-editor
title: Swagger Editor
description: Run Swagger Editor in Laradock, a browser-based editor for writing and validating OpenAPI/Swagger specs with live linting.
keywords:
  - laradock swagger editor
  - openapi editor docker
  - swagger editor docker compose
  - write openapi spec browser
  - api spec validation
---

## What is Swagger Editor?

[Swagger Editor](https://github.com/swagger-api/swagger-editor) is a browser-based editor for writing OpenAPI (formerly Swagger) API specifications in YAML or JSON, with live syntax validation and a preview of the rendered documentation as you type. Laradock builds it from the official `swaggerapi/swagger-editor` image.

## Start Swagger Editor

```bash
docker compose up -d swagger-editor
```

## Stop Swagger Editor

```bash
docker compose stop swagger-editor
```

## Configuration

All settings live in `swagger-editor/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SWAGGER_EDITOR_PORT` | `5151` | Host-side port Swagger Editor is published on (`host:8080`, the editor listens on `8080` inside the container). |

## Open the editor

```bash
docker compose up -d swagger-editor
```

Open [http://localhost:5151](http://localhost:5151) (or your custom `SWAGGER_EDITOR_PORT`) and start writing your OpenAPI spec. `swagger-editor/compose.yml` doesn't mount any host folder into the container, so specs you write live in the browser's own storage (or wherever you manually export them to), not on disk in your project.

## Common issues

- **Port already in use on your host.** Another service (or another Laradock project) is already bound to `5151`. Change `SWAGGER_EDITOR_PORT` in `.env` and restart.
- **Spec disappears after closing the browser tab or restarting the container.** Nothing is persisted to your project files by default, since there's no volume mount in `swagger-editor/compose.yml`. Export/download your spec from the editor's UI regularly, or edit spec files in your own project and paste them in.
- **Blank page or connection refused.** Give the container a few seconds after `docker compose up`; check `docker compose logs swagger-editor` for startup errors.

---

Want to render a finished spec as interactive docs instead of editing it? See **[Swagger UI](/docs/services/swagger-ui)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
