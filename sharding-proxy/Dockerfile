FROM apache/shardingsphere-proxy:latest
ARG SHARDING_PROXY_PORT
LABEL maintainer="WuweiMing <wwm041544363@gmail.com>"

ENV PORT=${SHARDING_PROXY_PORT}

CMD ["start.sh"]


EXPOSE ${SHARDING_PROXY_PORT}
