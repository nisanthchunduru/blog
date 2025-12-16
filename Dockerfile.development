FROM node:20-alpine

RUN apk add --no-cache libc6-compat curl

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "run", "dev"]

HEALTHCHECK --interval=5s --timeout=5s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:3000 || exit 1
