#!/bin/sh

if [ -f keys/ca-priv-key.pem ] || [ -f keys/ca.pem ] || [ -f serial ] || [ -f certindex ]; then
    echo "CA already generated, aborting"
    exit 1
fi

mkdir -p keys
echo "000a" > serial
touch certindex
openssl genrsa -des3 -out keys/ca-priv-key.pem 2048
openssl req -x509 -new -nodes -key keys/ca-priv-key.pem -sha256 -days 3650 -out keys/ca.pem
