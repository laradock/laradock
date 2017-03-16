#!/bin/bash

# Check cli input
if [ -z ${1+x} ]
then 
	DBNAME="data"
else
	DBNAME="$1"
fi

echo "Creating Influx database: $DBNAME..."

curl -i -XPOST http://localhost:8086/query --data-urlencode "q=CREATE DATABASE $DBNAME"