# FROM ghcr.io/puppeteer/puppeteer:23.9.0

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
#     PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# WORKDIR /usr/src/app

# COPY package*.json ./
# RUN npm ci
# COPY . .
# CMD ["node", "app.js"]


# Use Puppeteer's official base image with Chromium pre-installed
FROM ghcr.io/puppeteer/puppeteer:23.9.0

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the application code
COPY . .

# Expose the port your app runs on
EXPOSE 5001

# Run the app
CMD ["node", "app.js"]
