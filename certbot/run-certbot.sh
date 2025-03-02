#!/bin/bash

#-----------------------------------------------------------------------
#STEP 1) make vars 

#clean environment variables (stripping off redundant quotes if any)
environment="${ENV%\"}"
environment="${environment#\"}"

#clean email address (stripping off redundant quotes if any)
email="${EMAIL%\"}"
email="${email#\"}"

#clean domain names (stripping off redundant quotes if any)
domains="${CN%\"}"
domains="${domains#\"}"


CONTACT="$email"
DOMAINS="$domains"

echo "EMAIL: $CONTACT"
echo "DOMAINS: $DOMAINS"
#-----------------------------------------------------------------------

#-----------------------------------------------------------------------
#STEP 2) get ssl certificates
printf "MAKING SSL CERTIFICATE FOR \n"
set -f
array=(${DOMAINS//,/ })
for i in "${!array[@]}"
do
    echo "$i=>${array[i]} and www.${array[i]}"
    TLD="${array[i]}"
    domain="${TLD%\"}"
    domain="${domain#\"}"

    if [[ "$environment" == "production" ]]; then
        #for production    
        letsencrypt certonly --webroot -w /var/www/letsencrypt -d $domain -d "www."$domain  --agree-tos --email $CONTACT --non-interactive --text

        echo "copying certificates to server..."
        
        #copy live certs if any
        mkdir -p "/var/certs/$domain" && cp "/etc/letsencrypt/live/$domain/cert.pem"      $_
        mkdir -p "/var/certs/$domain" && cp "/etc/letsencrypt/live/$domain/chain.pem"     $_
        mkdir -p "/var/certs/$domain" && cp "/etc/letsencrypt/live/$domain/fullchain.pem" $_
        mkdir -p "/var/certs/$domain" && cp "/etc/letsencrypt/live/$domain/privkey.pem"   $_

    else
        #for testing
        letsencrypt certonly --webroot -w /var/www/letsencrypt -d $domain -d "www."$domain  --agree-tos --email $CONTACT --non-interactive --text --dry-run
    fi
done
#-----------------------------------------------------------------------
echo "certbot execution at 100%...."
#-----------------------------------------------------------------------

