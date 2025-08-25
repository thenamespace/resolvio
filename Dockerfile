# Use Node.js LTS version as the base image
FROM node:20-slim

# Install yarn if not already included
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package files and TypeScript config
COPY package.json yarn.lock tsconfig.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY src/ ./src/

# Build the application
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Run the application
CMD ["node", "dist/main.js"]