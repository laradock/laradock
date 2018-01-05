#!/bin/bash


ETC_HOSTS_FILE="/etc/hosts"

domains=("internal" "curriculum" "api" "campus-frontend")

cp base-env .env

read -p "Do you want to load secrets from lastpass? (y/n)" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    sh scripts/load-lpass.sh
fi

for domain in ${domains[@]}
do
    if grep -Fxq "127.0.0.1 ${domain}.app" $ETC_HOSTS_FILE
    then
        echo "${domain}.app hosts file OK"
    else
        echo "127.0.0.1 ${domain}.app" | sudo tee -a $ETC_HOSTS_FILE
        echo "Added ${domain}.app to hosts"
    fi
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Adding cert for $domain to keychain"
        sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain nginx/certs/$domain.crt
    fi
done

sh start.sh
