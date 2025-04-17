FROM node:22

# Defina o diretório de trabalho dentro do container
WORKDIR /frontend

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código para o container
COPY . .

# Compile os arquivos TypeScript e gere o bundle.js
RUN npm run build

# Exponha a porta que será usada
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"]