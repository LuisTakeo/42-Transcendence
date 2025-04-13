FROM node:22

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante do código para o container
COPY . .

# Compile o TypeScript para JavaScript
RUN npm run build

# Exponha a porta que será usada
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]