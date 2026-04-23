FROM node:20-alpine

# Install build dependencies for native modules (bcrypt, sqlite3, pg)
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Build the NestJS application
RUN npm run build

EXPOSE 5000

# Start in production mode
CMD ["npm", "run", "start:prod"]
