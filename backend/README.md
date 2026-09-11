# Backend

API em Node.js e TypeScript, com Hono, Better Auth, Drizzle ORM, PostgreSQL e MinIO. Veja também a [visão geral do projeto](../README.md) e a [documentação do frontend](../frontend/README.md).

## Funcionalidades

| Funcionalidade | Responsabilidade da API | Rotas principais |
| --- | --- | --- |
| Autenticação | Cadastro e acesso com e-mail e senha, sessões e recuperação por código temporário. | `/api/auth/*` |
| Usuários | Consulta de perfil, atualização dos dados, exclusão da própria conta e consulta de CEP. | `/api/users/me`, `/api/users/:id`, `/api/users/cep/:cep` |
| Animais | Listagem, detalhes, criação, edição e exclusão de anúncios, com identificação do responsável. | `/api/animals`, `/api/animals/mine`, `/api/animals/:id` |
| Adoção | Registro de solicitações e respostas do questionário, cálculo de compatibilidade, consulta de recebidas/enviadas e alteração de status. | `/api/adoption-requests`, `/api/adoption-requests/received`, `/api/adoption-requests/:id/status` |
| Itens para doação | Cadastro e gerenciamento de anúncios com categoria, quantidade, condição, imagens e forma de entrega. | `/api/donation-items`, `/api/donation-items/mine`, `/api/donation-items/:id` |
| Solicitações de itens | Envio e consulta das solicitações, alteração de status e atualização do item para doado após aprovação. | `/api/donation-item-requests`, `/api/donation-item-requests/received`, `/api/donation-item-requests/:id/status` |
| Favoritos | Consulta, inclusão, remoção e verificação dos animais e itens salvos pelo usuário. | `/api/favorites`, `/api/favorites/items` |
| Imagens | Upload autenticado e entrega de imagens armazenadas no MinIO; aceita JPEG, PNG e WebP, com até 6 arquivos de até 5 MB por envio. | `/api/uploads/images`, `/api/uploads/images/:userId/:fileName` |
| Geocodificação | Conversão de cidade, bairro ou CEP em coordenadas, integrando ViaCEP e Nominatim. | `/api/map/geocode` |
| Anúncios no mapa | Consulta de animais e itens disponíveis com posição residencial aproximada e tratamento de indisponibilidade do banco. | `/api/map/listings` |
| Estabelecimentos próximos | Consulta de veterinários, pet shops e abrigos via Overpass, com cache e limite de tempo das requisições externas. | `/api/map/places` |
| Status | Verificação simples de resposta do servidor, retornando texto `ok`. | `/status` |

As operações sobre dados pessoais, favoritos, publicações e solicitações aplicam autenticação e verificações de permissão conforme a rota. Os endpoints de mapas são públicos.

A recuperação de senha envia o código por e-mail quando `RESEND_API_KEY` está configurada; `AUTH_EMAIL_FROM` define o remetente. Sem a chave, o código é registrado no terminal do backend para desenvolvimento.

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

## Mapas

A página inicial e `/mapa` usam **MapLibre GL JS** com os mapas vetoriais do [OpenFreeMap](https://openfreemap.org/quick_start/), sem cadastro ou chave de API. O tema do site alterna entre Positron (claro) e Dark (escuro), preservando os marcadores e a posição do mapa. Os créditos do OpenMapTiles e OpenStreetMap aparecem no mapa.

Os estilos padrão funcionam sem configuração adicional. Para trocar os endpoints, crie `frontend/.env.local`:

```env
NEXT_PUBLIC_MAP_STYLE_LIGHT_URL=https://tiles.openfreemap.org/styles/positron
NEXT_PUBLIC_MAP_STYLE_DARK_URL=https://tiles.openfreemap.org/styles/dark
```

Essas URLs devem apontar para estilos compatíveis com MapLibre. Reinicie o frontend após alterar as variáveis; em produção, faça um novo build, pois variáveis `NEXT_PUBLIC_*` são incorporadas durante a compilação.

O navegador precisa de WebGL e acesso ao OpenFreeMap para carregar estilos, fontes e tiles. O mapa de fundo não depende do backend; as buscas por cidade/CEP, estabelecimentos, animais e doações continuam usando a API. As variáveis dos serviços da API estão documentadas acima.

Use `npm run dev` ou `npm run build` dentro de `frontend`: os comandos preparam automaticamente o worker do MapLibre em `public/maplibre/<versão>/`, junto do módulo compartilhado da mesma versão instalada. Esses arquivos são gerados e não entram no Git. Se iniciar o Next diretamente, execute antes `node scripts/prepare-map-worker.mjs`.

Se os marcadores aparecem sem ruas e o console acusa um módulo com MIME `text/html`, confira se o worker foi preparado e reinicie o frontend. Ele deve ser servido como JavaScript, nunca como a página HTML de `/mapa`.

A preparação também copia os source maps (`.mjs.map`) usados pelas ferramentas de desenvolvimento. Se o estilo solicitar `wood-pattern` sem fornecer essa imagem no sprite, os dois mapas registram uma textura local para áreas arborizadas. Esse tratamento continua ativo ao trocar o tema.

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
