# Frontend

Interface do AdotaPerto em Next.js, React e TypeScript, com Tailwind CSS e MapLibre GL JS. Consome a API do backend para autenticação, anúncios, solicitações, favoritos e buscas de localização.

Veja também a [visão geral do projeto](../README.md) e a [configuração do backend](../backend/README.md).

## Funcionalidades

| Funcionalidade | O que a interface oferece | Página ou área |
| --- | --- | --- |
| Página inicial | Apresentação da plataforma, atalhos de adoção/doação, prévia do mapa e animais próximos. | `/` |
| Cadastro e login | Formulários de criação de conta e entrada com e-mail e senha. | `/cadastro`, `/login` |
| Recuperação de senha | Fluxo de solicitação do código, verificação e definição de uma nova senha. | `/esqueci-senha` |
| Catálogo de animais | Consulta dos animais e acesso a fotos, características e detalhes do anúncio. | `/adocao`, `/adocao/[id]` |
| Solicitação de adoção | Preenchimento do questionário para solicitar a adoção de um animal. | `/adocao/[id]/solicitacao` |
| Publicação de doações | Escolha entre anunciar um animal ou um item, com formulários e envio de imagens. | `/doacoes`, `/doacoes/animal`, `/doacoes/item` |
| Catálogo de itens | Consulta de materiais para doação, detalhes e solicitação do item. | `/itens`, `/itens/[id]` |
| Perfil | Consulta e edição dos dados pessoais e gerenciamento da conta. | `/perfil` |
| Minhas publicações | Gerenciamento, edição e exclusão dos anúncios do usuário. | Área de perfil |
| Solicitações | Acompanhamento de solicitações enviadas e recebidas, análise e atualização de status. | Área de perfil e `/perfil/solicitacoes/[id]` |
| Favoritos | Consulta de animais e itens salvos, com busca e paginação na área de perfil. | Área de perfil |
| Mapa interativo | Busca por cidade, bairro ou CEP, geolocalização, filtros por categoria, distâncias, marcadores e detalhes dos resultados. | `/mapa` |
| Serviços próximos | Exibição de veterinários, pet shops e ONGs/abrigos com endereço e contatos quando disponíveis. | `/mapa` |
| Temas e adaptação de tela | Temas claro e escuro, incluindo o mapa, e layout adaptado a celulares e computadores. | Interface geral |
| Feedback ao usuário | Estados de carregamento, notificações e mensagens de erro em formulários e consultas. | Interface geral |

Os marcadores residenciais usam coordenadas aproximadas fornecidas pelo backend. A prévia da página inicial contém marcadores ilustrativos; os resultados de `/mapa` são consultados na API.

## Executar

Dentro de `frontend`, instale as dependências e inicie o servidor:

```powershell
npm install
npm run dev
```

Acesse `http://localhost:3000`. Para usar as funcionalidades que dependem de dados e autenticação, execute também o [backend](../backend/README.md).

## Variáveis de ambiente

Crie `frontend/.env.local` para personalizar a API e os estilos do mapa:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_MAP_STYLE_LIGHT_URL=https://tiles.openfreemap.org/styles/positron
NEXT_PUBLIC_MAP_STYLE_DARK_URL=https://tiles.openfreemap.org/styles/dark
```

As variáveis `NEXT_PUBLIC_*` são públicas e não devem conter segredos. Reinicie o servidor após alterá-las; em produção, gere um novo build.

## Mapas

Os mapas usam OpenFreeMap com MapLibre, sem cadastro ou chave de API. Os estilos padrão são Positron para o tema claro e Dark para o escuro. O navegador precisa de WebGL e acesso ao provedor para carregar ruas, fontes e imagens.

`npm run dev` e `npm run build` preparam automaticamente o worker, seu módulo compartilhado e os source maps em `public/maplibre/<versão>/`. Ao iniciar o Next diretamente, execute antes:

```powershell
node scripts/prepare-map-worker.mjs
```

A integração preserva os créditos dos dados e fornece uma textura local caso o estilo solicite `wood-pattern` sem incluí-la. Veja mais detalhes e diagnóstico na [documentação de mapas](../backend/README.md#mapas).

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Prepara os arquivos do mapa e inicia o ambiente de desenvolvimento. |
| `npm run build` | Prepara os arquivos do mapa e compila a aplicação para produção. |
| `npm start` | Executa a aplicação após o build de produção. |
| `npm run lint` | Verifica o código com ESLint. |
| `npx tsc --noEmit` | Verifica os tipos TypeScript sem emitir arquivos. |
