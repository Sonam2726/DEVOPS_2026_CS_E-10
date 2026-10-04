# Node.js alpine base image
FROM node:20-alpine

# Working directory set karein
WORKDIR /app

# Dependencies copy & install karein
COPY package*.json ./
RUN npm install --production

# Application code copy karein
COPY . .

# Backend port expose karein
EXPOSE 5000

# Start command
CMD ["node", "server.js"]