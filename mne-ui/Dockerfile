FROM node:18

WORKDIR /app

# Copy only dependency files first
COPY package*.json ./

RUN npm install

# THEN copy the rest
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
