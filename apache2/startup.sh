#!/bin/sh
set -eu

# Create a development certificate only when both files are absent.
if [ "${APACHE_HTTP2:-false}" = true ]; then
  mkdir -p /etc/apache2/ssl
  if [ ! -e /etc/apache2/ssl/ssl_site.crt ] && [ ! -e /etc/apache2/ssl/ssl_site.key ]; then
    umask 077
    openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
      -keyout /etc/apache2/ssl/ssl_site.key \
      -out /etc/apache2/ssl/ssl_site.crt \
      -subj '/CN=laradock.test/O=Laradock/C=BR' \
      -addext 'subjectAltName=DNS:laradock.test,DNS:*.laradock.test'
  fi
fi
