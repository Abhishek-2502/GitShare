# For Development of a React App with Docker
# # Use Node.js image
# FROM node:18

# # Set memory limit for Node.js during the build
# ENV NODE_OPTIONS="--max-old-space-size=4096"

# # Set working directory
# WORKDIR /app

# # Copy dependency files and install
# COPY package*.json ./
# RUN npm install

# # Copy frontend source code
# COPY . .

# # Expose default frontend port
# EXPOSE 3000

# # Run the development server
# CMD ["npm", "start"]

# # Build the Docker image    
# # docker build -t my-frontend-image .
# # Run the Docker container
# # docker run -d -p 3000:3000 my-frontend-image




# For Production Deployment of a React App with Docker
# Stage 1: Build the React app
FROM node:18 AS build

# Set memory limit for Node.js during build
ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Accept build-time environment variables
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_FRONTEND_URL

# Set them as env vars so CRA can access them
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve app with `serve`
FROM node:18-alpine

WORKDIR /app

# Install `serve` globally
RUN npm install -g serve

# Copy build files from previous stage
COPY --from=build /app/build .

# Expose the port that `serve` uses
EXPOSE 3000

# Start the app
CMD ["serve", "-s", ".", "-l", "3000"]

