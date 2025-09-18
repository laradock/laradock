#!/bin/bash

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
  echo "[ERROR] Domain not specified for cert copy"
  exit 1
fi

echo "[INFO] Copying certificates for $DOMAIN"

mkdir -p /var/certs

cp /etc/letsencrypt/live/$DOMAIN/cert.pem /var/certs/$DOMAIN-cert.pem
cp /etc/letsencrypt/live/$DOMAIN/chain.pem /var/certs/chain.pem
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /var/certs/fullchain.pem
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /var/certs/$DOMAIN-privkey.pem
