FROM influxdb:1.2

EXPOSE 8083 8086

COPY create-database.sh /etc/influxdb/create-database.sh
RUN chmod +x /etc/influxdb/create-database.sh

#RUN ["/etc/influxdb/create-database.sh", "data"]