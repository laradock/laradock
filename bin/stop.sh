#!/bin/bash

APP_ROOT="$( cd "$( dirname $(dirname "${BASH_SOURCE[0]}" ))" >/dev/null && pwd )"/

docker-compose stop
