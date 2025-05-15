# Use an official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN npm run build

# Install a lightweight static file server
RUN npm install -g serve

# Expose port 3000 for the application
EXPOSE 3000

# Serve the built application
CMD ["serve", "-s", "build", "-l", "3000"]