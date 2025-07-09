FROM node:22

ARG FRONT_PORT
ENV FRONT_PORT=${FRONT_PORT}

WORKDIR /frontend

COPY package.json package-lock.json* ./

RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install

RUN npm install -g vite

COPY . .

EXPOSE ${FRONT_PORT}

ENTRYPOINT ["npm", "run"]
