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

As imagens são carregadas remotamente pelo LoremFlickr, com três buscas temáticas e estáveis para cada anúncio. Como são recursos externos, para produção é recomendável baixar as imagens escolhidas, verificar sua licença e enviá-las pelo endpoint de upload do próprio AdotaPerto.
