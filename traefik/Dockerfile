FROM traefik:1.7.5-alpine

LABEL maintainer="Luis Coutinho <luis@luiscoutinho.pt>"

COPY traefik.toml acme.json /

RUN chmod 600 /acme.json
