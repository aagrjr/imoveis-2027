# Contexto da busca

Documento de handoff: o que não dá pra deduzir lendo o código.
Atualizado em 2026-08-29.

## O que estamos procurando

Apartamento para compra em São Paulo, zona oeste. Perfil que emergiu da lista:

- **Bairros:** Vila Leopoldina, Alto da Lapa, Vila Romana, Perdizes, Vila Ipojuca
- **Faixa:** R$ 1,55 mi a R$ 2,3 mi (o teto subiu de 2,2 para 2,3 em 29/08/2026)
- **Tamanho:** 110 a 200 m², 3+ quartos, 2–3 vagas
- **Custo mensal** (condomínio + IPTU) é critério de peso — é a ordenação padrão da página

Não é investimento, é moradia. Não há prazo declarado.

## Fluxo de trabalho com o Claude

O ciclo que a gente usa, e que a página foi construída pra suportar:

1. O usuário manda um **link de anúncio** → o Claude extrai os dados, pega a foto de
   capa do `og:image`, e adiciona uma linha em `apts` no `index.html`.
2. Durante a visita, o usuário **clica nos chips de item** pra corrigir o que o
   anúncio errou, toca em **🔗 copiar meus dados** e manda o link resultante.
3. O Claude decodifica o `#s=`, **compara com o publicado** e aplica só o que mudou.
   - Correções de **itens** viram dados do imóvel (`apts[].itens`)
   - **Favorito, status e anotação** vão para `D.estado`, e aí a `estadoVersao`
     precisa mudar, senão nenhum aparelho adota

Sempre mostre o diff antes de aplicar — várias vezes o link trouxe 14 chaves e só
2 tinham mudado.

**Regra prática:** marcar sempre no mesmo aparelho (o celular). O estado publicado
sobrescreve o local no próximo load; marcações feitas em dois aparelhos entre duas
publicações se perdem.

## O que aprendemos sobre os anúncios

Isto vale mais que qualquer dado individual da lista:

1. **Os anúncios subnotificam sistematicamente.** Em ~20 correções feitas pelo
   usuário, quase todas *acrescentaram* itens. Rua Mota Pais foi de 1 para 8 itens,
   CO0275 de 1 para 7, Avenida Mercedes de 2 para 7. Nunca conclua "prédio sem
   lazer" a partir do anúncio — já erramos assim duas vezes.
2. **Pilar Homes marca closet indevidamente.** Confirmado no AXS827 e no ZI278746,
   ambos corrigidos pelo usuário. Desconfie do closet em qualquer imóvel do Pilar.
3. **QuintoAndar separa "Itens disponíveis" (unidade) de amenidades do condomínio**,
   em listas estruturadas — é a fonte mais confiável. Ainda assim erra: o Carlos
   Weber listava churrasqueira como indisponível nos dois, e tinha no prédio.
4. **O bloqueio de WebFetch não é confiável nos dois sentidos.** Pilar e Maramores já
   devolveram 403, mas em 26/08 e 29/08 respectivamente responderam normalmente.
   Sempre tente o fetch primeiro; só vá pro browser se ele falhar de fato.
5. **Endereço:** Maramores e Pilar só divulgam mediante agendamento. Quando o
   usuário souber, publique **rua e número, nunca a unidade** — o repo é público.
6. **O mesmo imóvel aparece em mais de um portal, com números diferentes.** O
   ZI292317 da Pilar é o apartamento da Rua Paulo Franco (Insight Vila Leopoldina,
   nº 153) já listado pelo QuintoAndar: mesmo preço ao real, 3 suítes, 2 vagas, a
   mesma descrição de planta. Mas um diz 112 m² e o outro 117; um cobra R$ 1.500 de
   condomínio e o outro R$ 1.800; IPTU R$ 700 contra R$ 590. **Antes de adicionar,
   compare preço, m², vagas e condomínio com os do mesmo bairro** — quando a Pilar
   ou a Maramores escondem o endereço, é a única checagem possível. Duplicata vira
   `link2` na linha existente, nunca uma linha nova: dois registros do mesmo imóvel
   contam em dobro nos filtros e nas ordenações.
7. **Os nossos próprios dados envelhecem.** A Paulo Franco estava com 3 vagas; o
   anúncio hoje diz 2, e a Pilar confirma 2 fixas. Ao reabrir um anúncio por
   qualquer motivo, confira os números contra o que está publicado.

