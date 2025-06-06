FROM node:22

ARG BACK_PORT
ENV BACK_PORT=${BACK_PORT}

WORKDIR /backend

COPY package*.json ./

RUN npm install && \
    apt-get update && \
    apt-get install -y httpie && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE ${BACK_PORT}

ENTRYPOINT ["npm", "run", "dev"]