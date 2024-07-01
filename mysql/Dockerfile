ARG MYSQL_VERSION
FROM mysql:${MYSQL_VERSION}

LABEL maintainer="Mahmoud Zalt <mahmoud@zalt.me>"

#####################################
# Set Timezone
#####################################

ARG TZ=UTC
ENV TZ ${TZ}
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && chown -R mysql:root /var/lib/mysql/

COPY my.cnf /etc/mysql/conf.d/my.cnf

RUN chmod 0444 /etc/mysql/conf.d/my.cnf

RUN if [ ${MYSQL_VERSION} > '8.4.0-0.000' ]; then \
  echo 'mysql_native_password=on' >> /etc/mysql/conf.d/my.cnf \
else \
  echo 'default-authentication-plugin=mysql_native_password' >> /etc/mysql/conf.d/my.cnf \
;fi

EXPOSE 3306
