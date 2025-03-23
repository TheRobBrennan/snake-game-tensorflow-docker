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

## Testing GitHub Actions Locally

We recommend using [act](https://github.com/nektos/act) to test GitHub Actions workflows locally before pushing changes if you are developing on a Mac.

The application does not have to be running in Docker to test the workflows, but Docker Desktop must be running for the act tests to run and spin up the necessary containers.

Prerequisites for macOS

- Homebrew
- Docker Desktop (must be running)

```sh
# Install act using Homebrew
brew install act

# Verify installation
act --version # Should show 0.2.74 or higher

```

### Running Tests

The following test scripts are available:

1. `npm run test`
   - Primary test command
   - Runs all workflow tests via test:workflows
   - Recommended for general testing

2. `npm run test:workflows`
   - Runs all workflow tests in sequence
   - Tests PR title validation and version bumping
   - Provides detailed feedback

3. `npm run test:workflows:semantic`
   - Tests PR title validation only (using minor version example)
   - Validates against conventional commit format

4. `npm run test:workflows:semantic:major`
   - Tests PR title validation with breaking change
   - Validates major version bump detection

5. `npm run test:workflows:semantic:minor`
   - Tests PR title validation with new feature
   - Validates minor version bump detection

6. `npm run test:workflows:semantic:patch`
   - Tests PR title validation with bug fix
   - Validates patch version bump detection

7. `npm run test:workflows:semantic:invalid`
   - Tests PR title validation with invalid format
   - Verifies rejection of non-compliant PR titles

8. `npm run test:workflows:version`
   - Tests version bump workflow
   - Note: Git operations will fail locally (expected)

9. `npm run test:workflows:merge`
   - Tests main branch merge workflow
   - Simulates PR merge and version bump process
   - Note: Git operations will fail locally (expected)

#### Expected Test Results

1. Semantic PR Check Tests:
   - All tests should pass except "invalid" test
   - Invalid PR format test should fail with clear error

2. Version Bump Tests:
   - Will show git authentication errors (expected)
   - These workflows can only be fully tested in GitHub Actions

3. Merge Tests:
   - Will show authentication errors locally (expected)
   - Tests workflow syntax and merge logic
   - Full functionality requires GitHub Actions environment

## Development Guidelines

- **Version Control**: We use semantic versioning with automated version bumps
- **Commit Signing**: All commits must be GPG signed
- **Pull Requests**: PR titles must follow conventional commit format

For detailed guidelines, see:

- [Contributing Guidelines](./CONTRIBUTING.md)
- [Testing Documentation](./.github/docs/TESTING.md)
- [Repository Setup](./.github/docs/SETUP.md) (for maintainers)

## License

This project is licensed under the [Apache 2.0 License](/LICENSE).
