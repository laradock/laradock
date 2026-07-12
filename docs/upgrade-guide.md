# Upgrade Guide

Source: https://laradock.io/docs/upgrade-guide

# Upgrade Guide

**v20+ is today's Laradock**, modular, with a plain-English CLI, built-in local-AI services, and one-command production deploys. This guide gets you there safely from any older version, whatever number you're on.

Pulled a newer Laradock and the diff looks enormous, maybe with merge conflicts? **Don't panic.** Nothing you actually run has changed. At one point Laradock reorganized its files, one giant `docker-compose.yml` and `.env.example` became many small per-service files, so an upgrade that crosses that point shows a huge diff. But it's a **reorganization, not a rewrite.**

<div style={{display: 'flex', gap: '0.9rem', flexWrap: 'wrap', alignItems: 'center', margin: '1.75rem 0'}}>
  <a className="button button--primary button--lg" href="#let-an-ai-agent-do-it-for-you">🤖 Let an AI agent upgrade for me</a>
  <span style={{opacity: 0.85}}>Grabs the copy-paste prompt below. It backs up first, never touches your <code>.env</code>, and asks before changing anything, so you don't have to read the rest.</span>
</div>

:::tip The whole upgrade, in one line
`git pull` and keep your existing `.env`. Everything runs exactly as before, the Docker Compose config Laradock generates is byte-for-byte identical to what you had.
:::

## Nothing breaks. Here's why.

- The move to modular files was verified by rendering the full Docker Compose config **before and after — byte-identical.**
- Your `.env` is git-ignored, so **`git pull` never touches it.** Your settings are safe.
- Same commands, same services, same ports, same behavior.
- Every release ships "**no breaking changes**" on purpose. It's a hard rule, not a coincidence.

So this isn't a typical upgrade guide with a checklist of things that will break. There's nothing to fix. This page just tells you what moved, so the diff makes sense.

## What actually changed (why the diff is huge)

Two structural changes landed when Laradock went modular (the **v18 series**). Both are pure reorganization, no behavior change.

### 1. One giant file → one small file per service

The old single, huge `docker-compose.yml` was split up. Now there's a small root `docker-compose.yml` (just shared networks/volumes and an `include:` list) plus one small `compose.yml` inside each service's folder: `nginx/compose.yml`, `mysql/compose.yml`, `redis/compose.yml`, and so on.

Docker stitches them all back together with `include:` when you run it, so the result is identical. The only new requirement: **Docker Compose v2.20+** (the version that added `include:`).

### 2. One giant `.env.example` → per-service defaults

The old huge `.env.example` was slimmed down to just the shared settings (paths, PHP version, project name). Each service now ships its own ready-to-run defaults in `<service>/defaults.env` (e.g. `mysql/defaults.env`), which you never copy or edit.

**Your `.env` still wins over every `defaults.env`.** To change any setting, add that one line to your `.env`, exactly like before. Example: `MYSQL_PORT=3307`.

## What you need to do

For most people: **just `git pull`.** Then, only if it applies to you:

| Situation | What to do |
| --- | --- |
| Check your Docker Compose version | `docker compose version` → needs **v2.20+**. Update Docker Desktop / the compose plugin if it's older. |
| You had local edits in your **`.env`** | **Nothing.** It keeps working, untouched. |
| You had local edits inside the old **monolithic `docker-compose.yml`** | Re-apply them in the matching `<service>/compose.yml` (an nginx tweak → `nginx/compose.yml`). |
| You had custom service **Dockerfiles** | Untouched. Still there, still build the same. |
| Rebuild after pulling | Only what you run: `docker compose build <service>` — or use the `./laradock` CLI for a guided path. |

## "git pull gave me conflicts"

Because `docker-compose.yml` and `.env.example` were rewritten upstream, if you committed changes to **those two files** on your own fork, git will flag conflicts there. They're the only likely conflict points, and they're files you almost never edit directly.

To resolve:

1. Take the upstream version of both — they're just the new modular skeleton:
   ```bash
   git checkout --theirs docker-compose.yml .env.example
   git add docker-compose.yml .env.example
   ```
   (Or open them in your editor and accept the incoming version.)
2. Re-apply any **real** local changes in the per-service files instead, as in the table above.
3. Your `.env` is git-ignored, so it's never part of the conflict — your actual settings are never at risk.

