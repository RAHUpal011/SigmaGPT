FROM node:22-bookworm

# ----------------------------------------
# Install system dependencies
# ----------------------------------------

RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

# ----------------------------------------
# Application directory
# ----------------------------------------

WORKDIR /app

# ----------------------------------------
# Copy backend package files
# ----------------------------------------

COPY backend/package*.json ./backend/

WORKDIR /app/backend

# ----------------------------------------
# Install Node dependencies
# ----------------------------------------

RUN npm install

# ----------------------------------------
# Install Python dependencies
# ----------------------------------------

RUN pip3 install --break-system-packages pdf2docx

# ----------------------------------------
# Copy backend source
# ----------------------------------------

COPY backend ./

# ----------------------------------------
# Create uploads directory
# ----------------------------------------

RUN mkdir -p uploads

# ----------------------------------------
# Start server
# ----------------------------------------

EXPOSE 8080

CMD ["node", "server.js"]