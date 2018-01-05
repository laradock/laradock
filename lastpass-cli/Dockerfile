FROM alpine:3.7

ARG user=lpass
ARG group=lpass
ARG uid=1000
ARG gid=1000

RUN addgroup -g ${gid} ${group} && \
    adduser -h "/home/${user}" -u ${uid} -G ${group} -s /bin/bash -D ${user}

RUN apk add --no-cache --update lastpass-cli

USER ${user}
