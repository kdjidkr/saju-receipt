# 1. Base Image (Node.js)
FROM node:20-slim

# 2. Install Python and other dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# 3. Create working directory
WORKDIR /app

# 4. Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# 5. Copy requirements and install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# 6. Copy all project files
COPY . .

# 7. Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 8. Start the application
EXPOSE 3000
CMD ["npm", "run", "start"]
