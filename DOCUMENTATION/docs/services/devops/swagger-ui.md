---
slug: /services/swagger-ui
title: Swagger UI
description: Run Swagger UI in Laradock to render interactive, browsable API documentation from an OpenAPI/Swagger spec.
keywords:
  - laradock swagger ui
  - openapi documentation docker
  - swagger ui docker compose
  - interactive api docs
  - render openapi spec
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Swagger UI?

[Swagger UI](https://github.com/swagger-api/swagger-ui) renders an OpenAPI (formerly Swagger) specification as interactive, browsable API documentation, complete with a "try it out" panel for firing real requests at your API. Laradock builds it from the official `swaggerapi/swagger-ui` image.

## Start Swagger UI

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start swagger-ui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d swagger-ui
```

</TabItem>
</Tabs>

Swagger UI is stateless, it doesn't store any data of its own, it just renders whatever spec `SWAGGER_API_URL` points at.

## Stop Swagger UI

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop swagger-ui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop swagger-ui
```

</TabItem>
</Tabs>

To delete the container entirely (nothing to lose, there's no data volume):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove swagger-ui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf swagger-ui
```

</TabItem>
</Tabs>

## Configuration

All settings live in `swagger-ui/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `SWAGGER_API_URL` | `http://generator.swagger.io/api/swagger.json` | The URL Swagger UI fetches its OpenAPI spec from, passed into the container as the `API_URL` environment variable. |
| `SWAGGER_UI_PORT` | `5555` | Host-side port Swagger UI is published on (`host:8080`, the UI listens on `8080` inside the container). |

## Point it at your own API spec

```env
SWAGGER_API_URL=http://your-app.test/api/openapi.json
```

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart swagger-ui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d swagger-ui
```

</TabItem>
</Tabs>

Open [http://localhost:5555](http://localhost:5555) (or your custom `SWAGGER_UI_PORT`). `SWAGGER_API_URL` must be reachable from inside the `swagger-ui` container, so if your spec is served by another Laradock container, use its container name (for example `http://nginx/api/openapi.json`) rather than `localhost`.

## View logs

Useful when the UI shows a blank page or a spec fails to load:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs swagger-ui
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 swagger-ui
```

</TabItem>
</Tabs>

## Keep the image up to date

Laradock builds Swagger UI `FROM swaggerapi/swagger-ui:latest`. Docker only pulls the `latest` tag the first time it's built, a plain rebuild reuses whatever was already pulled and won't fetch newer releases. To actually pull the newest upstream image and rebuild against it:

```bash
docker compose build --pull swagger-ui
```

Then start the container again with your normal `./laradock start swagger-ui` (or `docker compose up -d swagger-ui`).

## Common issues

- **Still showing the default demo spec.** `SWAGGER_API_URL` only takes effect on container start. Set it in `.env` and run `./laradock restart swagger-ui` to apply it.
- **"Failed to fetch" when loading your spec.** If your API lives in another Laradock container, `localhost` from inside `swagger-ui` refers to the `swagger-ui` container itself, not your host or your API container. Use the API's container name instead (Laradock containers share the `backend` network).
- **CORS errors in the browser console.** Swagger UI fetches the spec client-side from your browser, not just server-side, so your API must also send CORS headers allowing the origin `http://localhost:5555` (or your custom port).
- **Port already in use on your host.** Another service (or another Laradock project) is already bound to `5555`. Change `SWAGGER_UI_PORT` in `.env` and restart with `./laradock restart swagger-ui`.
- **Image never picks up a newer Swagger UI release.** See [Keep the image up to date](#keep-the-image-up-to-date) above, `latest` is only resolved once unless you explicitly `--pull`.

---

Writing the spec by hand? See **[Swagger Editor](/docs/services/swagger-editor)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
