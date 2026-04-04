FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Build the NestJS application
RUN npm run build

EXPOSE 5000

# Start in production mode
CMD ["npm", "run", "start:prod"]
