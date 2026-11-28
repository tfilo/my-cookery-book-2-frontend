FROM dhi.io/node:26.13.1-debian13-dev AS builder
WORKDIR /usr/src/app
COPY . .
RUN npm install && npm run build

FROM dhi.io/nginx:1.30.8-debian13
COPY ./init/default.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html/
COPY --from=builder /usr/src/app/dist/ .
