FROM node:20-alpine AS builder
WORKDIR /workspace
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm install
RUN cd server && npm install
RUN cd client && npm install
COPY . .
RUN cd client && npm run build

FROM node:20-alpine
WORKDIR /workspace
COPY --from=builder /workspace ./
EXPOSE 3000
CMD ["sh", "-c", "/workspace/server/node_modules/.bin/tsx /workspace/server/index.ts"]
