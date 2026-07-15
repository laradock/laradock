# MCP

Source: https://laradock.io/docs/services/mcp

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## What is MCP?

[MCP](https://modelcontextprotocol.io) (Model Context Protocol) is the standard way AI coding agents connect to external tools. Laradock's `mcp` service runs [DBHub](https://github.com/bytebase/dbhub), a database MCP server, so agents like Claude Code and Cursor can inspect your schema and query your data directly instead of guessing at your table structure.

Your agent already reads your code from disk. What it can't see is your database. This closes that gap: ask *"why is this query slow?"* or *"what columns does the orders table have?"* and the agent looks at the real schema rather than inferring it from your migrations.

Queries are **read-only by default**: agents can `SELECT`, never `INSERT`, `UPDATE`, `DELETE`, or `DROP`.

## Start MCP

The `mcp` service exposes a database, so start one alongside it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mcp mysql
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mcp mysql
```

</TabItem>
</Tabs>

`mcp` points at MySQL out of the box. To expose a different database, change `MCP_DSN` (see [Point at a different database](#point-at-a-different-database)).

## Stop MCP

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock stop mcp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose stop mcp
```

</TabItem>
</Tabs>

To remove the container:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock remove mcp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose rm -sf mcp
```

</TabItem>
</Tabs>

`mcp` stores nothing of its own: it reads whichever database `MCP_DSN` points at. Removing the container touches no data.

## Configuration

All settings live in `mcp/defaults.env` and can be overridden by adding the same line to your own `.env`:

| Variable | Default | What it does |
|---|---|---|
| `MCP_VERSION` | `latest` | Image tag from [`bytebase/dbhub`](https://hub.docker.com/r/bytebase/dbhub). |
| `MCP_HOST_PORT` | `8321` | Host-side port the MCP server is published on (container port `8080`). |
| `MCP_DSN` | `mysql://default:secret@mysql:3306/default` | Which database to expose, as a connection string. |

`mcp/dbhub.toml` is bind-mounted into the container and controls which tools agents get. Edits take effect on the next restart, no rebuild needed.

## Connect your agent

The server speaks MCP over HTTP at `http://localhost:8321/mcp`.

### Claude Code

```bash
claude mcp add --transport http laradock-db http://localhost:8321/mcp
```

Or commit it to your project by creating `.mcp.json` in your project root, so the whole team picks it up:

```json
{
  "mcpServers": {
    "laradock-db": {
      "type": "http",
      "url": "http://localhost:8321/mcp"
    }
  }
}
```

### Cursor

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "laradock-db": {
      "url": "http://localhost:8321/mcp"
    }
  }
}
```

### Anything else

Any MCP client supporting HTTP transport works. Point it at `http://localhost:8321/mcp`.

Once connected, your agent gets two tools:

| Tool | What it does |
|---|---|
| `search_objects` | Explore tables, columns, and indexes. |
| `execute_sql` | Run a read-only query (max 1000 rows). |

## Point at a different database

`MCP_DSN` accepts MySQL, MariaDB, PostgreSQL, SQL Server, and SQLite. The host is the Laradock service name, so start that service too. Set it in your `.env`:

```env
MCP_DSN=postgres://default:secret@postgres:5432/default
```

Then start both:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mcp postgres
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mcp postgres
```

</TabItem>
</Tabs>

Other formats follow the same shape:

```env
MCP_DSN=mariadb://default:secret@mariadb:3306/default
MCP_DSN=sqlserver://sa:yourStrong(!)Password@mssql:1433/master
```

## Let agents write to the database

Off by default, and worth keeping that way: an agent that can `DROP TABLE` eventually will. If you do want it, edit `mcp/dbhub.toml` and remove the `readonly` line:

```toml
[[tools]]
name = "execute_sql"
source = "laradock"
max_rows = 1000
```

Then restart:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock restart mcp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose restart mcp
```

</TabItem>
</Tabs>

Only do this against a local development database you can afford to lose.

## Test the server

Confirm it's up and can reach your database, without wiring up an agent first:

```bash
curl -s http://localhost:8321/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'
```

A JSON response naming `dbhub` means the server is running and connected.

## Change the MCP version

Set the version in your `.env`:

```env
MCP_VERSION=0.23.0
```

`mcp` runs a pulled image, not a local build, so pull the new tag first:

```bash
docker compose pull mcp
```

Then recreate the container on it:

<Tabs groupId="interface">
<TabItem value="cli" label="Laradock CLI">

```bash
./laradock start mcp
```

</TabItem>
<TabItem value="docker" label="Docker Compose">

```bash
docker compose up -d mcp
```

</TabItem>
</Tabs>

## Common issues

- **Container keeps restarting.** It exits when the database isn't reachable and retries until it is. If it never settles, the database named in `MCP_DSN` probably isn't running: start it (`./laradock start mysql`). Check with `./laradock logs mcp`.
- **`ECONNREFUSED` in the logs.** The host in `MCP_DSN` must be the Laradock service name (`mysql`, `postgres`), not `localhost`. From inside a container, `localhost` is that container itself.
- **Agent doesn't see the tools.** Confirm the container is running (`./laradock logs mcp`), then restart your agent: most MCP clients only connect at startup.
- **"Read-only mode is enabled" error.** Working as intended, the agent tried to write. See [Let agents write to the database](#let-agents-write-to-the-database) if that's genuinely what you want.
- **Port 8321 already taken.** Change `MCP_HOST_PORT` in your `.env` and update your agent's config URL to match.

---

Want a local LLM to go with it? See **[Ollama](https://laradock.io/docs/services/ollama)**. Building AI features on your data? Pair it with a vector database like **[pgvector](https://laradock.io/docs/services/pgvector)** or **[Qdrant](https://laradock.io/docs/services/qdrant)**. New to Laradock? Start with **[Getting Started](https://laradock.io/docs/getting-started)**.
