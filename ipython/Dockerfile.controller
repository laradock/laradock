FROM python:3.5-alpine

LABEL maintainer="ahkui <ahkui@outlook.com>"

USER root

RUN apk add --no-cache build-base zeromq-dev

RUN python -m pip --quiet --no-cache-dir install \
        ipyparallel

RUN ipython profile create --parallel --profile=default

COPY ipcontroller-client.json /root/.ipython/profile_default/security/ipcontroller-client.json
COPY ipcontroller-engine.json /root/.ipython/profile_default/security/ipcontroller-engine.json

CMD ["sh","-c","ipcontroller --ip=* --reuse"]
