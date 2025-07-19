FROM node:22

ARG BACK_PORT
ARG FASTIFY_SECRET
ARG GOOGLE_CLIENT_ID
ARG API_BASE_URL
ENV BACK_PORT=${BACK_PORT}
ENV FASTIFY_SECRET=${FASTIFY_SECRET}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV API_BASE_URL=${API_BASE_URL}

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
