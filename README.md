# imoveis-2027

Página única (`index.html`, sem dependências) com os apartamentos da aba
**"Pra visitar 2027"** da planilha `~/Downloads/Aptos.xlsx`.

- Filtros por bairro, favoritos e descartados
- Ordenação por R$/m², preço, área, custo mensal ou nº de itens
- Alternância cards ⇄ tabela (colunas clicáveis para ordenar)
- Status, favorito e anotações por imóvel, salvos em `localStorage` (`imoveis-2027:`)

## Regerar a partir da planilha

Depois de editar o xlsx:

    pip install openpyxl && python3 build.py

`build.py` lê a planilha, monta o JSON embutido e reescreve `index.html`.
Os dados ficam num único `const D = {...}` dentro da página — não há fonte externa.
