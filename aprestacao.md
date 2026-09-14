# AdotaPerto — Vídeos de acompanhamento

**Apresentador:** Joaqui Alberto Barthman Dos Santos  
**RA:** 220370  
**Duração total estimada:** 14 minutos  
**Formato:** apresentação com demonstração do sistema

> Este roteiro reúne o conteúdo obrigatório do Vídeo 0 e do Vídeo 1. Os tópicos da tela devem servir apenas como apoio. A parte marcada como **Fala sugerida** pode ser adaptada durante a gravação.

---

## Slide 1 — Apresentação do projeto

**Tempo:** 45 segundos  
**Vídeo 0 — Diagnóstico pós-férias**
 
### Na tela

- AdotaPerto
- Plataforma web para adoção de animais e doação de itens
- Joaqui Alberto Barthman Dos Santos
- RA 220370

### Fala sugerida

Olá, meu nome é Joaqui Alberto Barthman Dos Santos, RA 220370. Neste vídeo apresentarei o AdotaPerto, mostrarei o estado atual do projeto e as principais evoluções realizadas em setembro. Também comentarei as dificuldades encontradas, os testes executados e o planejamento para a próxima etapa.

---

## Slide 2 — Objetivo do AdotaPerto

**Tempo:** 1 minuto

### Na tela

- Aproximar animais disponíveis e possíveis adotantes
- Facilitar doações de itens para pets
- Organizar solicitações e contatos com segurança
- Mostrar anúncios e serviços próximos no mapa

### Fala sugerida

O objetivo do projeto é concentrar em uma única plataforma o processo de adoção responsável e a doação de itens. Uma pessoa pode publicar um animal, divulgar ração ou acessórios e acompanhar os pedidos recebidos. Quem procura ajuda pode filtrar anúncios, salvar favoritos e enviar solicitações. O mapa complementa a experiência mostrando animais, itens, veterinários, pet shops e abrigos próximos.

---

## Slide 3 — Visão geral da solução

**Tempo:** 1 minuto

### Na tela

| Camada | Tecnologias e responsabilidade |
| --- | --- |
| Frontend | Next.js, React, TypeScript e Tailwind CSS |
| Backend | Node.js, Hono e TypeScript |
| Banco | PostgreSQL com Drizzle ORM |
| Autenticação | Better Auth |
| Imagens | MinIO |
| E-mails | Resend |
| Mapas | MapLibre, OpenFreeMap, ViaCEP, Nominatim e Overpass |

### Fala sugerida

O repositório está dividido em frontend e backend. O frontend reúne as páginas, os formulários e o mapa interativo. O backend concentra autenticação, regras de negócio e acesso ao banco PostgreSQL. O Drizzle organiza os schemas e migrations. O MinIO armazena imagens dos anúncios e perfis. O Resend envia e-mails de autenticação. Para localização, o sistema combina MapLibre e OpenFreeMap com serviços de CEP, geocodificação e busca de estabelecimentos.

---

## Slide 4 — Demonstração do que já funciona

**Tempo:** 2 minutos e 30 segundos

### Sequência de demonstração

1. Abrir a página inicial e alternar entre os temas claro e escuro.
2. Entrar em **Explorar** e mostrar os catálogos de animais e itens.
3. Abrir um animal para mostrar fotos, características e localização aproximada.
4. Entrar com uma conta e mostrar o perfil.
5. Exibir publicações, favoritos e solicitações enviadas ou recebidas.
6. Abrir o mapa e pesquisar uma cidade ou CEP.

### Fala sugerida

A página inicial apresenta os principais caminhos do sistema e uma prévia dos animais próximos. Os catálogos possuem filtros, ordenação, carregamento e estados vazios. Nos detalhes, o usuário consulta fotos e informações do responsável sem expor o endereço exato. Depois do login, o perfil permite editar os dados pessoais e o endereço, gerenciar publicações, acompanhar solicitações e consultar favoritos. O mapa aceita cidade, bairro ou CEP e também apresenta serviços para pets na região pesquisada.

---

## Slide 5 — Visão do código e do repositório

**Tempo:** 1 minuto

### Na tela

```text
AdotaPerto/
├── frontend/
│   └── src/app/        páginas e rotas da interface
├── backend/
│   ├── src/routes/     endpoints da API
│   ├── src/services/   integrações e regras auxiliares
│   └── lib/db/         schemas e migrations
└── README.md           visão geral e instruções
```

### Fala sugerida

No código, o Next.js organiza cada página dentro de `frontend/src/app`. Componentes reutilizáveis cuidam do cabeçalho, cartões, notificações e formulários. No backend, as rotas ficam separadas por recurso, como animais, itens, solicitações, usuários e mapa. Os serviços isolam integrações externas e regras que podem ser compartilhadas. Essa separação facilita localizar problemas e evoluir cada parte sem concentrar tudo em um único arquivo.

---

## Slide 6 — Dificuldades encontradas

**Tempo:** 1 minuto e 15 segundos

### Na tela

- Instabilidade e respostas 503 nos serviços de mapas
- Limites de tempo e disponibilidade de APIs públicas
- Restrição de domínio no envio de e-mails
- Consistência entre desktop, celular e tema escuro
- Validação de permissões e dados obrigatórios

### Fala sugerida

