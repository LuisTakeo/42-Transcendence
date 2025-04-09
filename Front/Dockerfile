FROM node:22

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala os pacotes locais
RUN npm install

# Copia o restante do projeto
COPY . .

RUN npm install -g typescript && npm install
# Compila uma vez (opcional, pode remover se quiser só no watch)
RUN npx tsc

# Executa os dois comandos usando npx para acessar os binários locais
CMD npx concurrently "npx tsc --watch" "npx live-server --port=3000 --entry-file=index.html"
