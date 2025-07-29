# Todo List Backend

API backend para gerenciamento de tarefas (Todo List) com autenticação JWT, notificações em tempo real (RabbitMQ), cache (Redis) e documentação Swagger.

## Funcionalidades

- Cadastro e login de usuários
- CRUD de tarefas
- Notificações em tempo real via RabbitMQ
- Cache de tarefas por usuário com Redis
- Autenticação JWT
- Documentação Swagger

## Pré-requisitos

- Node.js 20.x ou superior
- npm
- Docker e Docker Compose (opcional)

## Instalação e Execução

### Opção 1: Usando Docker (Recomendado)

1. Clone o repositório:

```bash
git clone https://github.com/GChimel/tdl-backend
cd back-end
```

2. As variáveis de ambiente já estão configuradas no arquivo `docker-compose.yml`. Se necessário, altere o valor de `JWT_SECRET` para um segredo forte.

3. Inicie a aplicação com Docker Compose:

```bash
docker compose up -d --build
```

A API estará disponível em `http://localhost:3000`
A documentação Swagger estará em `http://localhost:3000/api`

### Opção 2: Instalação Local (Sem Docker)

1. Clone o repositório:

```bash
git clone https://github.com/GChimel/tdl-backend
cd back-end
```

2. Instale o PostgreSQL, Redis e RabbitMQ em sua máquina:
   - PostgreSQL: porta 5432
   - Redis: porta 6379
   - RabbitMQ: porta 5672 (painel: 15672)

3. Crie o banco de dados:

```bash
createdb todo -U root
```

4. Copie o arquivo `.env.example` para `.env` e ajuste conforme necessário:

```env
JWT_SECRET=sua-chave-secreta
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=todo
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
PORT=3000
```

5. Instale as dependências do projeto:

```bash
npm install
```

6. Rode a API:

```bash
npm run start:dev
```

7. Rode o worker de notificações:

```bash
npm run start:worker
```

A API estará disponível em `http://localhost:3000`
A documentação Swagger estará em `http://localhost:3000/api`

## Variáveis de Ambiente

- `JWT_SECRET`: Chave secreta para autenticação JWT
- `DATABASE_HOST`: Host do banco de dados PostgreSQL
- `DATABASE_PORT`: Porta do PostgreSQL (padrão: 5432)
- `DATABASE_USER`: Usuário do PostgreSQL
- `DATABASE_PASSWORD`: Senha do PostgreSQL
- `DATABASE_NAME`: Nome do banco de dados
- `REDIS_HOST`: Host do Redis
- `REDIS_PORT`: Porta do Redis (padrão: 6379)
- `RABBITMQ_HOST`: Host do RabbitMQ
- `RABBITMQ_PORT`: Porta do RabbitMQ (padrão: 5672)
- `PORT`: Porta da API (padrão: 3000)

## Endpoints Principais

- `POST /auth/sign-up` — cadastro de usuário
- `POST /auth/sign-in` — login
- `GET /task` — listar tarefas do usuário
- `POST /task` — criar tarefa
- `PATCH /task/:taskId` — atualizar tarefa
- `DELETE /task/:taskId` — remover tarefa

## Scripts Disponíveis

- `npm run start:dev` — Inicia o servidor em modo desenvolvimento
- `npm run start` — Inicia o servidor em modo produção
- `npm run start:worker` — Inicia o worker de notificações
- `npm run build` — Compila a aplicação
- `npm run lint` — Executa a verificação de código
- `npm test` — Executa os testes

## Comandos Docker Úteis

- `docker compose up -d` — Inicia a aplicação em background
- `docker compose down` — Para a aplicação
- `docker compose down -v` — Para a aplicação e remove os volumes (banco zerado)
- `docker compose logs` — Visualiza os logs da aplicação
- `docker compose logs -f` — Visualiza os logs em tempo real

## Tecnologias Utilizadas

- NestJS 11
- TypeORM
- PostgreSQL 17
- Redis 7
- RabbitMQ 3
- TypeScript
- Docker Compose
- JWT Auth
- Swagger
