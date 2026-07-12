# Varnish

Source: https://laradock.io/docs/services/varnish

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Varnish?

[Varnish](https://varnish-cache.org) is an HTTP accelerator that caches responses in memory to serve repeat requests without hitting your app. In Laradock it sits behind Nginx: Nginx listens on 80/443 and forwards to Varnish, and Varnish forwards back to Nginx on port 81 (`VARNISH_BACKEND_PORT`). The shipped config was developed and tested for WordPress but likely works with other systems too; the approach is based on [this Linode guide](https://www.linode.com/docs/websites/varnish/use-varnish-and-nginx-to-serve-wordpress-over-ssl-and-http-on-debian-8/).

## Start Varnish

Varnish's own startup checks the backend's availability, so start Nginx first:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start nginx
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d nginx
```

</TabItem>
</Tabs>

Then start Varnish itself:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start proxy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d proxy
```

</TabItem>
</Tabs>

The service ships as two containers, `proxy` and `proxy2` (both defined in `varnish/compose.yml`), so it can front two different domains/backends at once. Start the second one the same way if you need it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start proxy2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d proxy2
```

</TabItem>
</Tabs>

## Stop Varnish

Varnish's cache lives entirely in memory (`malloc` storage), so stopping the container **discards the cache**, there's nothing to back up:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop proxy proxy2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop proxy proxy2
```

</TabItem>
</Tabs>

To delete the containers entirely:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove proxy proxy2
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf proxy proxy2
```

</TabItem>
</Tabs>

## Configuration

All settings live in `varnish/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `VARNISH_CONFIG` | `/etc/varnish/default.vcl` | Path to the active VCL config inside the container. |
| `VARNISH_PORT` | `6081` | Port Varnish listens on. |
| `VARNISHD_PARAMS` | `-p default_ttl=3600 -p default_grace=3600` | Extra flags passed to `varnishd`. |
| `VARNISH_PROXY1_CACHE_SIZE` | `128m` | Cache size for the first proxy (`proxy`). |
| `VARNISH_PROXY1_BACKEND_HOST` | `workspace` | Domain/host the first proxy serves. |
| `VARNISH_PROXY1_SERVER` | `SERVER1` | Server label for the first proxy. |
| `VARNISH_PROXY2_CACHE_SIZE` | `128m` | Cache size for the second proxy (`proxy2`). |
| `VARNISH_PROXY2_BACKEND_HOST` | `workspace` | Domain/host the second proxy serves. |
| `VARNISH_PROXY2_SERVER` | `SERVER2` | Server label for the second proxy. |

`VARNISH_BACKEND_PORT` (default `81`, the port Nginx listens on for traffic coming back from Varnish) lives in the project's root `.env`, not `varnish/defaults.env`, since Nginx's `compose.yml` also reads it.

These are all read at **container start**, not baked into the image, so after changing any of them in `.env` you need to recreate the container rather than just restart it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start proxy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d proxy
```

</TabItem>
</Tabs>

`docker compose restart` reuses the existing container as-is and won't pick up the new value; `up -d` recreates it with the current `.env`. Either way the cache is memory-only, so recreating the container is never a data-loss concern here.

## Configure a domain

1. Set your domain in `VARNISH_PROXY1_BACKEND_HOST`.
2. Update your Varnish config and add a matching Nginx config, using `nginx/sites/laravel_varnish.conf.example` as a starting point.
3. Rename `default_wordpress.vcl` to `default.vcl` to use the WordPress-tuned config instead of the older `default.vcl`.

## Serve multiple domains

1. Add a second configuration section to `.env`:
   ```env
   VARNISH_PROXY1_CACHE_SIZE=128m
   VARNISH_PROXY1_BACKEND_HOST=replace_with_your_domain.name
   VARNISH_PROXY1_SERVER=SERVER1
   ```
2. Add a matching service to `varnish/compose.yml`, modeled on `proxy2`:
   ```yaml
   custom_proxy_name:
     container_name: custom_proxy_name
     build: ./varnish
     expose:
       - ${VARNISH_PORT}
     environment:
       - VARNISH_CONFIG=${VARNISH_CONFIG}
       - CACHE_SIZE=${VARNISH_PROXY2_CACHE_SIZE}
       - VARNISHD_PARAMS=${VARNISHD_PARAMS}
       - VARNISH_PORT=${VARNISH_PORT}
       - BACKEND_HOST=${VARNISH_PROXY2_BACKEND_HOST}
       - BACKEND_PORT=${VARNISH_BACKEND_PORT}
       - VARNISH_SERVER=${VARNISH_PROXY2_SERVER}
     ports:
       - "${VARNISH_PORT}:${VARNISH_PORT}"
     links:
       - workspace
     networks:
       - frontend
   ```

## Purge and reload

**Purge the cache** for a URL (evicts it so the next request goes to the backend again):

```bash
curl -X PURGE https://yourwebsite.com/
```

**Reload Varnish** after changing VCL, without dropping the whole cache:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec proxy varnishreload
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec proxy varnishreload
```

</TabItem>
</Tabs>

**Reload Nginx** too if you also changed its site config:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec nginx nginx -t
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec nginx nginx -t
```

</TabItem>
</Tabs>

`nginx -t` only validates the config; once it reports no errors, apply it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec nginx nginx -s reload
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec nginx nginx -s reload
```

</TabItem>
</Tabs>

Allowed Varnish CLI commands inside the container: `varnishadm`, `varnishd`, `varnishhist`, `varnishlog`, `varnishncsa`, `varnishreload`, `varnishstat`, `varnishtest`, `varnishtop`.

## Check whether caching is working

Open a terminal inside the proxy container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter proxy
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec proxy bash
```

</TabItem>
</Tabs>

Then, from inside the container:

- **Live hit/miss stats**: `varnishstat` (add `-1` for a single one-shot snapshot instead of the live dashboard). Look at `cache_hit` vs `cache_miss`, a healthy cache should show `cache_hit` climbing on repeat requests.
- **Backend health**: `varnishadm backend.list`. The configured backend (`server1`, from `default.vcl`'s health probe) should show `Healthy`; if it says `Sick`, Varnish can't reach `VARNISH_PROXY1_BACKEND_HOST`/`VARNISH_PROXY1_BACKEND_PORT` and will fail closed to serving errors.
- **Per-request trace**: `varnishlog` streams every request live, showing whether each one was a `hit` or a `miss` and why.
- **Validate a VCL file before reloading**: `varnishd -C -f /etc/varnish/default.vcl > /dev/null` compiles the file and exits without starting a server, it fails loudly on a syntax error instead of leaving you to debug a crashed reload.

## Common issues

- **Varnish container fails to build.** It's expected to be built after Nginx is already up, since it checks the domain's availability at build/start time; run `./laradock start nginx` first.
- **Stale content keeps being served.** Purge the cache (`curl -X PURGE ...`) or reload Varnish (`varnishreload`) after deploying changes.
- **Wrong backend served.** Confirm `VARNISH_PROXY1_BACKEND_HOST`/`VARNISH_PROXY2_BACKEND_HOST` match the domain in the corresponding Nginx site config, and that you're using `default_wordpress.vcl` (renamed to `default.vcl`) if following the WordPress setup.
- **Changed `.env` but nothing happened.** `VARNISH_PORT`, `VARNISHD_PARAMS`, and the cache size/backend variables are only read when the container is created. `./laradock restart proxy` reuses the old values; run `./laradock start proxy` again to recreate it with the new `.env`.
- **Cache is always empty after a deploy.** Expected: the cache is in-memory only (`malloc` storage), so it's wiped every time the container stops, restarts, or is recreated, not just when you purge it manually.
- **`varnishadm backend.list` shows `Sick`.** The health probe in `default.vcl`/`default_wordpress.vcl` can't reach the backend on `BACKEND_HOST`/`BACKEND_PORT`. Confirm the backend service (usually `workspace`, per `VARNISH_PROXY1_BACKEND_HOST`) is running and listening on the expected port.

---

Varnish sits in front of **[Nginx](https://laradock.io/docs/services/nginx)**; for balancing across multiple Varnish instances see **[HAProxy](https://laradock.io/docs/services/haproxy)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
