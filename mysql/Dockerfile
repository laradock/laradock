ARG MYSQL_VERSION=latest
FROM mysql:${MYSQL_VERSION}

#####################################
# Set Timezone
#####################################

ARG TZ=UTC
ENV TZ ${TZ}
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && chown -R mysql:root /var/lib/mysql/

COPY my.cnf /etc/mysql/conf.d/my.cnf

RUN chmod 0444 /etc/mysql/conf.d/my.cnf

RUN if [ ${MYSQL_MAJOR} = '8.0' ]; then \
    echo 'default-authentication-plugin=mysql_native_password' >> /etc/mysql/conf.d/my.cnf; \
  fi
