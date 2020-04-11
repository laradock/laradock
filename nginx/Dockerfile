FROM staticfloat/nginx-certbot


COPY nginx.conf /etc/nginx/


#RUN set -x ; \
 #   addgroup -g 82 -S www-data ; \
  #  adduser -u 82 -D -S -G www-data www-data && exit 0 ; exit 1

ARG PHP_UPSTREAM_CONTAINER=php-fpm
ARG PHP_UPSTREAM_PORT=9000


# Set upstream conf and remove the default conf
RUN echo "upstream php-upstream { server ${PHP_UPSTREAM_CONTAINER}:${PHP_UPSTREAM_PORT}; }" > /etc/nginx/conf.d/upstream.conf 


EXPOSE 80 81 443
