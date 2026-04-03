FROM docker.io/library/node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma@6.4.1 generate
RUN npm run build

FROM docker.io/library/node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
# Note: For now we'll use ts-node-dev for development in docker
# In production, we would build to JS.
COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
