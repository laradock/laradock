#!/usr/bin/env bash

docker-compose up -d --force-recreate nginx postgres workspace docker-in-docker mongo neo4j
