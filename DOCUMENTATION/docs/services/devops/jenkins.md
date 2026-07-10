---
slug: /services/jenkins
title: Jenkins
description: Run Jenkins in Laradock. Start the container, unlock it with the initial admin password, and configure security and users.
keywords:
  - laradock jenkins
  - jenkins docker
  - jenkins docker compose
  - jenkins initial admin password
  - jenkins ci docker
---

## What is Jenkins?

[Jenkins](https://www.jenkins.io) is a widely used open-source automation server for building CI/CD pipelines: running tests, building artifacts, and deploying on every push. Laradock runs it as its own privileged container with access to the Docker socket, so pipeline jobs can build and run other containers.

## Start Jenkins

```bash
docker compose up -d jenkins
```

## Stop Jenkins

```bash
docker compose stop jenkins
```

This stops the container without deleting its data. Jenkins state lives under `JENKINS_HOME` on your host, so it survives the container being removed with `docker compose rm -f jenkins`.

## Configuration

All settings live in `jenkins/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `JENKINS_HOST_HTTP_PORT` | `8090` | Host-side port the Jenkins web UI is published on. |
| `JENKINS_HOST_SLAVE_AGENT_PORT` | `50000` | Host-side port for Jenkins build agents (JNLP). |
| `JENKINS_HOME` | `./jenkins/jenkins_home` | Host folder mounted to `/var/jenkins_home`, holds all jobs, plugins, and config. |

The container also runs `privileged: true` and mounts `/var/run/docker.sock`, so Jenkins jobs can build and run Docker containers directly.

## Initial setup

1. Start the container, then open [http://localhost:8090/](http://localhost:8090/).
2. Sign in with user `admin` and the auto-generated password:
   ```bash
   docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Install the suggested plugins and create your own admin user when prompted.

## Admin tasks

- Enter the container as root (needed for some plugin installs or system packages):
  ```bash
  docker compose exec --user root jenkins bash
  ```
- Add a user manually at [http://localhost:8090/securityRealm/addUser](http://localhost:8090/securityRealm/addUser).
- Review or lock down authorization at [http://localhost:8090/configureSecurity/](http://localhost:8090/configureSecurity/).
- Restart Jenkins itself (without restarting the container) at [http://localhost:8090/restart](http://localhost:8090/restart).

## Common issues

- **Can't find the initial admin password.** It only exists before the setup wizard finishes; run the `cat /var/jenkins_home/secrets/initialAdminPassword` command above right after first start.
- **Port `8090` already in use.** Another local service is bound to it. Change `JENKINS_HOST_HTTP_PORT` in `.env` and restart: `docker compose up -d jenkins`.
- **Jobs that build Docker images fail.** Confirm the job actually has access to `/var/run/docker.sock` (mounted by default) and that the container is still running `privileged: true`.
- **Losing jobs/plugins between rebuilds.** Everything Jenkins-specific lives under `JENKINS_HOME` on your host; don't delete that folder unless you intend to reset Jenkins entirely.

---

Need a full CI/CD pipeline with its own Git server instead? See **[GitLab](/docs/services/gitlab)** or **[OneDev](/docs/services/onedev)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
