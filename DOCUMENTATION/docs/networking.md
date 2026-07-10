---
slug: /networking
title: Networking & Domains
description: Point a real domain at your Laradock stack instead of the Docker IP, and install your own CA certificates into the workspace container.
keywords:
  - laradock custom domain
  - laradock hosts file
  - laradock nginx server_name
  - laradock ca certificates
  - docker compose networking
---

Laradock defaults to plain `localhost` access, but most projects eventually need a real-looking domain or trusted certificates inside the workspace. Both are quick, host-level changes.

## Use a custom domain

Use a real domain instead of the Docker IP. Assuming your domain is `laravel.test`:

1. Map it to localhost in your `/etc/hosts`:
   ```bash
   127.0.0.1    laravel.test
   ```
2. Open `http://laravel.test`.

Optionally set the server name in your NGINX config:

```conf
server_name laravel.test;
```

## Add CA certificates

To install your own CA certificates, drop them in the `workspace/ca-certificates` folder. They're added to the workspace container's system CA store on build.
