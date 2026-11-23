FROM node:26-alpine

RUN apk add --no-cache git openssh-client

WORKDIR /app

COPY package*.json ./
COPY . .

ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "start"]
