# Supported Services

Source: https://laradock.io/docs/supported-services

import HubCardList from '@site/src/components/HubCardList';

Laradock ships dozens of services as pre-configured containers: databases, caches and queues, search engines, web servers, mail catchers, AI/ML stacks, monitoring, and developer tools. You don't install any of them on your machine, they run in Docker, isolated and disposable.

## Enable only what you need

Nothing runs until you ask for it. You name the services you want when you start Laradock, and only those containers come up:

```bash
./laradock start nginx mysql redis
```

Need Postgres and Elasticsearch on a different project? Start those instead. Your host machine stays clean, and two projects can use completely different stacks without conflicting.

## Configured, not just installed

Each service comes wired into the Laradock network with sane defaults, the workspace container can already reach `mysql`, `redis`, and the rest by hostname, and credentials live in one `.env` file. The per-service guides below cover the specifics: default ports, how to connect from your app, and the settings worth changing.

## Browse by category

<HubCardList />
