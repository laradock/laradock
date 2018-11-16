#!/bin/bash

if [ ! -f /etc/nginx/ssl/default.crt ]; then
    openssl genrsa -out "/etc/nginx/ssl/default.key" 2048
    openssl req -new -key "/etc/nginx/ssl/default.key" -out "/etc/nginx/ssl/default.csr" -subj "/CN=default/O=default/C=UK"
    openssl x509 -req -days 365 -in "/etc/nginx/ssl/default.csr" -signkey "/etc/nginx/ssl/default.key" -out "/etc/nginx/ssl/default.crt"
fi

nginx
