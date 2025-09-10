# Use the official Node.js image as the base image
FROM node:20.19.3-alpine3.22

WORKDIR /usr/src/app

ENV TZ="America/Porto_Velho"

RUN apk add --no-cache tzdata

# Copy the rest of the application files
COPY ./dist ./dist
COPY ./node_modules ./node_modules
COPY ./package.json ./package.json

# Expose the application port
EXPOSE 4173

# Command to run the application
CMD [ "npm", "run", "preview", "--host", "0.0.0.0" ]