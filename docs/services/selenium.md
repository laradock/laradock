# Selenium

Source: https://laradock.io/docs/services/selenium

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Selenium?

[Selenium](https://www.selenium.dev) is a browser automation framework. Laradock runs a Selenium WebDriver server in its own container so you can drive real browser tests (Laravel Dusk, Panther, or any WebDriver client) without installing a browser and driver stack on your host.

## Start Selenium

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start selenium
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d selenium
```

</TabItem>
</Tabs>

## Stop Selenium

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop selenium
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop selenium
```

</TabItem>
</Tabs>

Selenium keeps no data between runs, so there's nothing to preserve or lose here, stopping (or removing) the container just frees the port until you start it again.

## Configuration

Selenium's only Laradock-level setting lives in `selenium/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `SELENIUM_PORT` | `4444` | Host port the Selenium WebDriver hub is published on. |

The container also mounts your host's `/dev/shm` into the container at the same path, browsers (especially Chrome) can run out of shared memory and crash without this.

## Connect a WebDriver client

Open [http://localhost:4444/wd/hub](http://localhost:4444/wd/hub) to confirm the hub is up. Point your WebDriver client (Dusk, Panther, raw Selenium bindings) at that same URL. From inside another Laradock container, use `http://selenium:4444/wd/hub` instead of `localhost`.

## Watch the browser live (noVNC)

The underlying image (`selenium/standalone-chrome`) runs a VNC server alongside the browser, so you can literally watch what your tests are doing instead of guessing from a stack trace. It isn't published by default in `selenium/compose.yml`, add the port mapping yourself:

```yaml
services:
  selenium:
    ports:
      - "${SELENIUM_PORT}:4444"
      - "7900:7900"
```

Then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart selenium
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart selenium
```

</TabItem>
</Tabs>

Open [http://localhost:7900](http://localhost:7900) in a browser and connect, the default noVNC password is `secret`. Useful for debugging a test that fails only in CI-like headless conditions.

## Use a different browser

Laradock's `selenium/Dockerfile` is pinned to `selenium/standalone-chrome`. To test against Firefox instead, point it at the equivalent upstream image:

```dockerfile
FROM selenium/standalone-firefox
```

Then rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild selenium
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build selenium
```

</TabItem>
</Tabs>

Everything else on this page (port, `/dev/shm`, VNC) works the same regardless of which browser image you use.

## Common issues

- **Browser crashes mid-test with no clear error.** This is almost always `/dev/shm` running out of space under a heavy test suite; the container already mounts the host's `/dev/shm`, if you're still hitting this, check available shared memory on your host.
- **Tests hang waiting for a session.** Confirm the container actually started: `./laradock logs selenium`. A hub that never reports itself ready will leave WebDriver clients waiting indefinitely.
- **App under test can't be reached by the browser.** The Selenium container needs to reach your app over the Docker network, use a container name (e.g. `nginx` or `http://workspace`) in your base test URL, not `localhost`, which inside the `selenium` container refers to itself.
- **Port already in use on your host.** Change `SELENIUM_PORT` in `.env` and restart: `./laradock restart selenium`.

---

Running Laravel Dusk? See the [Dusk documentation](https://laravel.com/docs/dusk) for driving it against this hub. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
