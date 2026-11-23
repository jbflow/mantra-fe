FROM node:26-alpine

RUN apk add --no-cache git openssh-client

WORKDIR /app

# Install dependencies first (cached layer)
COPY package*.json ./
RUN npm ci --no-audit 2>/dev/null || npm ci || true

# Copy source
COPY . .

ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "start"]
