# AdotaPerto

O projeto está separado em duas aplicações:

- `frontend/`: interface web em Next.js e TypeScript;
- `backend/`: API em Node.js e TypeScript.

Cada aplicação possui suas próprias dependências, configurações e comandos.

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
