# GitLab Runner

Source: https://laradock.io/docs/services/gitlab-runner

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is GitLab Runner?

[GitLab Runner](https://docs.gitlab.com/runner/) is the agent that picks up and executes jobs defined in a project's `.gitlab-ci.yml`. It pairs with the **[GitLab](https://laradock.io/docs/services/gitlab)** service: GitLab schedules pipelines, the runner actually executes them.

## Start GitLab Runner

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start gitlab-runner
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d gitlab-runner
```

</TabItem>
</Tabs>

## Stop GitLab Runner

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop gitlab-runner
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop gitlab-runner
```

</TabItem>
</Tabs>

## Configuration

All settings live in `gitlab-runner/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `GITLAB_CI_SERVER_URL` | `http://localhost:8989` | URL of the GitLab instance the runner registers against. |
| `GITLAB_RUNNER_REGISTRATION_TOKEN` | `<my-registration-token>` | Token from your GitLab project used to register the runner. |
| `GITLAB_REGISTER_NON_INTERACTIVE` | `true` | Runs `gitlab-runner register` without prompting when set. |

By default `gitlab-runner/compose.yml` runs the runner with `RUNNER_EXECUTOR=shell` and mounts `/var/run/docker.sock`, so you can switch to a Docker executor instead (see below). Its config and registration state persist under `DATA_PATH_HOST/gitlab/runner` (mounted to `/etc/gitlab-runner` in the container).

## Register the runner against GitLab

1. In your GitLab project, go to **Settings → CI/CD → Runners** and copy the registration token.
2. Set these in `.env` (use the container name, not `localhost`, since the runner talks to GitLab over the Docker network):
   ```env
   GITLAB_CI_SERVER_URL=http://gitlab
   GITLAB_RUNNER_REGISTRATION_TOKEN=<value-from-step-1>
   ```
3. To use the Docker executor instead of the default shell executor, add this to `gitlab-runner/compose.yml`:
   ```yml
   gitlab-runner:
     environment: # used during `gitlab-runner register`
       - RUNNER_EXECUTOR=docker # change from shell (default)
       - DOCKER_IMAGE=alpine
       - DOCKER_NETWORK_MODE=laradock_backend
     networks:
       - backend # connect to the network where gitlab runs
   ```
4. Start the runner:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start gitlab-runner
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d gitlab-runner
```

</TabItem>
</Tabs>

5. Register it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter gitlab-runner
gitlab-runner register
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec gitlab-runner bash
gitlab-runner register
```

</TabItem>
</Tabs>

With `GITLAB_REGISTER_NON_INTERACTIVE=true` (the default), `register` picks up `CI_SERVER_URL` and `REGISTRATION_TOKEN` from the environment automatically and doesn't prompt you for them.

6. Add a `.gitlab-ci.yml` to your project, push, and confirm the pipeline runs:
   ```yml
   before_script:
     - echo Hello!

   job1:
     scripts:
       - echo job1
   ```

## Check runner status and logs

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs gitlab-runner
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 gitlab-runner
```

</TabItem>
</Tabs>

To list every runner currently registered against this container (useful after re-registering or when you're not sure whether registration actually took):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter gitlab-runner
gitlab-runner list
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec gitlab-runner bash
gitlab-runner list
```

</TabItem>
</Tabs>

## Unregister a runner

Do this before re-registering with different settings (a new executor, a different GitLab instance), stale registrations otherwise pile up in `config.toml`:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter gitlab-runner
gitlab-runner unregister --all-runners
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec gitlab-runner bash
gitlab-runner unregister --all-runners
```

</TabItem>
</Tabs>

## Start completely fresh (wipe registration)

Registration state and `config.toml` live under `DATA_PATH_HOST/gitlab/runner` on your host. To throw it away and register from a clean state:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop gitlab-runner
./laradock remove gitlab-runner
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/gitlab/runner"
./laradock start gitlab-runner
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop gitlab-runner
docker compose rm -sf gitlab-runner
rm -rf "${DATA_PATH_HOST:-~/.laradock/data}/gitlab/runner"
docker compose up -d gitlab-runner
```

</TabItem>
</Tabs>

You'll need to run [Register the runner against GitLab](#register-the-runner-against-gitlab) again afterward, the registration token from GitLab is still valid, only this container's local state was wiped.

## Common issues

- **Runner registers but jobs never pick up.** Confirm `GITLAB_CI_SERVER_URL` points to a URL the runner container can actually reach, `http://gitlab` (container name), not `http://localhost`.
- **`REGISTRATION_TOKEN` rejected.** Tokens are per-project (or per-group/instance depending on your GitLab setup) and can be regenerated in GitLab's **Settings → CI/CD → Runners**, grab a fresh one if registration fails.
- **Docker-executor jobs can't reach other Laradock services.** Make sure `DOCKER_NETWORK_MODE` matches your actual Compose project's network name (`laradock_backend` by default, but it's prefixed by `COMPOSE_PROJECT_NAME`).
- **Re-registering after changing executors.** Changing `RUNNER_EXECUTOR` after the runner is already registered doesn't retroactively apply, [unregister](#unregister-a-runner) and register again, or [start completely fresh](#start-completely-fresh-wipe-registration).

---

Need the GitLab server this runner connects to? See **[GitLab](https://laradock.io/docs/services/gitlab)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
