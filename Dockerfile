FROM node:latest

RUN apt-get update && apt-get upgrade -y && apt-get install -y lsb-release
RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list' && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN apt-get update
RUN apt-get install postgresql-client-14 -y

WORKDIR /app
COPY entrypoint.sh .
COPY package*.json .
RUN npm install
COPY . .
ENTRYPOINT "/app/entrypoint.sh"

