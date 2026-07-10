---
slug: /laradock-vs-devcontainers
title: Laradock vs Dev Containers
description: VS Code Dev Containers and GitHub Codespaces vs Laradock. Editor-centric containers vs editor-agnostic infrastructure, how they differ, and how to combine them.
keywords:
  - laradock vs devcontainers
  - devcontainer php
  - devcontainer laravel
  - github codespaces php
  - devcontainer docker compose
  - vscode php development container
---

## What are Dev Containers?

[Dev Containers](https://containers.dev/) is an open specification, championed by Microsoft and VS Code, for describing a development environment as a container that your code editor runs inside of. You add a `devcontainer.json` file to a project, and any supporting editor can build that container and reopen your workspace inside it, extensions, terminal, and all. [GitHub Codespaces](https://github.com/features/codespaces) is the cloud-hosted version of the same idea, running that container in the browser instead of on your machine.

This page compares that editor-centered approach to Laradock, which is not tied to any editor at all: it defines your project's infrastructure (web server, database, cache, and more), reachable the same way whether you code in VS Code, PhpStorm, Vim, or over SSH.

*Dev Containers put your editor inside a container; Laradock puts your infrastructure inside containers. They answer different questions, compete on some ground, and combine surprisingly well.*

**TL;DR:** pick [Dev Containers](https://containers.dev/) / Codespaces if your team lives in VS Code and wants one-click onboarding. Pick Laradock if the environment should belong to the project rather than the editor. Best of both: point your `devcontainer.json` at Laradock (shown below).

## How Dev Containers work

A `.devcontainer/devcontainer.json` in your repo describes the container your editor should work inside:

```json
{
  "name": "my-app",
  "image": "mcr.microsoft.com/devcontainers/php:1-8.3",
  "features": { "ghcr.io/devcontainers/features/node:1": {} },
  "forwardPorts": [8000],
  "postCreateCommand": "composer install"
}
```

VS Code's "Reopen in Container" builds it and moves your terminal, extensions and debugger inside; GitHub Codespaces runs the same thing in the cloud, so a new teammate codes in minutes without installing anything.

The limits: it is editor-centric (the experience belongs to VS Code and, partially, JetBrains), and a single image only gets you PHP. The moment you need MySQL, Redis or a queue, `devcontainer.json` must reference a `docker-compose.yml` that you write and maintain yourself; Dev Containers standardize where your editor runs, not what your stack contains.

## The same thing with Laradock

```bash
cd my-app
git clone https://github.com/laradock/laradock.git
cd laradock && cp .env.example .env
docker compose up -d nginx mysql redis workspace
```

The stack is defined by the project and runs identically no matter what you code in: VS Code, PhpStorm, Vim, or SSH from another machine. The compose wiring Dev Containers would ask you to write is exactly the part Laradock ships pre-built, 100+ services included.

## Side by side

| | **Dev Containers / Codespaces** | **Laradock** |
|---|---|---|
| Centered on | The editor (VS Code first) | The project's infrastructure |
| Defines | Where your editor + tools run | Your full multi-service stack |
| Multi-service stacks | Via a compose file you write | Pre-wired, 100+ services |
| Editor support | VS Code excellent, JetBrains partial, others degraded | Any editor, terminal, or SSH |
| Cloud option | Codespaces (paid beyond free tier) | Any Docker host |
| Onboarding | One click (best in class) | `./laradock setup`, Enter through the wizard |
| Config | `devcontainer.json` (+ compose underneath) | `.env` + per-service folders |
| Lock-in | Spec is open; experience is VS Code-shaped | None (plain compose) |

## Choose Dev Containers if...

- Your team is all-in on VS Code and wants zero-install, one-click onboarding.
- You want Codespaces so contributors never run anything locally.
- Your stack is simple enough that one image (plus maybe a database) covers it.

## Choose Laradock if...

- Your team uses mixed editors, or you refuse to couple infrastructure to an editor.
- You need a real multi-service stack without hand-writing the compose file underneath.
- You want the same environment reachable from a terminal, CI, or another machine, no editor involved.

## Best of both: point your devcontainer at Laradock

You do not have to choose. Let Laradock define the stack and Dev Containers define the editor experience: with Laradock cloned inside your project, put this in `.devcontainer/devcontainer.json`:

```json
{
  "name": "my-app",
  "dockerComposeFile": "../laradock/docker-compose.yml",
  "service": "workspace",
  "workspaceFolder": "/var/www",
  "runServices": ["nginx", "mysql", "redis", "workspace"]
}
```

"Reopen in Container" now drops VS Code into Laradock's `workspace` container (PHP, Composer, Node, git preinstalled) with your whole service stack running around it: one-click onboarding on top, transparent pre-wired infrastructure underneath.

## Frequently Asked Questions

### Is the Dev Containers spec free?

Yes, the [Dev Containers specification](https://containers.dev/) is open and free to use in any editor that implements it. GitHub Codespaces, which runs Dev Containers in the cloud, is free for a limited monthly quota and paid beyond that.

### Do Dev Containers work outside VS Code?

Partially. VS Code has the most complete implementation; JetBrains IDEs support Dev Containers with some feature gaps; other editors have little to no native support, since the ecosystem and tooling were built around VS Code first.

### Can Dev Containers run a multi-service stack like MySQL and Redis?

Yes, but only if you write a `docker-compose.yml` for it yourself and reference it from `devcontainer.json` via `dockerComposeFile`; the spec does not ship pre-wired services the way Laradock does.

### Can I use Laradock inside a Dev Container?

Yes. Point your `devcontainer.json`'s `dockerComposeFile` at Laradock's `docker-compose.yml` and set `service` to `workspace`; see the [combo setup](#best-of-both-point-your-devcontainer-at-laradock) above for the exact config.

### What is GitHub Codespaces?

Codespaces is GitHub's cloud-hosted implementation of the Dev Containers spec: it builds your `devcontainer.json` on GitHub's infrastructure so contributors can start coding in a browser with zero local setup.

See the full landscape, including DDEV, Sail, Herd and XAMPP: **[Laradock vs Others](/docs/laradock-alternatives)**. Ready to try it? **[Getting Started](/docs/getting-started)** takes about five minutes.
