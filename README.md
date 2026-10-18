# AdotaPerto

O projeto está separado em duas aplicações:

- `frontend/`: interface web em Next.js e TypeScript;
- `backend/`: API em Node.js e TypeScript.

Cada aplicação possui suas próprias dependências, configurações e comandos.

## Desenvolvimento local

Requisitos: Node.js 22 ou superior, npm e Docker Desktop. Na raiz do projeto:

```sh
npm run setup
npm run dev
```

`setup` instala as versões registradas nos lockfiles (`npm ci`) e cria `backend/.env` com um segredo local. Isso também refaz `node_modules` de forma limpa, evitando misturar binários nativos de instalações anteriores. `dev` inicia PostgreSQL, armazenamento de imagens e Mailpit pelo Docker Compose, aplica as migrations e abre a API e o site. Acesse http://localhost:3000. Encerre com `Ctrl+C`; os containers e os dados continuam disponíveis para a próxima execução. Para parar os containers: `npm run local:down`.

Comandos úteis na raiz: `npm run db:setup`, `npm run db:seed`, `npm run dev:backend` e `npm run dev:frontend`. Para configurar e diagnosticar cada parte, consulte os READMEs do [backend](backend/README.md) e [frontend](frontend/README.md).

## Deploy no Render com Supabase

O Render publica frontend e API em um único serviço Docker e domínio. A imagem compila as duas aplicações; o servidor encaminha `/api/*` e `/status` para Hono e as demais rotas para Next.js.

No Render, use **New Web Service** conectado ao repositório com estas opções:

1. Language: **Docker**; Branch: a branch do deploy; Root Directory: vazio.
2. Dockerfile Path: `./Dockerfile`; Docker Context: `.`; plano conforme sua conta.
3. Em **Environment**, configure `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `BETTER_AUTH_SECRET` e as cinco URLs de CEP/mapas de [.env.example.deploy](.env.example.deploy). A chave antiga `SUPABASE_SERVICE_ROLE_KEY` também é aceita.

O Render injeta `PORT` e `RENDER_EXTERNAL_URL`. Site, API e autenticação usam o mesmo domínio, sem `NEXT_PUBLIC_API_URL` no painel. Ao iniciar, o container aplica migrations e prepara o bucket `adotaperto-images` no Supabase Storage. Os URLs de mapas e geocodificação estão no exemplo de ambiente; os estilos do mapa têm valores padrão no frontend.

Para habilitar e-mails, adicione `RESEND_API_KEY` e `AUTH_EMAIL_FROM` com um remetente do seu domínio verificado.

O `render.yaml` oferece a mesma imagem para quem criar um Blueprint. A tela **New Web Service** usa as opções preenchidas no painel e não carrega esse arquivo. O desenvolvimento local continua usando PostgreSQL e armazenamento de imagens via Docker Compose.

## Funcionalidades gerais

| Funcionalidade | Descrição |
| --- | --- |
| Conta e acesso | Cadastro, login, recuperação de senha e gerenciamento do perfil. |
| Adoção de animais | Publicação e consulta de animais, com fotos, características e informações de cuidado. |
| Solicitações de adoção | Envio de questionário, análise de compatibilidade e acompanhamento das solicitações enviadas e recebidas. |
| Doação de itens | Publicação de produtos e materiais, consulta dos anúncios e solicitação de doações. |
| Gestão de publicações | Edição e exclusão dos próprios anúncios e acompanhamento das solicitações. |
| Favoritos | Animais e itens salvos para consultar depois. |
| Mapa da região | Busca por cidade, bairro ou CEP, localização do usuário e visualização de anúncios próximos. |
| Serviços para pets | Busca de veterinários, pet shops e ONGs/abrigos próximos, com informações disponíveis de contato. |
| Privacidade de localização | Exibição aproximada das localizações residenciais no mapa. |
| Imagens | Envio e armazenamento de fotos para os anúncios e o perfil. |
| Interface adaptável | Layout para diferentes tamanhos de tela e temas claro e escuro. |

## Documentação dos projetos

| Projeto | Responsabilidade | Documentação |
| --- | --- | --- |
| Frontend | Páginas, formulários, navegação e mapa interativo. | [Funcionalidades e execução](frontend/README.md) |
| Backend | Autenticação, regras de negócio, banco de dados, imagens e integrações de localização. | [Funcionalidades e configuração](backend/README.md) |