:::note
A clean clone you only ever `git pull` (never committed local edits) won't conflict at all. You'll just see a big, harmless diff.
:::

## Which versions does this apply to?

**v20+ is the current, modern line** you'll land on: modular layout, the `./laradock` CLI, local-AI services, and one-command production deploys. The one pivot that matters is the move from the old **monolithic** layout to today's **modular** one, which landed in the **v18** series:

| You're on | What happens when you upgrade |
| --- | --- |
| **v17 or earlier** (old monolithic layout) | Your next pull crosses the pivot, so you see the big one-time diff this page explains. Nothing breaks. |
| **v18 – v19** (already modular) | Moving up to v20+ just adds the CLI and production tooling. Uneventful. |
| **v20+** (current line) | You're already here. Future upgrades stay uneventful: same files, just newer. |

No breaking changes at any step, whatever version you start from or land on. For exactly what changed in each release, see the [release notes](https://github.com/laradock/laradock/releases).

## What you gain by upgrading

All optional, all opt-in, none of it required to upgrade. Recent Laradock also added:

- **The `./laradock` CLI** *(v19)* — run Laradock without knowing Docker Compose: setup wizard, `start`, `workspace` shell, `doctor` health check, and more. → [CLI Reference](https://laradock.io/docs/cli)
- **A full local-AI stack** *(v18)* — Ollama, LocalAI, LiteLLM, and vector databases (pgvector, Qdrant, Weaviate, Chroma), plus modern runtimes like FrankenPHP, RoadRunner, and Laravel Reverb. → [Supported Services](https://laradock.io/docs/Intro#supported-services)
- **One-command production deploy** *(v20)* — take the same stack to a real server, a managed cloud, or Kubernetes with a hardened image. → [Deploy to Production](https://laradock.io/docs/production)

## Let an AI agent do it for you

Rather not touch it by hand? Open your AI coding agent (Claude Code, Cursor, or similar) inside your Laradock folder and paste the prompt below. It migrates your whole setup in one go; safely, backing up first, never touching your `.env`, and stopping to ask if anything is unclear.

```text
You are upgrading my existing Laradock setup to the latest version, in one go, safely.

Context: Laradock recently went modular. The single giant docker-compose.yml was split
into a small root docker-compose.yml plus one compose.yml per service, stitched together
with Docker Compose `include:`. The giant .env.example was slimmed down, and each service's
defaults now live in its own <service>/defaults.env. This change is fully backward
compatible: the rendered Docker Compose config is byte-for-byte identical, and my .env file
(which is git-ignored) keeps working unchanged and still overrides every default.

SAFETY — do this first, never skip:
1. Back up before changing anything: copy .env to .env.backup, and copy my current
   docker-compose.yml to docker-compose.yml.old so we can diff against it later.
2. NEVER delete, overwrite, or edit my .env. It holds my real settings, is git-ignored, and
   is never part of any git conflict.
3. Confirm Docker Compose v2.20+ is installed (`docker compose version`) — the new include:
   layout needs it. Stop and tell me if it is older.

MIGRATE:
4. Pull the latest Laradock (git pull). Any conflicts will only be in docker-compose.yml
   and/or .env.example (the two files upstream rewrote). Resolve them by taking the upstream
   version of those two files.
5. Find whatever I had customized in the OLD monolithic docker-compose.yml by inspecting my
   git history and working tree (git diff, git log -p -- docker-compose.yml against
   docker-compose.yml.old). Re-apply each real customization in the matching per-service file
   (an nginx tweak -> nginx/compose.yml, a mysql tweak -> mysql/compose.yml). Leave any custom
   service Dockerfiles exactly as they are.
6. Leave my .env exactly as it is. Any setting I want to change stays as a single line in .env;
   it always wins over each service's defaults.env.

VERIFY — prove nothing broke:
7. Run `docker compose config` and confirm it renders with no errors.
8. Show me a summary of every change and every customization you re-applied, BEFORE rebuilding
   any containers.
9. Then rebuild only the services I actually use (docker compose build <those services>) and
   start them (docker compose up -d); confirm they come up healthy.

If anything is ambiguous, or you are unsure whether an edit was mine, STOP and ask me rather
than guessing.
```

## Still stuck?

See [Getting Help](https://laradock.io/docs/help) or open an issue on [GitHub](https://github.com/laradock/laradock/issues).
