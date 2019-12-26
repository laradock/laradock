FROM phpmyadmin/phpmyadmin

LABEL maintainer="Bo-Yi Wu <appleboy.tw@gmail.com>"

# Add volume for sessions to allow session persistence
VOLUME /sessions

RUN echo '' >> /usr/local/etc/php/conf.d/php-phpmyadmin.ini \
 && echo '[PHP]' >> /usr/local/etc/php/conf.d/php-phpmyadmin.ini \
 && echo 'post_max_size = 2G' >> /usr/local/etc/php/conf.d/php-phpmyadmin.ini \
 && echo 'upload_max_filesize = 2G' >> /usr/local/etc/php/conf.d/php-phpmyadmin.ini

# We expose phpMyAdmin on port 80
EXPOSE 80
