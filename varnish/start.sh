#!/usr/bin/env bash
set -e

for name in BACKEND_PORT BACKEND_HOST VARNISH_SERVER
do
    eval value=\$$name
    sed -i "s|\${${name}}|${value}|g" /etc/varnish/default.vcl
done

echo "exec varnishd \
    -a :$VARNISH_PORT \
    -T localhost:6082 \
    -F \
    -f $VARNISH_CONFIG \
    -s malloc,$CACHE_SIZE \
    $VARNISHD_PARAMS"

exec bash -c \
    "exec varnishd \
    -a :$VARNISH_PORT \
    -T localhost:6082 \
    -F \
    -f $VARNISH_CONFIG \
    -s malloc,$CACHE_SIZE \
    $VARNISHD_PARAMS"
