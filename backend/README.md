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

VIACEP_BASE_URL=https://viacep.com.br/ws
NOMINATIM_SEARCH_URL=https://nominatim.openstreetmap.org/search
OVERPASS_API_URL=https://overpass-api.de/api/interpreter
WIKIMEDIA_FILE_URL=https://commons.wikimedia.org/wiki/Special:Redirect/file
GOOGLE_MAPS_SEARCH_URL=https://www.google.com/maps/search
```

O serviço de mapas carrega essas URLs do `.env`, sem valores padrão no código. Configure os endpoints sem query string; a barra final é opcional. Reinicie o backend após alterar o `.env`.

| Variável | Uso |
| --- | --- |
| `VIACEP_BASE_URL` | Consulta de endereço por CEP; inclui `/ws`. Se falhar, a busca tenta o CEP diretamente no Nominatim. |
| `NOMINATIM_SEARCH_URL` | Geocodificação de endereços; inclui `/search`. |
| `OVERPASS_API_URL` | Busca de estabelecimentos próximos; inclui `/api/interpreter`. |
| `WIKIMEDIA_FILE_URL` | Links de imagens do Wikimedia Commons; inclui `/wiki/Special:Redirect/file`. |
| `GOOGLE_MAPS_SEARCH_URL` | Links para abrir estabelecimentos no Google Maps; inclui `/maps/search`. |

Uma variável ausente gera erro quando a funcionalidade correspondente precisa dela.

### Mapa de fundo (OpenFreeMap)

O frontend usa MapLibre com OpenFreeMap para os temas claro e escuro, sem cadastro ou chave de API. Os estilos e tiles são carregados diretamente pelo navegador. A antiga rota `/api/map/tiles/:theme/:z/:x/:y` foi removida; `CARTO_API_KEY` não é mais necessária.

As variáveis acima continuam sendo usadas para buscar endereços, estabelecimentos e seus links. A configuração opcional dos estilos fica no `frontend/.env.local`, conforme o [README principal](../README.md#mapas).

## Status da API

`GET /status` é público e retorna HTTP `200`, com corpo de texto `ok` (`text/plain`). Serve para validar que o servidor está respondendo; não verifica banco de dados nem serviços externos.

```powershell
curl.exe -i http://localhost:4000/status
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

Antes de migrar, confira se `DATABASE_URL` aponta para o banco esperado. Um banco vazio provoca o código PostgreSQL `42P01` (tabela inexistente). Nesse caso, `GET /api/map/listings` retorna HTTP `503` com JSON contendo `code: "MAP_DATABASE_NOT_READY"`, em vez de um erro genérico. A API registra o código técnico no terminal sem expor consultas ou credenciais na resposta.

Outras falhas na listagem retornam HTTP `503` com `code: "MAP_LISTINGS_UNAVAILABLE"`. Os endpoints públicos de mapas não dependem da consulta de sessão; o mapa de fundo e as buscas externas podem continuar funcionando durante uma falha no banco.

**Compatibilidade:** as migrations deste repositório estão em pastas com `migration.sql`. O Drizzle Kit `0.31.x` espera o formato com `meta/_journal.json`; não execute `migrate` supondo que essas pastas serão reconhecidas. É necessário alinhar a versão/formato das migrations antes de aplicá-las. Para inicializar um banco local vazio diretamente pelos schemas atuais, execute `npx drizzle-kit push`, revise o plano apresentado e confirme apenas a criação das tabelas esperadas.

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
