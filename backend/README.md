# Backend

## Requisitos

- Node.js 22 ou superior
- npm
- Docker com Docker Compose

## Instalação

Entre na pasta do backend:

```powershell
cd backend
```

Instale as dependências:

```powershell
npm install --legacy-peer-deps
```

## Variáveis de ambiente

Crie o arquivo `.env` dentro de `backend`:

```env
BETTER_AUTH_SECRET=gere-uma-chave-secreta
BETTER_AUTH_URL=http://localhost:4000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/adotaperto
POSTGRES_DB=adotaperto
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_ENDPOINT=localhost
MINIO_BUCKET=adotaperto-images
MINIO_USE_SSL=false

API_PUBLIC_URL=http://localhost:4000
```

Gere uma chave para `BETTER_AUTH_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Banco e armazenamento

Suba PostgreSQL e MinIO:

```powershell
docker compose --env-file .env -f infra/docker-compose.yml up -d
```

Confira os containers:

```powershell
docker compose --env-file .env -f infra/docker-compose.yml ps
```

Portas:

- API: `4000`
- PostgreSQL: `5432`
- MinIO API: `9000`
- MinIO Console: `9001`

## Migrations

Aplique as migrations existentes:

```powershell
npx drizzle-kit migrate
```

Para gerar uma migration depois de alterar os schemas:

```powershell
npx drizzle-kit generate
```

Depois aplique novamente:

```powershell
npx drizzle-kit migrate
```

## Executar

Desenvolvimento com recarregamento automático:

```powershell
npm run dev
```

Execução sem watch:

```powershell
npm start
```

O backend estará disponível em:

```text
http://localhost:4000
```

## Seeder

O seeder associa os animais ao usuário mais antigo. Crie pelo menos uma conta pelo frontend antes de executá-lo.

```powershell
npm run db:seed
```

O comando pode ser executado novamente. Animais existentes são atualizados pelo `id`.

## Verificação de tipos

```powershell
npm run typecheck
```

## Parar os serviços

```powershell
docker compose --env-file .env -f infra/docker-compose.yml down
```

Os dados permanecem nos volumes `postgres_data` e `minio_data`.

Para apagar também os dados, use `down -v`. Esse comando remove banco, usuários, animais, solicitações, favoritos e imagens.
