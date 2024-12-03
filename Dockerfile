FROM ghcr.io/puppeteer/puppeteer:16.1.0 # pulls the image that contains Puppeteer v23.9.0 

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
Run npm ci
COPY ..
CMD [ "node", "index.js" ]