# Networking & Domains

Source: https://laradock.io/docs/networking

How the pieces of your stack reach each other, how to swap plain `localhost` for a real-looking domain, and how to trust your own certificates inside the workspace.

## Connect your app to a service

Inside Laradock's network, every container is reachable by its **service name** used as the hostname. So your application talks to a service by its name, not `localhost`. In your project's `.env`:

```env
DB_HOST=mysql
REDIS_HOST=redis
QUEUE_HOST=beanstalkd
```

The same rule holds for every service: `postgres`, `mongo`, `elasticsearch`, and so on are each reachable at their own name from your app and from inside the `workspace`. Each service's own [service page](https://laradock.io/docs/Intro#supported-services) lists its exact hostname and default port.

From your **host** machine (a GUI client, a browser, a tool outside Docker), reach the same services at `localhost` on their published port instead, for example `localhost:3306` for MySQL. To go the other way, from inside a container back to something running on your host, use `host.docker.internal` as the hostname.

## Change a service's port

Every service publishes its host port through a variable in your `.env`, so you never edit a compose file to move a port. To serve MySQL on `3307` instead of the default `3306`:

```env
MYSQL_PORT=3307
```

Restart the service for it to take effect. Each service page lists its own port variable, and they all follow the same `<SERVICE>_PORT` pattern.

### "Port is already in use"

If a container won't start and Docker reports `bind: address already in use`, something else on your host already holds that port, usually a native install of the same software (a local MySQL or Postgres) or another Laradock project. Two ways out:

- **Move Laradock's port.** Set a free port in your `.env` (for example `MYSQL_PORT=3307`) and connect to that from the host. The container network is unchanged, so `DB_HOST=mysql` still talks to the service on its standard port.
- **Free the port.** Stop whatever else is using it. Find the culprit with `lsof -i :3306` (macOS/Linux) or `netstat -ano | findstr :3306` (Windows).

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
