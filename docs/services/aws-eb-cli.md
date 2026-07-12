# AWS EB CLI

Source: https://laradock.io/docs/services/aws-eb-cli

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is the AWS EB CLI?

The [AWS Elastic Beanstalk CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html) (`eb`) is Amazon's command-line tool for initializing, configuring, and deploying applications to Elastic Beanstalk. Laradock packages it in its own container (built on `python:slim` with `awsebcli` installed via pip), so you get a working `eb` command without installing Python or the CLI on your host.

Unlike most Laradock services, this isn't a long-running server, it's a CLI tool container you shell into on demand, similar to the workspace tools.

## Start the container

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start aws
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d aws
```

</TabItem>
</Tabs>

The container depends on `workspace` and shares its `APP_CODE_PATH_HOST` mount, so your project files are available inside it at the same path as in `workspace`.

## Enter it and use `eb`

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock enter aws
eb init
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose exec aws bash
eb init
```

</TabItem>
</Tabs>

Follow the [EB CLI configuration docs](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html) from there (`eb create`, `eb deploy`, `eb status`, etc.) exactly as you would with a host-installed EB CLI.

## AWS credentials

`eb init` (or a plain `aws configure`) prompts for your AWS access key, secret key, and region, then writes them to `/root/.aws/` **inside the container**. Since `aws-eb-cli/compose.yml` doesn't mount a home directory by default, those credentials live only in that container's filesystem: running `./laradock remove aws` deletes them, and you'll be prompted again next time you `eb init` after a fresh `./laradock start aws`.

To persist credentials across container removals/rebuilds, mount your host's `~/.aws` folder in `aws-eb-cli/compose.yml`:

```yaml
volumes:
  - ${APP_CODE_PATH_HOST}:${APP_CODE_PATH_CONTAINER}${APP_CODE_CONTAINER_FLAG}
  - ~/.aws:/root/.aws
```

Then [rebuild](#ssh-keys) or just recreate the container for the new volume to take effect. This also means any AWS CLI profile you already have configured on your host becomes available inside the container automatically.

## Stop the container

Stopping just pauses the container; the `.elasticbeanstalk/config.yml` written by `eb init` lives in your mounted project folder, not the container, so it's safe either way:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop aws
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop aws
```

</TabItem>
</Tabs>

Since this container doesn't do anything on its own between commands, it's fine to leave it stopped and only start it when you need to run `eb` commands. To delete the container entirely (see [AWS credentials](#aws-credentials) above for what that means for anything you configured without the `~/.aws` mount):

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove aws
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf aws
```

</TabItem>
</Tabs>

## SSH keys

Elastic Beanstalk environments are typically accessed over SSH, so before building the image, add the keys you want available inside the container to the `aws-eb-cli/ssh_keys` folder. The Dockerfile copies everything in that folder into `/root/.ssh/` at build time and sets correct permissions (`600` for private keys, `644` for `.pub` files).

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock rebuild aws
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose build aws
```

</TabItem>
</Tabs>

## Configuration

There's no `aws-eb-cli/defaults.env`, this service has no Laradock-level environment variables to configure. All configuration happens through `eb init`/`eb config` (which write to `.elasticbeanstalk/config.yml` in your project) or through AWS credentials you provide inside the container (see [AWS credentials](#aws-credentials) above).

## Common issues

- **SSH key changes don't show up in the container.** SSH keys are copied in at build time, not mounted, rebuild after adding or changing keys: `./laradock rebuild aws`.
- **`eb` can't find your project.** Run `eb init` from inside `APP_CODE_PATH_CONTAINER` (your project root as mounted in the container), the same path `workspace` uses.
- **AWS credentials aren't picked up.** The container doesn't inject AWS credentials automatically; configure them the same way you would for the EB CLI anywhere else, via `eb init`'s prompts or standard AWS credential files/env vars.
- **Credentials disappear after `./laradock remove aws`.** Expected unless you've mounted `~/.aws` as described in [AWS credentials](#aws-credentials), the container has no persistent storage of its own for them.

---

Need a general dev shell instead? See the **[Workspace guide](https://laradock.io/docs/services/workspace)**. New to Laradock? Start at **[Getting Started](https://laradock.io/docs/getting-started)**.
