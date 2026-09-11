# AdotaPerto

O projeto está separado em duas aplicações:

- `frontend/`: interface web em Next.js e TypeScript;
- `backend/`: API em Node.js e TypeScript.

Cada aplicação possui suas próprias dependências, configurações e comandos.

## Mapas

A página inicial e `/mapa` usam **MapLibre GL JS** com os mapas vetoriais do [OpenFreeMap](https://openfreemap.org/quick_start/), sem cadastro ou chave de API. O tema do site alterna entre Positron (claro) e Dark (escuro), preservando os marcadores e a posição do mapa. Os créditos do OpenMapTiles e OpenStreetMap aparecem no mapa.

Os estilos padrão funcionam sem configuração adicional. Para trocar os endpoints, crie `frontend/.env.local`:

```env
NEXT_PUBLIC_MAP_STYLE_LIGHT_URL=https://tiles.openfreemap.org/styles/positron
NEXT_PUBLIC_MAP_STYLE_DARK_URL=https://tiles.openfreemap.org/styles/dark
```

Essas URLs devem apontar para estilos compatíveis com MapLibre. Reinicie o frontend após alterar as variáveis; em produção, faça um novo build, pois variáveis `NEXT_PUBLIC_*` são incorporadas durante a compilação.

O navegador precisa de WebGL e acesso ao OpenFreeMap para carregar estilos, fontes e tiles. O mapa de fundo não depende do backend; as buscas por cidade/CEP, estabelecimentos, animais e doações continuam usando a API. Veja a [configuração do backend](backend/README.md).

Use `npm run dev` ou `npm run build` dentro de `frontend`: os comandos preparam automaticamente o worker do MapLibre em `public/maplibre/<versão>/`, junto do módulo compartilhado da mesma versão instalada. Esses arquivos são gerados e não entram no Git. Se iniciar o Next diretamente, execute antes `node scripts/prepare-map-worker.mjs`.

Se os marcadores aparecem sem ruas e o console acusa um módulo com MIME `text/html`, confira se o worker foi preparado e reinicie o frontend. Ele deve ser servido como JavaScript, nunca como a página HTML de `/mapa`.

A preparação também copia os source maps (`.mjs.map`) usados pelas ferramentas de desenvolvimento. Se o estilo solicitar `wood-pattern` sem fornecer essa imagem no sprite, os dois mapas registram uma textura local para áreas arborizadas. Esse tratamento continua ativo ao trocar o tema.
