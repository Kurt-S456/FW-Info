FROM ghcr.io/puppeteer/puppeteer:22.12.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/scr/app

 # Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies including TypeScript
RUN npm ci

# Copy the rest of the application
COPY . .

# Start command
CMD ["npm", "start"]

