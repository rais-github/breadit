# Use an official Node.js runtime as a parent image
ARG NODE_VERSION=20.16.0
FROM node:${NODE_VERSION}-alpine

# Set the working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV production

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (only production dependencies)
RUN npm ci --only=production

# Copy the Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the Next.js app for production
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Apply database migrations and start the application
CMD npx prisma migrate deploy && npm run start
