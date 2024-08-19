FROM jrottenberg/ffmpeg:4.1-alpine AS ffmpeg
FROM node:20-alpine3.20

COPY --from=ffmpeg / /

WORKDIR /

COPY ./job-backend/package*.json ./job-backend/

COPY ./job-backend/*.js ./job-backend/
COPY ./job-backend/*.json ./job-backend/
COPY ./job-backend/*.yaml ./job-backend/


COPY ./job-backend/models/ ./job-backend/models/
COPY ./job-backend/routes/ ./job-backend/routes/
COPY ./job-backend/*.py ./job-backend/
WORKDIR /job-backend

RUN npm install

EXPOSE 4040

CMD ["node", "server.js"]

