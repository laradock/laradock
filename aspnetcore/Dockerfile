FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS build

LABEL maintainer=:"MPAO DEV <dev@pension.gov.mv>"

RUN ln -s /usr/share/dotnet/dotnet /usr/local/bin/dotnet

ARG ASPNETCORE_APP_PATH=koshaaru-api

ENV TARGET_PATH=$ASPNETCORE_APP_PATH

COPY entrypoint.sh /home/code/entrypoint.sh

RUN chmod a+x /home/code/entrypoint.sh

RUN apt-get update && \
        apt-get install -y --no-install-recommends apt-utils && \
        apt-get install curl unzip procps -y && \
        curl -sSL https://aka.ms/getvsdbgsh | bash /dev/stdin -v latest -l /publish/vsdbg \

RUN echo "App code path host ${APP_CODE_PATH_HOST}${ASPNETCORE_APP_PATH}"

WORKDIR /var/www/${ASPNETCORE_APP_PATH}

EXPOSE 5000
EXPOSE 80

RUN echo "aspnet_app_path: ${ASPNETCORE_APP_PATH}"
#ENTRYPOINT ['dotnet', 'koshaaru-api.dll']
# CMD tail -f /dev/null
# CMD /bin/sh /home/code/entrypoint.sh ${ASPNETCORE_APP_PATH}

ENTRYPOINT ["sh","-c", "/home/code/entrypoint.sh ${TARGET_PATH}"]

# CMD ${ASPNETCORE_APP_PATH}
#ENTRYPOINT /home/code/entrypoint.sh "${ASPNETCORE_APP_PATH}"

