#!/usr/bin/env bash

source /opt/docker/bin/config.sh

includeScriptDir "/opt/docker/bin/service.d/ssh.d/"

exec /usr/sbin/sshd -D
