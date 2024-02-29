FROM node:20

WORKDIR /

COPY package*.json ./

COPY ./*.js ./
COPY ./*.json ./
COPY ./*.yaml ./

COPY ./enums ./enums
COPY ./config ./config
COPY ./invoice-templates ./invoice-templates
COPY ./models ./models
COPY ./routes ./routes
COPY ./seeders ./seeders
COPY ./services ./services
COPY ./utils ./utils

RUN npm install

EXPOSE 4000

CMD ["node", "server.js"]