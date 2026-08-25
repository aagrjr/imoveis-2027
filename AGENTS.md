# AGENTS

## Purpose
Single-page web app (pt-BR) para acompanhar a busca de apartamento em São Paulo:
lista, filtra, ordena e compara os imóveis a visitar.

## Files
- `index.html` — **arquivo gerado**. Página completa: CSS e JS embutidos, sem dependências.
- `build.py` — gera `index.html` a partir de `~/Downloads/Aptos.xlsx`, aba `Pra visitar 2027`.
- `README.md`

## Source of truth
Os dados vivem na planilha, não no repo. `build.py` lê a aba `Pra visitar 2027`,
converte o IPTU (`=12*mensal`) para valor mensal e embute tudo num único
`const D = {apts, amenidades}` dentro de `index.html`.

**Não edite os dados direto no `index.html`** — a próxima execução do `build.py`
sobrescreve. Edite a planilha (ou o template dentro do `build.py`) e regenere:

    python3 build.py    # requer openpyxl

Mudanças de layout/CSS/JS vão no template `html = """..."""` dentro do `build.py`.

## Comportamentos a preservar
1. Estado por imóvel em `localStorage`, prefixo `imoveis-2027:` — chaves `fav:`, `status:`, `nota:`.
   O id do imóvel vem de `endereco + m2` slugificado; mudar isso perde as anotações do usuário.
2. Alternância cards ⇄ tabela, filtros por bairro/favoritos/descartados, e as 6 ordenações.
3. R$/m² colorido por quartil (`q1`/`q3` calculados sobre o conjunto todo).
4. Página sem dependências externas e sem build step além do `build.py`.

## Guardrails
1. Manter dependency-free e em pt-BR.
2. Preferir edições localizadas; não reescrever o CSS em bloco.
3. Nada de dados pessoais/financeiros além do que já está nos anúncios públicos —
   o repo é público; anotações ficam no navegador.

## Validação
1. Abrir `index.html` sem erros no console.
2. Contagem de cards e de linhas da tabela bate com a planilha.
3. Favorito, status e anotação persistem após reload.
4. Filtros e ordenações batem com os números da planilha.
