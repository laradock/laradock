---
slug: /services/certbot
title: Certbot
description: Run Certbot in Laradock to obtain free Let's Encrypt TLS certificates via the webroot HTTP-01 challenge, for use with nginx, apache2, or caddy.
keywords:
  - laradock certbot
  - lets encrypt docker
  - free ssl certificate docker
  - certbot docker compose
  - webroot challenge nginx
  - https docker laravel
---

## What is Certbot?

[Certbot](https://certbot.eff.org) is the standard client for [Let's Encrypt](https://letsencrypt.org), issuing free, automated TLS/SSL certificates. Laradock runs it as a one-shot container that requests a certificate via the HTTP-01 "webroot" challenge, it doesn't serve traffic itself, it just proves domain ownership through your existing web server and writes out the certificate files.

## Start Certbot

```bash
docker compose up -d certbot
```

Certbot needs a domain that already resolves to your server and a web server (`nginx`, `apache2`, or `caddy`) listening on port 80 to serve the challenge, since the webroot method requires Let's Encrypt to fetch a file over plain HTTP before it will issue a certificate.

## Stop Certbot

```bash
docker compose stop certbot
```

Certbot's `run-certbot.sh` runs once at container start and then the container just sleeps, so stopping it is safe at any time and doesn't affect certificates already issued.

## Configuration

`certbot/defaults.env` is empty. The two values Certbot needs, domain and email, are hardcoded directly in `certbot/compose.yml`:

```yaml
environment:
  - CN="fake.domain.com"
  - EMAIL="fake.email@gmail.com"
```

Edit `certbot/compose.yml` and replace `CN` with your real domain and `EMAIL` with your real address, then rebuild:

```bash
docker compose build certbot
```

## How the certificate is issued

`certbot/Dockerfile` builds on `phusion/baseimage:bionic-1.0.0`, installs the `letsencrypt` apt package, and runs `certbot/run-certbot.sh` as its entrypoint:

```bash
letsencrypt certonly --webroot -w /var/www/letsencrypt -d "$CN" --agree-tos --email "$EMAIL" --non-interactive --text
```

`/var/www/letsencrypt` inside the container is bind-mounted from `./certbot/letsencrypt/` on your host. For the challenge to succeed, your web server must serve that same folder at `http://your-domain/.well-known/acme-challenge/`. Laradock's shipped `nginx/sites/*.conf` files already include that `location` block pointing at `/var/www/letsencrypt/`, but as of this writing `nginx/compose.yml` does not itself mount `./certbot/letsencrypt/` into the nginx container, so you need to add that volume mapping to `nginx/compose.yml` (or your `apache2`/`caddy` equivalent) yourself before Certbot's challenge can be reached.

On success, `run-certbot.sh` copies the issued files into `./data/certbot/certs/` on your host:

- `<domain>-cert1.pem`
- `chain1.pem`
- `fullchain1.pem`
- `<domain>-privkey1.pem`

Point your web server's SSL config at those files.

## Common issues

- **Challenge fails / "Invalid response" from Let's Encrypt.** Almost always means the web server isn't serving `./certbot/letsencrypt/` at `/.well-known/acme-challenge/` on port 80, or the domain doesn't resolve to this server yet. Confirm the volume mapping and DNS before retrying.
- **Still using `fake.domain.com` / `fake.email@gmail.com`.** These are placeholders in `certbot/compose.yml`. Certbot will fail (or issue a cert nobody can use) until you set them to real values and rebuild.
- **Rate limited by Let's Encrypt.** Let's Encrypt caps retries per domain per week. Test with their staging environment first if you're iterating on config, this Dockerfile's script doesn't include a `--staging` flag by default, so you'd need to add one temporarily.
- **Certificate doesn't renew automatically.** `run-certbot.sh` only runs once, at container start, it doesn't set up a renewal cron. Re-run `docker compose up -d certbot` (or `docker compose restart certbot`) periodically, or wire up your own renewal schedule.

---

Pair this with **[nginx](/docs/services/nginx)** or **[Apache2](/docs/services/apache2)** to actually serve HTTPS traffic. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
