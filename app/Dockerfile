ARG LARADOCK_PHP_VERSION
FROM laradock/workspace:2.2-${LARADOCK_PHP_VERSION}
WORKDIR /var/www/
COPY . /var/www/
RUN composer global require hirak/prestissimo
RUN composer install
RUN php artisan key:generate
RUN chmod -R 777 /var/www/storage
#RUN ls -la /var/www/vendor
