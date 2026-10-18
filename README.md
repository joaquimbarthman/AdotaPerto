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

O arquivo `render.yaml` cria dois serviços Node.js: API e frontend. No Render, crie um Blueprint a partir do repositório e preencha as variáveis marcadas para configuração manual:

1. No Supabase, copie a connection string **Session pooler** em Connect → Session pooler e configure-a como `DATABASE_URL` na API. Use a senha do banco e codifique caracteres especiais nela para URL. Acrescente `?sslmode=require` (ou `&sslmode=require` se a URL já tiver parâmetros). O pooler Session aceita conexões IPv4, úteis para serviços hospedados; evite a connection string direta se a rede do Render não tiver IPv6. [Guia de conexão do Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).
2. Configure o armazenamento de imagens da API com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. O Blueprint usa o bucket privado `adotaperto-images` (`SUPABASE_STORAGE_BUCKET`) e o comando de inicialização o cria se ainda não existir. Encontre a URL e a chave secreta nas configurações do projeto Supabase. Mantenha a chave somente no serviço da API no Render; não a coloque em variáveis `NEXT_PUBLIC_*` nem no frontend. [Controle de acesso do Supabase Storage](https://supabase.com/docs/guides/storage/security/access-control).
3. Informe `FRONTEND_URL` com a URL pública exata do site. O Blueprint conecta automaticamente a URL da API a Better Auth, links de imagem e chamadas do navegador.
4. Para habilitar e-mails de autenticação, adicione `RESEND_API_KEY` ao serviço da API no Render. Sem ela, o deploy não é bloqueado, mas envio e recuperação de e-mail não ficam disponíveis.

O Render executa `npm run db:setup` antes de iniciar a API: aplica as migrations do Drizzle e prepara o bucket do Supabase Storage. O `NEXT_PUBLIC_API_URL` é ligado à URL pública da API pelo Blueprint antes do build do site, eliminando a necessidade de copiar essa URL manualmente. O Supabase deve estar vazio ou já alinhado às migrations do projeto; faça backup antes de apontar para um banco com tabelas existentes. Consulte [.env.example.deploy](.env.example.deploy) para ver as variáveis que precisam ser informadas. As configurações locais continuam usando PostgreSQL e RustFS/MinIO via Docker Compose.

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
