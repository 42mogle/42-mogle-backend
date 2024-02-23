FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY ["package.json", "package-lock.json", "./"]
RUN npm ci

# Copy source code
COPY ["tsconfig.json", "tsconfig.build.json", "./"]
COPY ["nest-cli.json", "./nest-cli.json"]
COPY ["src", "./src"]
COPY ["config", "./config"]

# Build application
RUN npm run build

# Port to expose
EXPOSE 3001

ENTRYPOINT ["node", "dist/main.js"]