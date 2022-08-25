FROM alpine
LABEL maintainer="Leonard Buskin <leonardbuskin@gmail.com>"

ARG VERSION=${VERSION:-master}

RUN apk add --no-cache --virtual .build-deps \
      curl gcc g++ make autoconf libc-dev libevent-dev linux-headers perl tar \
    && mkdir -p /ssdb/tmp \
    && curl -Lk "https://github.com/ideawu/ssdb/archive/${VERSION}.tar.gz" | \
       tar -xz -C /ssdb/tmp --strip-components=1 \
    && cd /ssdb/tmp \
    && make -j$(getconf _NPROCESSORS_ONLN) \
    && make install PREFIX=/ssdb \
    && rm -rf /ssdb/tmp \
    && apk add --virtual .rundeps libstdc++ \
    && apk add --no-cache bash python2 \
    && apk del .build-deps

EXPOSE 8888
VOLUME /ssdb/var
COPY ssdb.conf /ssdb/ssdb.conf
CMD ["/ssdb/ssdb-server", "/ssdb/ssdb.conf"]
