FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# In development, we skip build and use dev server
EXPOSE 3000

CMD ["npm", "run", "dev"]
