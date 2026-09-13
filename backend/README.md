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
| Status | Verificação do servidor, PostgreSQL e bucket MinIO em JSON. | `/status` |

As operações sobre dados pessoais, favoritos, publicações e solicitações aplicam autenticação e verificações de permissão conforme a rota. Os endpoints de mapas são públicos.

A recuperação de senha envia o código por e-mail quando `RESEND_API_KEY` está configurada; `AUTH_EMAIL_FROM` define o remetente. Sem a chave, o código é registrado no terminal do backend para desenvolvimento.

## Primeiro administrador

O adapter de autenticação verifica se há usuários antes de salvar uma nova conta.
Se não houver, atribui `admin`; os cadastros comuns seguintes recebem `user`.
A consulta e a criação usam a mesma transação com um lock para serializar cadastros
simultâneos. A regra está no código, sem trigger ou migration adicional.
Contas existentes não são promovidas. Se todas as contas forem excluídas, o próximo
cadastro será novamente o primeiro usuário e receberá `admin`.

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

Copie `.env.example` para `.env` dentro de `backend` e configure os valores locais. Arquivos com credenciais não devem ser versionados. Gere um segredo próprio para `BETTER_AUTH_SECRET`.

Exemplo de configuração:

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

`GET /status` é público e consulta PostgreSQL e a existência do bucket MinIO, com limite de 5 segundos por verificação. Retorna JSON e HTTP `200` quando tudo está disponível ou `503` quando uma dependência falha. A consulta não cria o bucket. Exemplo: `{"status":"ok","server":{"status":"ok","uptime":42},"database":{"status":"ok"},"bucket":{"status":"ok","name":"adotaperto-images"}}`.

```powershell
curl.exe -i http://localhost:4000/status
```

Gere uma chave para `BETTER_AUTH_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Banco, armazenamento e e-mails locais

Suba PostgreSQL, MinIO e Mailpit:

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
- Mailpit SMTP: `1025`
- Mailpit interface web: `8025`

O Mailpit captura e-mails de desenvolvimento. Acesse a caixa de entrada em http://localhost:8025 e use `localhost:1025` como servidor SMTP para aplicações executadas no host (ou `mailpit:1025` dentro da rede do Compose), sem autenticação ou TLS. As portas publicadas ficam restritas ao acesso local. Para alterá-las, defina `MAILPIT_SMTP_PORT` e `MAILPIT_UI_PORT` no `backend/.env`.

A configuração segue a [documentação oficial do Mailpit](https://mailpit.axllent.org/docs/install/docker/). O envio atual do backend usa Resend ou registra o código no terminal; para que esses e-mails apareçam no Mailpit, será necessário integrar o envio por SMTP.

## Migrations

Antes de migrar, confira se `DATABASE_URL` aponta para o banco esperado. Um banco vazio provoca o código PostgreSQL `42P01` (tabela inexistente). Nesse caso, `GET /api/map/listings` retorna HTTP `503` com JSON contendo `code: "MAP_DATABASE_NOT_READY"`, em vez de um erro genérico. A API registra o código técnico no terminal sem expor consultas ou credenciais na resposta.

Outras falhas na listagem retornam HTTP `503` com `code: "MAP_LISTINGS_UNAVAILABLE"`. Os endpoints públicos de mapas não dependem da consulta de sessão; o mapa de fundo e as buscas externas podem continuar funcionando durante uma falha no banco.

Execute na pasta `backend`, com PostgreSQL e MinIO já disponíveis:

```powershell
npm run startup
```

O comando aplica as migrations registradas em `lib/db/migrations/meta/_journal.json` e cria o bucket se ele não existir. Não precisa de usuário e não executa o seeder nem inicia o servidor. Pode ser repetido: migrations aplicadas são controladas pelo Drizzle. Se falhar, termina com código 1. As pastas antigas com `migration.sql` não fazem parte do journal atual.

Se o banco já tem tabelas criadas por `drizzle-kit push`, mas não possui histórico de migrations, a migration inicial pode acusar tabelas existentes. Nesse caso, alinhe o histórico antes de usar o startup; o script não apaga nem recria tabelas existentes.

Para gerar novas migrations: `npx drizzle-kit generate`.
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

Execute `npm run startup` antes do seeder. O seeder envia as imagens de `inserts/images` ao bucket e salva URLs da API. O comando pode ser repetido; animais e itens existentes são atualizados pelo `id`.

## Verificação de tipos

As solicitações de itens em análise podem ser aprovadas, recusadas ou canceladas pelo responsável pelo item. Estados concluídos não podem ser reabertos; repetir o mesmo status não altera o saldo. A aprovação desconta a quantidade solicitada do saldo disponível e marca o item como doado somente quando ele chega a zero. Solicitações pendentes sem saldo suficiente retornam HTTP `409` ao tentar aprovar. As alterações de saldo e solicitação usam uma transação com bloqueio do item para serializar aprovações concorrentes.

Para testar esse fluxo, configure `TEST_DATABASE_URL` com um PostgreSQL de testes e execute `npm run test:integration`. O teste cria um schema temporário isolado, aplica a migration inicial e remove esse schema ao terminar. Inclui concorrência, aprovação parcial, permissões, transições e rollback. Sem a variável, os testes são ignorados.

```powershell
npm run typecheck
```

## Parar os serviços

```powershell
docker compose --env-file .env -f infra/docker-compose.yml down
```

Os dados permanecem nos volumes `postgres_data`, `minio_data` e `mailpit_data`.

Para apagar também os dados, use `down -v`. Esse comando remove banco, usuários, animais, solicitações, favoritos, imagens e e-mails capturados pelo Mailpit.
