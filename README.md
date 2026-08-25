# imoveis-2027

Página única para comparar apartamentos durante uma busca: preço, R$/m², custo
mensal, itens, filtros e anotações por imóvel.

**Um arquivo, sem dependências e sem build.** Abra o `index.html` no navegador
(ou use o link do Pages) e pronto.

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
- Foto de capa de cada anúncio
- ⭐ favoritar e ✕ descartar em um clique, direto no card
- Anotações por imóvel
- **🔗 copiar meus dados**: gera um link com favoritos, status e anotações
  embutidos. Abra esse link em outro aparelho e o estado é carregado lá.
  É o backup — `localStorage` é por navegador e some se você limpar o site.

## Adicionar ou editar um imóvel

Os dados ficam no `const D` dentro do `index.html`, **uma linha por apartamento**.
Copie uma linha, ajuste os campos e salve:

```js
{"bairro": "Vila Romana", "endereco": "Rua Exemplo", "privado": false, "cobertura": false,
 "andar": 7, "m2": 120, "qts": 3, "vgs": 2, "link": "https://...", "foto": "https://...jpg",
 "cond": 1500, "iptu": 700, "valor": 1600000, "itens": ["Churrasqueira", "Piscina"]},
```

- `iptu` e `cond` são valores **mensais**
- `itens` só aceita nomes que existam em `amenidades` (logo acima na mesma lista)
- `privado: true` mostra "endereço só na visita"; `andar` aceita número ou texto
- R$/m², custo mensal e contagem de itens são calculados sozinhos
- `foto` é a capa do anúncio, normalmente a mesma do `og:image` da página:

      curl -sL "<url do anuncio>" | grep -o '<meta[^>]*og:image[^>]*>'

  A imagem é **referenciada** no servidor do portal, nunca copiada para o repo.
  Se o anúncio sair do ar a foto some sozinha e o card segue funcionando; para
  ficar sem foto, basta omitir o campo.

Cuidado com um detalhe: o id usado para guardar favoritos/anotações vem de
`endereco + m2`. Se você corrigir um desses campos, as anotações daquele imóvel
não são reencontradas.

## Publicação

GitHub Pages a partir de `main` (raiz): https://aagrjr.github.io/imoveis-2027/