Uma das principais dificuldades foi lidar com APIs externas de mapas. Nominatim e Overpass podem demorar ou ficar temporariamente indisponíveis. Também foi necessário tratar corretamente erros do banco para não confundi-los com falhas dos mapas. Na integração de e-mail, o Resend recusou o remetente enquanto o domínio ainda não estava verificado. No frontend, vários ajustes garantiram alinhamento visual, responsividade e mensagens claras. Outra preocupação foi validar regras tanto na tela quanto na API.

---

## Slide 7 — Planejamento do semestre

**Tempo:** 1 minuto  
**Encerramento do Vídeo 0**

### Na tela

- Setembro: completar fluxos principais e integrações
- Outubro: ampliar testes e concluir infraestrutura de produção
- Novembro: revisar segurança, acessibilidade e desempenho
- Entrega: documentação, demonstração final e correções

### Fala sugerida

O planejamento do semestre prioriza primeiro o funcionamento completo dos fluxos principais. Em setembro, o foco ficou nas integrações, no painel administrativo, nos mapas e na experiência dos formulários. Em outubro, a prioridade será aumentar a cobertura de testes, preparar o envio de e-mails com domínio verificado e organizar a publicação do sistema. Depois, o projeto passará por revisão de segurança, acessibilidade, desempenho e documentação antes da entrega final.

---

## Slide 8 — Evolução de setembro

**Tempo:** 2 minutos  
**Vídeo 1 — Evolução de setembro**

### Na tela

- Painel administrativo responsivo com temas claro e escuro
- Formulários divididos em etapas
- Recuperação de senha e alteração de e-mail
- Validação de endereço antes de publicar ou solicitar
- Mensagens temporárias e erros em português

### Fala sugerida

Em setembro, o painel administrativo recebeu uma interface alinhada ao restante do site, incluindo versão mobile e suporte aos dois temas. Os formulários de cadastro de animais, itens e solicitação de adoção passaram a usar etapas menores, com validação antes de avançar. A recuperação de senha usa código temporário enviado por e-mail, enquanto a alteração de e-mail usa um link de confirmação. O sistema agora exige CEP, rua, cidade e estado antes de publicar ou solicitar algo. Também foram adicionadas notificações temporárias e traduções para os erros de autenticação.

---

## Slide 9 — Integrações e problemas resolvidos

**Tempo:** 1 minuto e 30 segundos

### Na tela

| Integração | Evolução realizada |
| --- | --- |
| Resend | Envio centralizado, modelos HTML e texto, timeout e erros tratados |
| Better Auth | Login, sessões, recuperação de senha e troca de e-mail |
| Mapas | Busca por cidade ou CEP, cache, timeout e respostas mais claras |
| MinIO | Upload de imagens de perfil e anúncios |
| PostgreSQL | Regras de permissão, status e consistência das solicitações |

### Fala sugerida

A integração do Resend foi centralizada no backend e utiliza a variável `RESEND_API_KEY`. Os e-mails possuem conteúdo em HTML e texto, além de tratamento de timeout e falhas da API. O Better Auth gerencia as sessões e os fluxos de acesso. Nas buscas do mapa, o backend passou a tratar melhor a indisponibilidade dos serviços externos. O MinIO mantém as imagens fora do banco, enquanto o PostgreSQL registra usuários, anúncios, favoritos e solicitações. As rotas também verificam autorização, propriedade dos dados e preenchimento do endereço.

---

## Slide 10 — Testes, pendências e conclusão

**Tempo:** 2 minutos

### Testes executados

- Verificação de tipos no frontend e no backend com TypeScript
- ESLint nos componentes e páginas alterados
- Testes automatizados do envio pelo Resend com requisição simulada
- Testes de chave ausente e proteção do link de confirmação
- Conferência dos fluxos principais no navegador

### Pendências para outubro

- Verificar o domínio `barthman.com.br` no Resend
- Testar os fluxos completos com diferentes usuários e permissões
- Ampliar os testes automatizados das rotas e formulários
- Preparar o ambiente de produção e revisar variáveis de ambiente
- Fazer revisão final de acessibilidade, segurança e desempenho

### Fala sugerida

As alterações passaram por verificação de tipos e análise dos arquivos modificados com ESLint. A integração de e-mail possui testes automatizados para o formato da requisição, a ausência da chave e a segurança do link. Os principais fluxos também foram conferidos no navegador. Para outubro, a pendência mais imediata é verificar o domínio no Resend, pois o endereço de produção ainda recebe erro 403. Depois disso, o foco será ampliar os testes com diferentes perfis, preparar o ambiente de produção e realizar a revisão final. O AdotaPerto já possui seus principais fluxos funcionando e agora entra em uma fase de estabilização e preparação para entrega.

---

## Checklist antes de gravar

- Iniciar PostgreSQL, MinIO, backend e frontend.
- Usar uma conta com endereço completo para a demonstração.
- Preparar pelo menos um animal e um item disponíveis.
- Preparar duas contas para mostrar solicitações enviadas e recebidas.
- Evitar exibir chaves ou o conteúdo do arquivo `.env`.
- Fechar notificações e abas que possam mostrar dados pessoais.
- Ensaiar a demonstração para manter o tempo total entre 13 e 15 minutos.