## Critério de acabamento (o que a tabela não captura)

Descoberto em 2026-09-01, depois de duas rodadas de sugestões recusadas. **Sempre
abra as fotos antes de sugerir um imóvel** — os números sozinhos trazem os
errados. O alvo é estreito:

- ❌ **Reforma antiga.** Parede colorida, sanca de gesso, piso ébano com laca
  branca, mobília clássica. Recusou Rua Wanderley e Rua Doutor Alberto Torres.
- ❌ **Contrapiso / unidade crua.** Não quer tocar obra. Recusou Rua Catão (eu
  tinha sugerido como vantagem — "acaba do seu jeito" — e estava errado) e
  Rua Cayowaá.
- ❌ **Prédio muito antigo.** Recusou o Rua Cardoso de Almeida, 704 em 2026-09-02
  ao saber que o edifício é de 1976 — a unidade era reformada e bonita, o prédio
  é que pesou. **Sempre levante e informe o ano de construção** junto com a
  sugestão; ele não estava na tabela e derrubou um candidato já aprovado nas fotos.
  Não há corte definido: 2002 (Presidente Antônio Cândido) segue na lista.

  **Onde achar o ano.** O QuintoAndar traz "Construído em AAAA" na ficha quando
  tem o dado, e sempre dá o nome do edifício; o Pilar às vezes cita no texto
  ("Construído em 2012, pela Rossi"); VivaReal e Maramores quase nunca. Quando
  faltar, pesquise o nome do edifício ou `"<rua>, <número>" condomínio ano` — as
  páginas de condomínio de Loft, Lopes, QuintoAndar e imovelweb costumam trazer.
  Os campos `ano` e `predio` são opcionais no `apts`. O card mostra os dois
  juntos ("Via Condoti, 2004"), caindo para só o nome ou só "predio de AAAA"
  quando falta um; `ano` também é coluna na tabela (`?` quando ausente).
  O nome do edifício é a chave para achar o ano: o QuintoAndar quase sempre traz
  o nome mesmo sem o ano. **Quando a divergência entre os anos for pequena,
  use o mais antigo**, conforme orientação do usuário em 02/09/2026: Le Havre
  2020 (vs. 2021) e AEI3348 2011 (vs. 2012). Registre a divergência nos comentários
  dos dados. Para divergências maiores ou sem fonte, deixe vazio e diga isso.
- ✅ **Pronto, com acabamento atual.** Ripado de madeira, porcelanato grande
  formato, marcenaria clara, caixilho amplo. É o meio-termo, e é raro.

Bairros: Vila Leopoldina, Alto da Lapa, Vila Romana, Perdizes, Vila Ipojuca,
mais Pompeia, Vila Madalena e Pinheiros. **Vila Anastácio está fora** (região
recusada em 2026-09-01).

## Onde buscar (e o viés que já custou caro)

Em 2026-09-02 a conta era: **21 dos 22 imóveis da lista vieram de portais que as
buscas automáticas não cobriam.** QuintoAndar 9, Pilar 7, Maramores 3, Neto e
MJOffre 1 cada — e só 1 do VivaReal. Motivo: no primeiro dia o QuintoAndar
ignorou filtros por URL, o VivaReal funcionou, e a busca nunca mais saiu de lá.
**Não repita isso.** Varra QuintoAndar e Pilar também.

- **VivaReal** — filtros na URL funcionam (`preco-desde`, `preco-ate`,
  `area-desde`, `quartos`, `vagas`) e `ordem=MOST_RECENT` traz os anúncios novos.
  Paginação por `&pagina=N`, ~20 por página. Zap é do mesmo grupo, estoque
  duplicado, não vale varrer os dois.
- **QuintoAndar** — ignora filtros por URL, mas tem um filtro
  **"Novos ou reformados"** que é exatamente o critério de acabamento, e ele vira
  caminho na URL:
  `/comprar/imovel/<bairro>-sao-paulo-sp-brasil/apartamento/novos-ou-reformados`.
  Preço e área só pelo painel "Mais filtros" (inputs React: use o setter nativo
  de `value` + eventos `input`/`change`). **A lista é virtualizada** — mantém ~11
  cards montados e recicla o resto; `scrollTop` programático não dispara o
  carregamento e dá timeout. Role com o mouse aos poucos, coletando a cada passo.
