# imoveis-2027

Página única (`index.html`, sem dependências) para comparar apartamentos durante
uma busca: preço, R$/m², custo mensal, itens, filtros e anotações por imóvel.

> **Sobre os dados desta demo**
> Os imóveis listados são uma **amostra montada a partir de anúncios públicos**
> de portais imobiliários, usada apenas para demonstrar a ferramenta. Não
> representam orçamento, proposta, negociação ou decisão de compra de ninguém, e
> podem estar desatualizados ou fora do ar. Nada aqui é recomendação de investimento.
>
> Favoritos, status e anotações **nunca saem do seu navegador** — ficam em
> `localStorage` e não são enviados para lugar nenhum nem versionados no repo.

## O que a página faz

- Filtros por bairro, favoritos e descartados
- Ordenação por R$/m², preço, área, custo mensal ou nº de itens
- Alternância cards ⇄ tabela (colunas clicáveis para ordenar)
- ⭐ favoritar e ✕ descartar em um clique, direto no card
- Anotações por imóvel
- **🔗 copiar meus dados**: gera um link com favoritos, status e anotações
  embutidos. Abra esse link em outro aparelho e o estado é carregado lá.
  É o backup — `localStorage` é por navegador e some se você limpar o site.

## Regerar a partir da planilha

Os dados vivem numa planilha local (`~/Downloads/Aptos.xlsx`, aba
`Pra visitar 2027`), não no repo. Depois de editá-la:

    pip install openpyxl && python3 build.py

`build.py` lê a planilha, embute o JSON e reescreve `index.html`.
`index.html` é **arquivo gerado** — mudanças de layout vão no template dentro do `build.py`.

## Publicação

GitHub Pages a partir de `main` (raiz): https://aagrjr.github.io/imoveis-2027/
