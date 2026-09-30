FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends git python3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /murmur
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
ENV MURMUR_SANDBOX=1
ENTRYPOINT ["node_modules/.bin/tsx", "src/cli.ts"]
