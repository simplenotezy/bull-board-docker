FROM node:20-alpine

WORKDIR /usr/app

# Install pnpm
RUN npm install -g pnpm

COPY ./package.json .

ENV NODE_ENV=production
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379
ENV REDIS_USE_TLS=false
ENV BULL_PREFIX=bull
ENV BULL_VERSION=BULLMQ
ENV USER_LOGIN=''
ENV REDIS_DB=0
ENV PROXY_PATH=''

RUN pnpm install

COPY . .

# Build TypeScript files
RUN pnpm build

ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

CMD ["node", "dist/index.js"]
