ARG SOLR_VERSION=5.5
FROM solr:${SOLR_VERSION}

ARG SOLR_DATAIMPORTHANDLER_MYSQL=false
ENV SOLR_DATAIMPORTHANDLER_MYSQL ${SOLR_DATAIMPORTHANDLER_MYSQL}

# download mysql connector for dataimporthandler
RUN if [ ${SOLR_DATAIMPORTHANDLER_MYSQL} = true ]; then \
    curl -L -o /tmp/mysql_connector.tar.gz "https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-java-5.1.45.tar.gz" \
       && mkdir /opt/solr/contrib/dataimporthandler/lib \
       && tar -zxvf /tmp/mysql_connector.tar.gz -C /opt/solr/contrib/dataimporthandler/lib "mysql-connector-java-5.1.45/mysql-connector-java-5.1.45-bin.jar" --strip-components 1 \
       && rm /tmp/mysql_connector.tar.gz \
;fi

