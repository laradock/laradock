---
slug: /services/gitlab-runner
title: GitLab Runner
description: Register a GitLab Runner in Laradock to execute CI/CD pipelines for your self-hosted GitLab instance.
keywords:
  - laradock gitlab runner
  - gitlab runner docker
  - gitlab runner docker compose
  - gitlab ci docker
  - register gitlab runner
---

## What is GitLab Runner?

[GitLab Runner](https://docs.gitlab.com/runner/) is the agent that picks up and executes jobs defined in a project's `.gitlab-ci.yml`. It pairs with the **[GitLab](/docs/services/gitlab)** service: GitLab schedules pipelines, the runner actually executes them.

## Start GitLab Runner

```bash
docker compose up -d gitlab-runner
```

## Stop GitLab Runner

```bash
docker compose stop gitlab-runner
```

## Configuration

All settings live in `gitlab-runner/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `GITLAB_CI_SERVER_URL` | `http://localhost:8989` | URL of the GitLab instance the runner registers against. |
| `GITLAB_RUNNER_REGISTRATION_TOKEN` | `<my-registration-token>` | Token from your GitLab project used to register the runner. |
| `GITLAB_REGISTER_NON_INTERACTIVE` | `true` | Runs `gitlab-runner register` without prompting when set. |

By default `gitlab-runner/compose.yml` runs the runner with `RUNNER_EXECUTOR=shell`. It also mounts `/var/run/docker.sock`, so you can switch to a Docker executor instead (see below).

## Register the runner against GitLab

1. In your GitLab project, go to **Settings → CI/CD → Runners** and copy the registration token.
2. Set these in `.env` (use the container name, not `localhost`, since the runner talks to GitLab over the Docker network):
   ```env
   GITLAB_DOMAIN_NAME=http://gitlab
   GITLAB_RUNNER_REGISTRATION_TOKEN=<value-from-step-1>
   GITLAB_CI_SERVER_URL=http://gitlab
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
   ```bash
   docker compose up -d gitlab-runner
   ```
5. Register it:
   ```bash
   docker compose exec gitlab-runner bash
   gitlab-runner register
   ```
6. Add a `.gitlab-ci.yml` to your project, push, and confirm the pipeline runs:
   ```yml
   before_script:
     - echo Hello!

   job1:
     scripts:
       - echo job1
   ```

## Common issues

- **Runner registers but jobs never pick up.** Confirm `GITLAB_CI_SERVER_URL` points to a URL the runner container can actually reach, `http://gitlab` (container name), not `http://localhost`.
- **`REGISTRATION_TOKEN` rejected.** Tokens are per-project (or per-group/instance depending on your GitLab setup) and can be regenerated in GitLab's **Settings → CI/CD → Runners**, grab a fresh one if registration fails.
- **Docker-executor jobs can't reach other Laradock services.** Make sure `DOCKER_NETWORK_MODE` matches your actual Compose project's network name (`laradock_backend` by default, but it's prefixed by `COMPOSE_PROJECT_NAME`).
- **Re-registering after changing executors.** Changing `RUNNER_EXECUTOR` after the runner is already registered doesn't retroactively apply, re-run `gitlab-runner register` (or clear `DATA_PATH_HOST/gitlab/runner` and start fresh).

---

Need the GitLab server this runner connects to? See **[GitLab](/docs/services/gitlab)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
