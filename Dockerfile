FROM node:7.4-alpine

ENV DEEPSTREAM_AUTH_ROLE=provider \
    DEEPSTREAM_AUTH_USERNAME=trollbox-service

RUN mkdir /usr/local/trollbox
WORKDIR /usr/local/trollbox
COPY . /usr/local/trollbox
RUN npm install

CMD [ "npm", "run", "start-prod"]