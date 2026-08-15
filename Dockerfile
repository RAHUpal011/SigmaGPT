FROM node:20-bookworm

# Install LibreOffice
RUN apt-get update && \
    apt-get install -y --no-install-recommends libreoffice && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend ./ 

# Create uploads directory
RUN mkdir -p uploads

# Expose backend port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]