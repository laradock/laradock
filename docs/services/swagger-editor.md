# Swagger Editor

Source: https://laradock.io/docs/services/swagger-editor

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Swagger Editor?

[Swagger Editor](https://github.com/swagger-api/swagger-editor) is a browser-based editor for writing OpenAPI (formerly Swagger) API specifications in YAML or JSON, with live syntax validation and a preview of the rendered documentation as you type. Laradock builds it from the official `swaggerapi/swagger-editor` image.

## Start Swagger Editor

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start swagger-editor
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d swagger-editor
```

</TabItem>
</Tabs>

Open [http://localhost:5151](http://localhost:5151) (or your custom `SWAGGER_EDITOR_PORT`) and start writing your OpenAPI spec. `swagger-editor/compose.yml` doesn't mount any host folder into the container, so specs you write live in the browser's own storage (or wherever you manually export them to), not on disk in your project.

## Stop Swagger Editor

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop swagger-editor
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop swagger-editor
```

</TabItem>
</Tabs>

To delete the container entirely (there's no data volume to worry about, since nothing on disk belongs to this service):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove swagger-editor
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf swagger-editor
```

</TabItem>
</Tabs>

## Configuration

All settings live in `swagger-editor/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SWAGGER_EDITOR_PORT` | `5151` | Host-side port Swagger Editor is published on (`host:8080`, the editor listens on `8080` inside the container). |

## Importing and exporting your spec

Since nothing is persisted to disk by Laradock, the spec you're editing only exists in the browser tab until you explicitly save it somewhere. Use the editor's own **File** menu to:

- **Import File** or **Import URL** to load an existing spec (YAML or JSON) into the editor.
- **Download YAML** / **Download JSON** to save your current spec back to your machine, or into your project's own repo so it's tracked in git.

Treat the running container as a scratchpad, not storage: always download before closing the tab or restarting the container.

## Update to the latest image

`swagger-editor/Dockerfile` builds from `swaggerapi/swagger-editor:latest`, so Docker will keep reusing whatever image layer you already have cached, it won't fetch a newer `latest` on its own. To pull the newest upstream release and rebuild:

```bash
docker pull swaggerapi/swagger-editor:latest
docker compose build --no-cache swagger-editor
```

Then start it again with the `Start Swagger Editor` command above.

## Common issues

- **Port already in use on your host.** Another service (or another Laradock project) is already bound to `5151`. Change `SWAGGER_EDITOR_PORT` in `.env` and restart with `./laradock restart swagger-editor`.
- **Spec disappears after closing the browser tab or restarting the container.** Nothing is persisted to your project files by default, since there's no volume mount in `swagger-editor/compose.yml`. Export/download your spec from the editor's UI regularly, or edit spec files in your own project and paste them in.
- **Blank page or connection refused.** Give the container a few seconds after starting; check `./laradock logs swagger-editor` for startup errors.

---

Want to render a finished spec as interactive docs instead of editing it? See **[Swagger UI](https://laradock.io/docs/services/swagger-ui)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
