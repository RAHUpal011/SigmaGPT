FROM node:22-bookworm

WORKDIR /app

# ==========================================
# SYSTEM DEPENDENCIES
# ==========================================

RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

# ==========================================
# VERIFY SYSTEM DEPENDENCIES
# ==========================================

RUN node --version
RUN python3 --version
RUN soffice --version

# ==========================================
# NODE DEPENDENCIES
# ==========================================

COPY backend/package*.json ./backend/

WORKDIR /app/backend

RUN npm install --include=optional

# ==========================================
# APPLICATION
# ==========================================

COPY backend ./

# ==========================================
# PYTHON DEPENDENCIES
# ==========================================

RUN pip3 install --break-system-packages pdf2docx

RUN python3 -c "import pdf2docx; print('pdf2docx OK')"

# ==========================================
# UPLOAD DIRECTORY
# ==========================================

RUN mkdir -p uploads

# ==========================================
# PORT
# ==========================================

EXPOSE 8080

# ==========================================
# START
# ==========================================

CMD ["node", "server.js"]