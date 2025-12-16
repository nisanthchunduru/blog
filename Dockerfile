FROM node:20-alpine AS css

WORKDIR /opt/blog

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run tw:build

FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /opt/blog

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY templates ./templates
COPY static ./static
COPY config ./config

COPY --from=css /opt/blog/static/css/tailwind.compiled.css /opt/blog/static/css/tailwind.compiled.css

EXPOSE 4567

CMD ["npm", "start"]

