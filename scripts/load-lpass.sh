#!/bin/sh

cd "${BASH_SOURCE%/*}" || exit
cd ../

echo "Please enter your @kiron.ngo username usualle first_name.last_name followed by [ENTER]:"
read username

docker-compose up -d lpass
docker-compose exec lpass lpass login ${username}@kiron.ngo
docker-compose exec lpass lpass show --notes 1831093418396261581 > .lpass-env
echo "DB_TRANSFER_ENVNAME=${username}" >> .lpass-env
docker-compose stop lpass
