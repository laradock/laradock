#!/bin/bash
set -e

# Ensure required variables are set
: "${CERTBOT_CN:?CERTBOT_CN (Common Name) must be set}"
: "${CERTBOT_EMAIL:?CERTBOT_EMAIL must be set}"
: "${CERTBOT_ENVIRONMENT:?CERTBOT_ENVIRONMENT must be set (production|staging|local)}"

echo "[INFO] Environment: $CERTBOT_ENVIRONMENT"
echo "[INFO] Challenge: $( [ "$USE_CLOUDFLARE_CHALLENGE" = "true" ] && echo "Cloudflare DNS" || echo "Webroot HTTP" )"

# Pick the first non-wildcard domain as the primary
PRIMARY_DOMAIN=$(echo "$CERTBOT_CN" | tr ',' '\n' | grep -v '^\*' | head -n1)

# Fallback: if everything is wildcard (rare), strip the '*' and pick one
if [ -z "$PRIMARY_DOMAIN" ]; then
    PRIMARY_DOMAIN=$(echo "$CERTBOT_CN" | tr ',' '\n' | sed 's/^\*\.//' | head -n1)
fi

request_cert_cloudflare() {
    echo "[INFO] Using Cloudflare DNS challenge"

    envsubst < /root/cloudflare.ini.template > /root/.secrets/certbot/cloudflare.ini
    chmod 600 /root/.secrets/certbot/cloudflare.ini

    certbot certonly \
        --dns-cloudflare \
        --dns-cloudflare-credentials /root/.secrets/certbot/cloudflare.ini \
        --dns-cloudflare-propagation-seconds 60 \
        --non-interactive \
        --agree-tos \
        --email "$CERTBOT_EMAIL" \
        $(echo "$CERTBOT_CN" | sed 's/,/ -d /g' | sed 's/^/-d /')
}

request_cert_webroot() {
    echo "[INFO] Using Webroot HTTP challenge"

    mkdir -p /var/www/letsencrypt /var/certs

    certbot certonly \
        --webroot \
        -w /var/www/letsencrypt \
        --agree-tos \
        --email "$CERTBOT_EMAIL" \
        --non-interactive \
        --text \
        $( [ "$CERTBOT_ENVIRONMENT" = "staging" ] && echo "--staging" ) \
        $(echo "$CERTBOT_CN" | sed 's/,/ -d /g' | sed 's/^/-d /')

    /root/copy-certs.sh "$PRIMARY_DOMAIN"
}

generate_local_cert() {
    echo "[INFO] Generating local self-signed certificate for $CERTBOT_CN"
    mkdir -p "/etc/letsencrypt/live/${PRIMARY_DOMAIN}"

    openssl req -x509 -nodes -newkey rsa:2048 \
        -days 365 \
        -keyout "/etc/letsencrypt/live/${PRIMARY_DOMAIN}/privkey.pem" \
        -out "/etc/letsencrypt/live/${PRIMARY_DOMAIN}/fullchain.pem" \
        -subj "/CN=${PRIMARY_DOMAIN}"
}

# -----------------------------
# Initial certificate request
# -----------------------------

if [ ! -f "/etc/letsencrypt/live/${PRIMARY_DOMAIN}/fullchain.pem" ]; then
    case "$CERTBOT_ENVIRONMENT" in
        production)
            if [ "$USE_CLOUDFLARE_CHALLENGE" = "true" ]; then
                request_cert_cloudflare
            else
                request_cert_webroot
            fi
            ;;
        staging)
            request_cert_webroot
            ;;
        local)
            generate_local_cert
            ;;
        *)
            echo "[ERROR] Invalid CERTBOT_ENVIRONMENT: $CERTBOT_ENVIRONMENT"
            exit 1
            ;;
    esac
fi

# -----------------------------
# Renewal loop
# -----------------------------
while true; do
    echo "[certbot] Running renew @ $(date)"

    case "$CERTBOT_ENVIRONMENT" in
        production)
            if [ "$USE_CLOUDFLARE_CHALLENGE" = "true" ]; then
                echo "[certbot] Renewing against PRODUCTION CA (Cloudflare)"
                certbot renew \
                    --quiet \
                    --deploy-hook "docker exec nginx nginx -s reload" \
                    || echo "[certbot] Renewal attempt failed"
            else
                echo "[certbot] Renewing against PRODUCTION CA (Webroot)"
                certbot renew \
                    --quiet \
                    --deploy-hook "/root/copy-certs.sh ${PRIMARY_DOMAIN} && docker exec nginx nginx -s reload" \
                    || echo "[certbot] Renewal attempt failed"
            fi
            ;;
        local)
            echo "[certbot] Skipping renew in local environment (self-signed cert)"
            ;;
        staging)
            echo "[certbot] Renewing against STAGING CA"
            certbot renew \
                --staging \
                --quiet \
                --deploy-hook "/root/copy-certs.sh ${PRIMARY_DOMAIN} && docker exec nginx nginx -s reload" \
                || echo "[certbot] Renewal attempt failed"
            ;;
    esac

    sleep 12h
done
