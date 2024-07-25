FROM node:20

WORKDIR /

COPY ./backend/package*.json ./backend/

COPY ./backend/*.js ./backend/
COPY ./backend/*.json ./backend/
COPY ./backend/*.yaml ./backend/

COPY ./backend/enums ./backend/enums
COPY ./backend/invoice-templates ./backend/invoice-templates
COPY ./backend/models ./backend/models
COPY ./backend/routes ./backend/routes
COPY ./backend/services ./backend/services
COPY ./backend/utils ./backend/utils
COPY ./backend/public ./backend/public
COPY ./backend/websocket-routes ./backend/websocket-routes
WORKDIR /backend

RUN npm install

EXPOSE 4000

CMD ["node", "server.js"]