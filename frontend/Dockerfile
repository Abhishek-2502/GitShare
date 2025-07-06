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




# # For Production Deployment of a React App with Docker (Without Nginx)
# # Stage 1: Build the React app
# FROM node:18 AS build

# # Set memory limit for Node.js during build
# ENV NODE_OPTIONS="--max-old-space-size=4096"

# WORKDIR /app

# # Accept build-time environment variables
# ARG REACT_APP_BACKEND_URL
# ARG REACT_APP_FRONTEND_URL

# # Set them as env vars so CRA can access them
# ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
# ENV REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL

# # Install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy source code and build
# COPY . .
# RUN npm run build

# # Stage 2: Serve app with `serve`
# FROM node:18-alpine

# WORKDIR /app

# # Install `serve` globally
# RUN npm install -g serve

# # Copy build files from previous stage
# COPY --from=build /app/build .

# # Expose the port that `serve` uses
# EXPOSE 3000

# # Start the app
# CMD ["serve", "-s", ".", "-l", "3000"]



# # For Production Deployment of a React App with Docker (With Nginx)
# Stage 1: Build the React app
FROM node:18 AS build

ENV NODE_OPTIONS="--max-old-space-size=4096"

WORKDIR /app

# Accept build-time environment variables
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_FRONTEND_URL

# Set them as env vars so CRA can access them
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL

# Install dependencies and build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config (optional but recommended)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React app from previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
