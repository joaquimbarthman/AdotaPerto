# Inserts de demonstração

Este pacote reinicia o conteúdo de demonstração do AdotaPerto com:

- 12 animais completos;
- 12 itens completos;
- 3 fotografias externas por anúncio (uma principal e duas adicionais);
- descrições, condições de saúde, comportamento, convivência e contexto de adoção;
- condição, quantidade, entrega, validade e disponibilidade dos itens.

Ao todo são 24 anúncios e 72 imagens. Os anúncios são associados ao usuário mais antigo do banco. Portanto, crie pelo menos um usuário antes da execução e mantenha esse usuário com CEP preenchido para que os registros apareçam corretamente nos filtros de distância e no mapa.

> **Atenção:** o comando abaixo apaga todos os animais e itens existentes antes de inserir o novo conteúdo. A limpeza e a carga acontecem na mesma transação; em caso de falha, o banco desfaz toda a operação.

## Executar

Na pasta `backend`, execute:

```powershell
npm run db:reset-content
```

## Fotografias

As imagens locais estão em `backend/inserts/images` e são enviadas ao MinIO antes de alterar o banco. Execute `npm run startup` primeiro. Os registros usam URLs de `/api/uploads/images/seed/:fileName`. Há 71 arquivos: Paçoca possui duas fotos; arquivos ausentes são informados e omitidos dos registros. O script `frontend/baixar-imagens-seed.mjs` baixa os arquivos para essa nova pasta.