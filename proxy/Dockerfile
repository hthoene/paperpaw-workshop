# The workshop's proxy, as it runs on the server behind Caddy (README.md).
FROM node:24-alpine

WORKDIR /proxy
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force
COPY src ./src

# The database lives in the volume (its owner the user it runs as);
# nothing else is written.
ENV DATA_DIR=/data PORT=8080 NODE_NO_WARNINGS=1
RUN mkdir /data && chown node:node /data
VOLUME /data
EXPOSE 8080
USER node
CMD ["node", "src/main.mjs"]
