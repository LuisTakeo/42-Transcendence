FROM node:22

ARG BACK_PORT
ENV BACK_PORT=${BACK_PORT}

WORKDIR /backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${BACK_PORT}

ENTRYPOINT ["npm", "run"]
