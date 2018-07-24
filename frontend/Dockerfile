FROM nginx

# Install app dependencies
WORKDIR /var/www/axio-frontend

RUN apt-get update
RUN apt-get install -y curl build-essential libssl-dev
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs
