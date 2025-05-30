# Use Node.js image
FROM node:18

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
