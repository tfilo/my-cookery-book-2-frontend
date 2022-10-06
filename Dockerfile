FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY . .
COPY ./openapi.json .
RUN npm install --location=global npm@latest
RUN npm install
RUN npx openapi-generator-plus -o src/openapi/ -g @openapi-generator-plus/typescript-fetch-client-generator openapi.json
RUN npm run build

FROM nginx:stable-alpine
ENV BASE_API_URL='http://localhost/api'
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./envreplace.sh /docker-entrypoint.d/envreplace.sh
WORKDIR /usr/share/nginx/html/
COPY --from=builder /usr/src/app/build/ .
EXPOSE 80
