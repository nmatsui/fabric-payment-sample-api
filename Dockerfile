FROM ubuntu:16.04

RUN apt-get update
RUN apt-get upgrade -y

RUN apt-get install -y curl nodejs npm
RUN npm cache clean
RUN npm install n -g
RUN n 8.9.4
RUN apt-get purge -y nodejs npm

RUN mkdir /etc/hyperledger
COPY package.json /etc/hyperledger

WORKDIR /etc/hyperledger
RUN npm install
