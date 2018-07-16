#!/bin/bash
#
# Copy createdb.sh.example to createdb.sh
# then uncomment then set database name and username to create you need databases
#
# example: .env POSTGRES_USER=appuser and need db name is myshop_db
# 
#    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#        CREATE USER myuser WITH PASSWORD 'mypassword';
#        CREATE DATABASE myshop_db;
#        GRANT ALL PRIVILEGES ON DATABASE myshop_db TO myuser;
#    EOSQL
#
# this sh script will auto run when the postgres container starts and the $DATA_PATH_HOST/postgres not found.
#
# 
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#     CREATE USER db1 WITH PASSWORD 'db1';
#     CREATE DATABASE db1;
#     GRANT ALL PRIVILEGES ON DATABASE db1 TO db1;
# EOSQL
# 
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#     CREATE USER db2 WITH PASSWORD 'db2';
#     CREATE DATABASE db2;
#     GRANT ALL PRIVILEGES ON DATABASE db2 TO db2;
# EOSQL
# 
# psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
#     CREATE USER db3 WITH PASSWORD 'db3';
#     CREATE DATABASE db3;
#     GRANT ALL PRIVILEGES ON DATABASE db3 TO db3;
# EOSQL
# 
### default database and user for jupyterhub ##############################################
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER laradock_jupyterhub WITH PASSWORD 'laradock_jupyterhub';
    CREATE DATABASE laradock_jupyterhub;
    GRANT ALL PRIVILEGES ON DATABASE laradock_jupyterhub TO laradock_jupyterhub;
    ALTER ROLE laradock_jupyterhub CREATEROLE SUPERUSER;
EOSQL
