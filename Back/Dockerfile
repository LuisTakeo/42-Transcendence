FROM node:22

# Defina o diretório de trabalho dentro do container
WORKDIR /backend

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código para o container
COPY . .

# Expose the port your app runs on
EXPOSE ${BACK_PORT:-3142}

# Comando para iniciar o servidor
ENTRYPOINT ["npm", "run"]