- **Pilar Homes** — SPA; a página de detalhe responde a WebFetch, a busca precisa
  do browser. Tem exclusivos e off-market que não aparecem em lugar nenhum.
- **Maramores** — bloqueia WebFetch (403), use o browser.

Método que funciona para julgar acabamento: montar uma folha de contato local
com todas as fotos do anúncio numa página só (grid de `<img>` com
`referrerpolicy="no-referrer"`), servir com `python3 -m http.server` e olhar de
uma vez; depois ampliar as que decidem cada item. Muito mais rápido que o
carrossel do portal.

## Decisões já tomadas (não reabrir sem motivo)

- **A planilha foi abandonada.** O projeto nasceu de `~/Downloads/Aptos.xlsx` e tinha
  um `build.py` que gerava o `index.html`. O usuário pediu explicitamente pra não
  depender mais dela. Os dados vivem no `index.html`. Não reintroduza build step.
- **Churrasqueira é dois itens:** `Churrasqueira` (no apartamento) e
  `Churrasq. prédio` (área comum). O usuário quis a distinção porque o uso é
  diferente. Só 3 dos 18 têm a do apartamento.
- **Repo público, com o endereço do AP2372 dentro.** Decidido conscientemente
  depois de eu levantar a questão. As anotações continuam só no `localStorage`.
- **Ordenação padrão: custo mensal crescente.** Antes era "mais itens", trocada
  quando os itens viraram editáveis e a contagem ficou instável.

## Bug que já custou caro

Os dois apartamentos da Rua Froben têm 119 m² cada, e o id saía de `endereco + m2`.
Os dois colidiam no mesmo id: marcar item num marcava no outro, silenciosamente.
Ficou assim por vários commits e **mascarou uma diferença real** — quando separados,
o de 4º andar (R$ 150 mil mais barato) tem 9 itens contra 6 do 16º.

Resolvido com sufixo numérico. Se um dia mudar a regra de id, lembre que ela é
order-dependent e que o id é a chave do estado do usuário.

## Estado em 2026-08-29

20 imóveis. Os 18 primeiros têm itens já revisados pelo usuário em visita ou releitura
do anúncio; o Horizons (26/08) e o AP2434 (29/08) ainda não passaram por revisão — o
AP2434 em especial entrou com **dois itens só**, porque a Maramores não lista nada da
unidade, e isso quase certamente é subnotificação. Todos carregam o
campo `add` — os antigos como 2026-08-24, que é quando o campo nasceu.

- **6 favoritos:** Avenida Mercedes, CCMG083, ZI288619, CO0275, Rua Mota Pais, Rua Ponta Porã
- **descartados:** ver `estado` no index.html
- **Nenhuma visita registrada** ainda (todos em "a visitar")

Observações em aberto:

- **Avenida Mercedes** tem o melhor R$/m² com estrutura (R$ 10.778) e quase o menor
  custo mensal, mas são 6 quartos em 180 m² — planta muito compartimentada.
- **Rua Ponta Porã** é o segundo melhor R$/m², mas é **1º andar**, o que nenhuma
  métrica da página captura.
- **AX396 e Froben 4º** lideram em itens (9) e **não** foram favoritados — pode ser
  decisão ou esquecimento.
- **Rua Inhatium** tem IPTU de R$ 112/mês no anúncio, incompatível com um imóvel de
  R$ 1,85 mi. Provável erro de cadastro, ainda não confirmado. O Carlos Weber tem o
  mesmo problema pelo outro lado: o QuintoAndar mostra IPTU de R$ 42×12 e nós
  gravamos R$ 700 — um dos dois está errado, e ele está descartado de qualquer forma.
- **Horizons** (entrou em 26/08) é o pior R$/m² da lista, R$ 17.094 — acima até das
  Froben. Fica na **Rua Carlos Weber, 790**, a mesma rua do imóvel já descartado, que
  é de outro prédio (Weber Art). Vale saber se a rua foi o motivo do descarte ou não.
- O **IPTU do Horizons (R$ 664)** e o do **ZI292317 (R$ 590)** vieram sem indicação de
  mensal ou anual na página da Pilar. Gravados como mensais; confirmar.
