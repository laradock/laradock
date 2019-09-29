#!/bin/bash

if [[ $# -ge 1 ]]; then
    echo "aspnetcore_app_dir: $1"
    cd "/var/www/$1"
else
    echo "aspnetcore_app_path empty"
    exit
fi

while [ ! "$(ls -A /var/www/$1)" ]
do
    sleep 1;
    echo "waiting for volumes to mount"
done


dotnet restore

#dotnet publish ./*.csproj -o ./publish/

#dotnet "./publish/$1.dll"
dotnet watch run --urls http://0.0.0.0:5000

#run_cmd="dotnet restore && dotnet run"

# Try to create the database if the speciified database in the connection string doesnt exist
#   and then try to run the migrations to create the schema.
# Do this in a loop so that it handles any delay between when the app container comes up and SQL Server comes up.

