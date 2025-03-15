FROM node:22-alpine AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm install --location=global npm@latest \
    && npm install \
    && npm run apigen \
    && npm run build

FROM nginxinc/nginx-unprivileged:alpine3.20-slim
ENV BASE_API_URL='http://localhost/api'
COPY ./init/default.conf /etc/nginx/conf.d/default.conf
COPY ./init/envreplace.sh /docker-entrypoint.d/envreplace.sh
WORKDIR /usr/share/nginx/html/
COPY --from=builder /usr/src/app/build/ .
USER root
RUN chown nginx:nginx -R /usr/share/nginx/html/ && \
    chown nginx:nginx /etc/nginx/conf.d/default.conf
USER nginx
