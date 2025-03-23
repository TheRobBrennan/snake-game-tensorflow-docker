# 🎯 AI Snake Game with Docker & TensorFlow.js

## Overview

This project demonstrates an AI-powered Snake game with TensorFlow.js. Game allowing users to either play manually or let the AI control the snake.

![ ](https://github.com/user-attachments/assets/6657078f-be16-4679-bb0a-565e6c8e1d0a)

## Project Structure

- **index.html** - Main webpage hosting the game interface & loads library
- **ai.js** - AI model integration and decision-making
- **script.js** - Game logic and user interactions
- **style.css** - Theme and color settings
- **Dockerfile** - File to build the container image

## Setup Instructions

### Using Docker Compose

Bring up the application:

```sh
docker compose up -d 
```

### Using npm Scripts

This project includes several npm scripts to make working with Docker easier:

```sh
# Build and start the application in one command
npm start

# Build the Docker image
npm run docker:build

# Run the Docker container
npm run docker:run

# Stop the running container
npm run docker:stop

# Remove the container
npm run docker:remove

# Stop and remove the container
npm run docker:clean

# Restart the container (stop, remove, and run)
npm run docker:restart

# Run with a volume mount for development (changes reflect immediately)
npm run docker:dev
```

### Accessing the Application

Open your web browser and access the following URL:

```sh
http://localhost:8080
```

## License

This project is licensed under the [Apache 2.0 License](/LICENSE).

## Contributing

Since this project is intended to support a specific use case guide, contributions are limited to bug fixes or security issues. If you have a question, feel free to open an issue!

If you have any questions, please contact `#docs` on the [Docker Community Slack](https://communityinviter.com/apps/dockercommunity/docker-community).
