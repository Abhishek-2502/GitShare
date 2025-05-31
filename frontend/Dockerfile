# Use Node.js image
FROM node:18

# Set memory limit for Node.js during the build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy frontend source code
COPY . .

# Expose default frontend port
EXPOSE 3000

# Run the development server
CMD ["npm", "start"]

# Build the Docker image    
# docker build -t my-frontend-image .
# Run the Docker container
# docker run -d -p 3000:3000 my-frontend-image