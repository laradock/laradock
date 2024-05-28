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

RUN version_gt() { \
  test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"; \
  }; \
  MYSQL_VERSION=$(mysqld --version | grep -o -E "[0-9]+\.[0-9]+\.[0-9]+"); \
  if version_gt "$MYSQL_VERSION" "8.3"; then \
  echo 'mysql_native_password=on' >> /etc/mysql/conf.d/my.cnf ; \
  else \
  echo 'default-authentication-plugin=mysql_native_password' >> /etc/mysql/conf.d/my.cnf ; \
  fi

EXPOSE 3306
