FROM node:22

# Recebe o argumento de build
ARG FRONT_PORT=3042

# Defina o diretório de trabalho dentro do container
WORKDIR /frontend

COPY package.json package-lock.json* ./
RUN npm install

# Instalando o vite globalmente para garantir que esteja disponível
RUN npm install -g vite

# Cópia dos arquivos do projeto
COPY . .

# Expõe a porta para o servidor de desenvolvimento
EXPOSE ${FRONT_PORT}

# Comando para iniciar o servidor de desenvolvimento
ENTRYPOINT ["npm", "run"]