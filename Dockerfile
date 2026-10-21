# The workshop on your own computer: built with Node, served by nginx.
#   docker compose up        (see README.md)
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# The handbook is in public/handbook already (npm run handbook makes it anew).
RUN npm run build

FROM nginx:1.29-alpine
COPY local/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
