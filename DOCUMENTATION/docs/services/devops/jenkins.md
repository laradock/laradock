---
slug: /services/jenkins
title: Jenkins
description: Run Jenkins in Laradock. Start the container, unlock it with the initial admin password, configure security and users, back up JENKINS_HOME, and fix common issues.
keywords:
  - laradock jenkins
  - jenkins docker
  - jenkins docker compose
  - jenkins initial admin password
  - jenkins ci docker
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is Jenkins?

[Jenkins](https://www.jenkins.io) is a widely used open-source automation server for building CI/CD pipelines: running tests, building artifacts, and deploying on every push. Laradock runs it as its own privileged container with access to the Docker socket, so pipeline jobs can build and run other containers.

## Start Jenkins

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start jenkins
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d jenkins
```

</TabItem>
</Tabs>

Jenkins state is created on first start under `JENKINS_HOME` and kept between restarts.

## Stop Jenkins

Stopping just pauses the container; **your data is safe**:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop jenkins
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop jenkins
```

</TabItem>
</Tabs>

To delete the container entirely (the data on disk is still untouched, it lives under `JENKINS_HOME`):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove jenkins
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf jenkins
```

</TabItem>
</Tabs>

## Logs

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock logs jenkins
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose logs --tail=100 jenkins
```

</TabItem>
</Tabs>

## Configuration

All settings live in `jenkins/defaults.env` and can be overridden by adding the same line to your own `.env` (your `.env` always wins):

| Variable | Default | What it does |
|---|---|---|
| `JENKINS_HOST_HTTP_PORT` | `8090` | Host-side port the Jenkins web UI is published on. |
| `JENKINS_HOST_SLAVE_AGENT_PORT` | `50000` | Host-side port for Jenkins build agents (JNLP). |
| `JENKINS_HOME` | `./jenkins/jenkins_home` | Host folder mounted to `/var/jenkins_home`, holds all jobs, plugins, and config. |

The container also runs `privileged: true` and mounts `/var/run/docker.sock`, so Jenkins jobs can build and run Docker containers directly.

## Initial setup

1. Start the container, then open [http://localhost:8090/](http://localhost:8090/) (or your `JENKINS_HOST_HTTP_PORT`).
2. Sign in with user `admin` and the auto-generated password:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

</TabItem>
</Tabs>

3. Install the suggested plugins and create your own admin user when prompted.

## Admin tasks

Enter the container as **root** (needed for some plugin installs or system packages, no friendly CLI shortcut for the root user, use Docker Compose directly):

```bash
docker compose exec --user root jenkins bash
```

For a regular (non-root) shell instead, use the standard `enter` verb:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter jenkins
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec jenkins bash
```

</TabItem>
</Tabs>

- Add a user manually at [http://localhost:8090/securityRealm/addUser](http://localhost:8090/securityRealm/addUser).
- Review or lock down authorization at [http://localhost:8090/configureSecurity/](http://localhost:8090/configureSecurity/).
- Restart Jenkins itself (without restarting the container) at [http://localhost:8090/restart](http://localhost:8090/restart).

## Change the Jenkins version

The bundled Jenkins version isn't an `.env` variable, it's baked into the image via build args in `jenkins/Dockerfile`: `JENKINS_VERSION` (currently `2.469`) and `JENKINS_SHA`, the matching `.war` checksum used to verify the download. To bump it:

1. Look up the new version's `.war` SHA-256 checksum from the [Jenkins download site](https://www.jenkins.io/download/) or its release changelog.
2. Update `ARG JENKINS_VERSION` and `ARG JENKINS_SHA` in `jenkins/Dockerfile`.
3. Rebuild:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild jenkins
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build jenkins
```

</TabItem>
</Tabs>

4. Restart the container: `./laradock restart jenkins`. Your jobs, plugins, and config under `JENKINS_HOME` carry over as-is, Jenkins runs its own plugin-compatibility checks on the new version at startup.

## Backup and restore

`JENKINS_HOME` (`./jenkins/jenkins_home` by default) is a plain host folder, not a named Docker volume, so backing it up is just archiving that folder. Stop the container first so nothing is mid-write:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop jenkins
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop jenkins
```

</TabItem>
</Tabs>

```bash
tar -czf jenkins-backup.tar.gz -C jenkins jenkins_home
./laradock start jenkins
```

To restore, stop Jenkins, extract the archive back over `jenkins/jenkins_home` (or point `JENKINS_HOME` at wherever you extracted it), then start again:

```bash
./laradock stop jenkins
rm -rf jenkins/jenkins_home
tar -xzf jenkins-backup.tar.gz -C jenkins
./laradock start jenkins
```

This is also how you move a Jenkins setup (jobs, plugins, credentials, build history) between machines.

## Start completely fresh (wipe all data)

To throw away every job, plugin, and credential and start Jenkins from a clean, empty state (this **permanently deletes** everything under `JENKINS_HOME`, back up first if you need anything):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop jenkins
./laradock remove jenkins
rm -rf "${JENKINS_HOME:-./jenkins/jenkins_home}"
./laradock start jenkins
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop jenkins
docker compose rm -sf jenkins
rm -rf "${JENKINS_HOME:-./jenkins/jenkins_home}"
docker compose up -d jenkins
```

</TabItem>
</Tabs>

Starting again re-runs the full first-boot setup wizard, including a brand-new `initialAdminPassword`.

## Common issues

- **Can't find the initial admin password.** It only exists before the setup wizard finishes; run the `./laradock exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword` command above right after first start.
- **Port `8090` already in use.** Another local service is bound to it. Change `JENKINS_HOST_HTTP_PORT` in `.env` and restart: `./laradock restart jenkins`.
- **Jobs that build Docker images fail.** Confirm the job actually has access to `/var/run/docker.sock` (mounted by default) and that the container is still running `privileged: true`.
- **Losing jobs/plugins between rebuilds.** Everything Jenkins-specific lives under `JENKINS_HOME` on your host; don't delete that folder unless you intend to [reset Jenkins entirely](#start-completely-fresh-wipe-all-data).
- **Build agents can't connect (JNLP).** Confirm `JENKINS_HOST_SLAVE_AGENT_PORT` is reachable from the agent and matches the port Jenkins itself is configured to use under **Manage Jenkins → Configure Global Security**.

---

Need a full CI/CD pipeline with its own Git server instead? See **[GitLab](/docs/services/gitlab)** or **[OneDev](/docs/services/onedev)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
