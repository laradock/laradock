---
slug: /services/aws-eb-cli
title: AWS EB CLI
description: Run the AWS Elastic Beanstalk CLI in Laradock to initialize and deploy your app to Elastic Beanstalk without installing the EB CLI on your host.
keywords:
  - laradock aws eb cli
  - elastic beanstalk docker
  - eb cli docker
  - aws elastic beanstalk laravel
  - deploy laravel elastic beanstalk
---

## What is the AWS EB CLI?

The [AWS Elastic Beanstalk CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html) (`eb`) is Amazon's command-line tool for initializing, configuring, and deploying applications to Elastic Beanstalk. Laradock packages it in its own container (built on `python:slim` with `awsebcli` installed via pip), so you get a working `eb` command without installing Python or the CLI on your host.

Unlike most Laradock services, this isn't a long-running server, it's a CLI tool container you shell into on demand, similar to the workspace tools.

## Start the container

```bash
docker compose up -d aws
```

The container depends on `workspace` and shares its `APP_CODE_PATH_HOST` mount, so your project files are available inside it at the same path as in `workspace`.

## Enter it and use `eb`

```bash
docker compose exec aws bash
eb init
```

Follow the [EB CLI configuration docs](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html) from there (`eb create`, `eb deploy`, `eb status`, etc.) exactly as you would with a host-installed EB CLI.

## Stop the container

```bash
docker compose stop aws
```

Since this container doesn't do anything on its own between commands, it's fine to leave it stopped and only start it when you need to run `eb` commands.

## SSH keys

Elastic Beanstalk environments are typically accessed over SSH, so before building the image, add the keys you want available inside the container to the `aws-eb-cli/ssh_keys` folder. The Dockerfile copies everything in that folder into `/root/.ssh/` at build time and sets correct permissions (`600` for private keys, `644` for `.pub` files).

```bash
docker compose build aws
```

## Configuration

There's no `aws-eb-cli/defaults.env`, this service has no Laradock-level environment variables to configure. All configuration happens through `eb init`/`eb config` (which write to `.elasticbeanstalk/config.yml` in your project) or through AWS credentials you provide inside the container.

## Common issues

- **SSH key changes don't show up in the container.** SSH keys are copied in at build time, not mounted, rebuild after adding or changing keys: `docker compose build aws`.
- **`eb` can't find your project.** Run `eb init` from inside `APP_CODE_PATH_CONTAINER` (your project root as mounted in the container), the same path `workspace` uses.
- **AWS credentials aren't picked up.** The container doesn't inject AWS credentials automatically; configure them the same way you would for the EB CLI anywhere else, via `eb init`'s prompts or standard AWS credential files/env vars.

---

Need a general dev shell instead? See the **[Workspace guide](/docs/services/workspace)**. New to Laradock? Start at **[Getting Started](/docs/getting-started)**.
