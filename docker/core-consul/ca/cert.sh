#!/bin/sh

NAME=$1
if [ -z "$NAME" ]; then
   echo "Missing argument: certificate name"
   exit 1
fi

if [ ! -f keys/ca-priv-key.pem ] || [ ! -f keys/ca.pem ]; then
    echo "CA certificate not generated, aborting"
    exit 2
fi

if [ -f "keys/$NAME-priv-key.pem" ] || [ -f "keys/$NAME-priv-key.pem" ]; then
    echo "Client certificate already generated, aborting"
    exit 3
fi

openssl genrsa -out keys/${NAME}-priv-key.pem 2048
openssl req -new -key keys/${NAME}-priv-key.pem -out keys/${NAME}.csr

openssl ca -batch -config ca.cnf -notext -in keys/${NAME}.csr -out keys/${NAME}.pem
