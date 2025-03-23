FROM nginx:latest

# Install Node.js for generating commit info
RUN apt-get update && apt-get install -y nodejs npm git

# Set working directory
WORKDIR /app

# Copy package.json and scripts first
COPY package.json generate-commit-info.js ./

# Generate commit info
RUN node generate-commit-info.js

# Copy the rest of the application
COPY . /usr/share/nginx/html/

# Copy generated commit info to the nginx directory
RUN cp /app/commit-info.json /usr/share/nginx/html/
