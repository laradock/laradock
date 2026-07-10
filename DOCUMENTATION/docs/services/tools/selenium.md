---
slug: /services/selenium
title: Selenium
description: Run Selenium in Laradock as a browser automation server for Dusk and other WebDriver-based end-to-end tests.
keywords:
  - laradock selenium
  - selenium docker
  - selenium docker compose
  - laravel dusk docker
  - webdriver docker
---

## What is Selenium?

[Selenium](https://www.selenium.dev) is a browser automation framework. Laradock runs a Selenium WebDriver server in its own container so you can drive real browser tests (Laravel Dusk, Panther, or any WebDriver client) without installing a browser and driver stack on your host.

## Start Selenium

```bash
docker compose up -d selenium
```

## Stop Selenium

```bash
docker compose stop selenium
```

## Configuration

Selenium's only Laradock-level setting lives in `selenium/defaults.env`:

| Variable | Default | What it does |
|---|---|---|
| `SELENIUM_PORT` | `4444` | Host port the Selenium WebDriver hub is published on. |

The container also mounts your host's `/dev/shm` into the container at the same path, browsers (especially Chrome) can run out of shared memory and crash without this.

## Connect a WebDriver client

```bash
docker compose up -d selenium
```

Open [http://localhost:4444/wd/hub](http://localhost:4444/wd/hub) to confirm the hub is up. Point your WebDriver client (Dusk, Panther, raw Selenium bindings) at that same URL. From inside another Laradock container, use `http://selenium:4444/wd/hub` instead of `localhost`.

## Common issues

- **Browser crashes mid-test with no clear error.** This is almost always `/dev/shm` running out of space under a heavy test suite; the container already mounts the host's `/dev/shm`, if you're still hitting this, check available shared memory on your host.
- **Tests hang waiting for a session.** Confirm the container actually started: `docker compose logs selenium`. A hub that never reports itself ready will leave WebDriver clients waiting indefinitely.
- **App under test can't be reached by the browser.** The Selenium container needs to reach your app over the Docker network, use a container name (e.g. `nginx` or `http://workspace`) in your base test URL, not `localhost`, which inside the `selenium` container refers to itself.
- **Port already in use on your host.** Change `SELENIUM_PORT` in `.env` and restart: `docker compose up -d selenium`.

---

Running Laravel Dusk? See the [Dusk documentation](https://laravel.com/docs/dusk) for driving it against this hub. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
