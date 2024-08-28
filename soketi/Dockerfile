ARG NODE_VERSION=16-debian
ARG BASE_IMAGE_TAG_PREFIX=latest
FROM quay.io/soketi/soketi:${BASE_IMAGE_TAG_PREFIX}-${NODE_VERSION}

LABEL maintainer="Er-Niebla <er.niebla@gmail.com>"

COPY config.json /app/bin/config.json

CMD ["--config=/app/bin/config.json"]

EXPOSE 6001 9601
