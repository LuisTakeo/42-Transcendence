FROM node:22

ARG FRONT_PORT
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_API_BASE_URL
ENV FRONT_PORT=${FRONT_PORT}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

WORKDIR /frontend

COPY package.json package-lock.json* ./

RUN npm cache clean --force && \
    rm -rf node_modules package-lock.json && \
    npm install

RUN npm install -g vite

COPY . .

EXPOSE ${FRONT_PORT}

CMD ["npm", "run", "dev"]
