# Use an official Node.js runtime as the parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if it exists) into the container
COPY package*.json ./

# Install both production and development dependencies
RUN npm install

# Copy the bot's source code and other necessary files into the container
COPY . .

# Exclude the .env file from the Docker image
# Do NOT uncomment the line below. The .dockerignore file will handle this.
#COPY .env .dockerignore

# Compile the TypeScript to JavaScript
RUN npm run build

# Run the compiled bot when the container starts
CMD ["node", "dist/bot.js"]
