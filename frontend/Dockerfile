# frontend/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy source
COPY frontend/ .

# Build Next.js
RUN npm run build

# Start Next.js in production mode
CMD ["npm", "start"]
