FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install -g typescript && npm install

COPY . .

CMD ["npm", "run", "dev"]
