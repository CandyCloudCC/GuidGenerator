FROM node:lts-buster-slim
LABEL maintainer="唐荣 <rong.tang@starcodetech.com>"

WORKDIR /www/server
COPY ./dist ./
VOLUME [ "/www/server/config.js" ]
CMD [ "node", "src/main.js" ]
