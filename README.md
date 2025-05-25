# Banco de Dados

Este projeto utiliza **SQLite** como banco de dados local.

## Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configurar as portas do frontend e backend. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Frontend port
FRONT_PORT=3042

# Backend port
BACK_PORT=3142
```
ou qualquer outra porta que queira.

## Make Commands

The project includes a Makefile with useful commands to manage Docker containers:

```bash
# Start containers
make up

# Stop containers
make down

# Rebuild and start containers
make build

# Restart containers
make restart

# View logs
make logs

# Clean unused containers and images
make clean

# Start in development mode (ports 3043/3143)
make dev

# Start in production mode (ports 3042/3142)
make prod

# View frontend logs
make frontend-logs

# Restart frontend
make frontend-restart

# View backend logs
make backend-logs

# Restart backend
make backend-restart
```

## Como rodar o servidor

1. Entre na pasta `Back`:

```bash
cd Back
```

2. Inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

Esse comando irá iniciar o backend e aplicar as migrations automaticamente, criando o banco SQLite no arquivo:

```
./src/database/mydatabase.sqlite
```

## Configuração do Frontend

O frontend utiliza Vite como bundler. Para desenvolvimento:

```bash
cd Front
npm run dev
```

Para build de produção:

```bash
cd Front
npm run build
```

O build será gerado na pasta `dist` e pode ser servido com:

```bash
npm run preview
```

## Como acessar o banco SQLite

Para acessar diretamente o banco e verificar tabelas ou dados, use o cliente SQLite no terminal. Dentro da pasta `Back`, rode:

```bash
sqlite3 ./src/database/mydatabase.sqlite
```

No prompt do SQLite, digite:

```sql
.tables
```

para listar as tabelas existentes.

## Estrutura do banco

O banco possui as seguintes tabelas principais:

- **users**: informações dos usuários (nome, username, email, senha hash, avatar, status online, etc.).
- **chats**: conversas entre pares de usuários, garantindo unicidade e integridade referencial.
- **messages**: mensagens enviadas nas conversas, com remetente, conteúdo e timestamp.
- **friends**: relacionamentos de amizade entre usuários, com integridade referencial.
- **matches**: partidas entre jogadores, com placares, vencedor e data da partida.

As tabelas são criadas automaticamente via migrations ao iniciar o backend.
