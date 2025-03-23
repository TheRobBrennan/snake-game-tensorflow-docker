FROM nginx:latest

# Set working directory for nginx
WORKDIR /usr/share/nginx/html

# Copy the application files
COPY . .
