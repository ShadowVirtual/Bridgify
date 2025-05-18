# Use an official Node runtime as a parent image
FROM node:20.19.1

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install system dependencies required for canvas
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && ln -s /usr/bin/python3 /usr/bin/python

# Install Node.js dependencies
RUN npm install

# Copy the rest of your application files into the container
COPY . .

# Set environment variables if needed
# ENV NODE_ENV=production

# Define the command to run your app
CMD ["node", "src/shard.js"]
