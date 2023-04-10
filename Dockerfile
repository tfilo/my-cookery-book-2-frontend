FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm install --location=global npm@latest
RUN npm install
RUN npx openapi-generator-plus -c openapi-config.yml
RUN npx replace-in-file --configFile=replace-config.js
RUN npm run build

FROM nginx:stable-alpine
ENV BASE_API_URL='http://localhost/api'
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./envreplace.sh /docker-entrypoint.d/envreplace.sh
WORKDIR /usr/share/nginx/html/
COPY --from=builder /usr/src/app/build/ .
EXPOSE 80
