# Use Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY . .

# Expose backend port (adjust if needed)
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]
