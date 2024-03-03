FROM node:20

WORKDIR /

COPY ./package*.json ./

COPY ./*.js ./
COPY ./*.json ./
COPY ./*.yaml ./

COPY ./enums ./enums
COPY ./invoice-templates ./invoice-templates
COPY ./models ./models
COPY ./routes ./routes
COPY ./services ./services
COPY ./utils ./utils
COPY ./public ./public

RUN npm install

EXPOSE 4000

CMD ["node", "server.js"]