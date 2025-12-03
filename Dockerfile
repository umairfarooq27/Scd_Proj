FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create directories
RUN mkdir -p data backups

# Change to keep container running
CMD ["node", "main.js"]
