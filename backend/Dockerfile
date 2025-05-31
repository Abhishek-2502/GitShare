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


# Build the Docker image
# docker build -t my-backend-image .
# Run the Docker container
# docker run -d -p 5000:5000 my-backend-image