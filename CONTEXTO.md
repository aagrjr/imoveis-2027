# Contexto da busca

Documento de handoff: o que não dá pra deduzir lendo o código.
Atualizado em 2026-08-29.

## O que estamos procurando

Apartamento para compra em São Paulo, zona oeste. Perfil que emergiu da lista:

- **Bairros:** Vila Leopoldina, Alto da Lapa, Vila Romana, Perdizes, Vila Ipojuca
- **Faixa:** R$ 1,55 mi a R$ 2,3 mi (o teto subiu de 2,2 para 2,3 em 29/08/2026)
- **Tamanho:** acima de 115 m² e até ~200 m², 3+ quartos (o mínimo de área subiu
  de 110 para 115 m² em 2026-09-14)
- **Vagas:** 2–3 é o normal, mas **1 vaga não elimina** se o apartamento for bom
  (definido em 2026-09-20). Antes disso eu cortava 1 vaga na triagem, sem abrir
  as fotos — vários imóveis foram descartados assim e precisaram ser resgatados.
  No VivaReal isso importa na URL: `vagas=2` no filtro esconde os de 1 vaga
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
  **Atenção — a Pilar mostra o ano errado no navegador.** O payload guarda
  `launchDate: "AAAA-01-01"`; o JavaScript lê como meia-noite UTC e o navegador
  em São Paulo (UTC−3) exibe 31/12 do ano anterior. Resultado: **a página aberta
  no browser mostra sempre um ano a menos**; o HTML baixado por `curl` (render do
  servidor, em UTC) e o `launchDate` trazem o ano certo. Confirmado em 21/09 em
  AEI2602 (2018 vs 2017), NRH138 (2012 vs 2011) e FIKA5854 (2000 vs 1999). Em
  20/09 eu "corrigi" o FIKA5854 para 1999 confiando no navegador — errado.
  Leia o ano do `launchDate` ou do HTML do servidor, nunca do browser. Isso
  provavelmente explica parte das divergências de 1 ano que motivaram a regra
  do "mais antigo" acima (Le Havre, AEI3348): quando uma das fontes é a Pilar
  vista no browser, o "mais antigo" é justamente o artefato. A regra é do
  usuário — não altere sem ele decidir.
- ❌ **Decorado de construtora.** Recusou o AEI2726 (Vila Romana, prédio de 2022)
  em 2026-09-11: as fotos eram de apartamento modelo, não da unidade à venda.
  Sinais: prédio com menos de ~5 anos ou anúncio "novo"/"lançamento", encenação
  perfeita (nenhum objeto pessoal, tudo simétrico, luz de catálogo), e às vezes a
  mesma foto em várias unidades do prédio. A unidade real pode estar no
  acabamento padrão ou no contrapiso. **Acabamento bonito só conta se for daquele
  apartamento** — imóvel habitado ou reformado pelo dono é evidência mais forte que
  foto impecável.
- ✅ **Pronto, com acabamento atual.** Ripado de madeira, porcelanato grande
  formato, marcenaria clara, caixilho amplo. É o meio-termo, e é raro.

Bairros: Vila Leopoldina, Alto da Lapa, Vila Romana, Perdizes, Vila Ipojuca,
mais Pompeia, Vila Madalena e Pinheiros. **Vila Anastácio está fora** (região
recusada em 2026-09-01).

**MaxHaus está fora**: qualquer prédio da marca, em qualquer bairro (decidido em
2026-09-14, logo depois de o MaxHaus Vila Leopoldina I passar no filtro de fotos).
Na Av. Mofarrej há mais de um (nº 1130 e 1500); confira o nome do condomínio antes
de sugerir qualquer imóvel dessa avenida.

**A microrregião derruba o imóvel.** Em 2026-09-16 ele recusou o ZI289918 (Vila
Romana, 132 m², 3 suítes, R$ 2,2 mi, acabamento atual): "muito bom mas o lugar não
é tão legal". Fica no quarteirão entre as ruas Jeroaquara, Catão e Coriolano, perto
do Bairro Siciliano. Bairro aprovado não basta — **localize antes de sugerir**, e
diga onde é junto com a sugestão.

**Ruas fora da busca.** Em 2026-09-17 ele tirou a **Rua Lauriano Fernandes Júnior**
e a **Rua Belchior de Azevedo**, as duas na Vila Leopoldina — a segunda é onde fica
o **Podium**, então nenhuma unidade dele serve, por mais barata que apareça (já
apareceram três, de R$ 1,67 mi a R$ 2,5 mi). Ficam fora também os endereços do
**Bairro Siciliano** (Francisco Alves, Faustolo, Jeroaquara). A **Rua Coriolano**
continua valendo: o nº 1642 (Neo Milano) entrou na lista em 16/09.

## Onde buscar (e o viés que já custou caro)

Em 2026-09-02 a conta era: **21 dos 22 imóveis da lista vieram de portais que as
buscas automáticas não cobriam.** QuintoAndar 9, Pilar 7, Maramores 3, Neto e
MJOffre 1 cada — e só 1 do VivaReal. Motivo: no primeiro dia o QuintoAndar
ignorou filtros por URL, o VivaReal funcionou, e a busca nunca mais saiu de lá.
**Não repita isso.** Varra QuintoAndar e Pilar também.

- **VivaReal** — desde 2026-09-14 **ignora `preco-desde`, `preco-ate` e
  `area-desde` na URL** (a busca da zona oeste devolveu Jardim Europa a R$ 13 mi).
  O que funciona é o bairro no caminho,
  `/venda/sp/sao-paulo/zona-oeste/<bairro>/apartamento_residencial/?quartos=3&vagas=2&ordem=MOST_RECENT`
  (Pompeia é `pompeia`; `vila-pompeia` dá 404), filtrando os números no cliente.
  Com uma aba do VivaReal aberta, `fetch()` dessas buscas e das páginas de anúncio
  devolve o HTML completo: um script só varre todos os bairros e ainda pega as
  fotos (`resizedimgs.vivareal.com/img/vr-listing/<hash>/<nome>`; fique só com as
  que têm `-<m2>m-` no nome, as outras são de anúncios similares). Em 2026-09-15
  esse `fetch()` travou (timeout de 45 s) com o painel do browser oculto, e `curl`
  dá 403. O que funcionou foi navegar página a página e ler o DOM já carregado com
  JS síncrono, sem `await`; o `browser_batch` aceita no máximo 25 ações. Zap é do
  mesmo grupo, estoque duplicado, não vale varrer os dois.
- **QuintoAndar** — ignora filtros por URL, mas tem um filtro
  **"Novos ou reformados"** que é exatamente o critério de acabamento, e ele vira
  caminho na URL:
  `/comprar/imovel/<bairro>-sao-paulo-sp-brasil/apartamento/novos-ou-reformados`.
  Preço e área só pelo painel "Mais filtros" (inputs React: use o setter nativo
  de `value` + eventos `input`/`change`). **A lista é virtualizada** — mantém ~11
  cards montados e recicla o resto; `scrollTop` programático não dispara o
  carregamento e dá timeout. Role com o mouse aos poucos, coletando a cada passo.
  Atalho testado em 2026-09-14: `curl` na URL já traz um JSON-LD `ItemList` com os
  12 primeiros (link, m², quartos, rua, preço), sem browser. O `curl` da página de
  anúncio às vezes vem sem fotos; aí abra no browser e colete
  `original<id>-*.jpg` do `innerHTML`, servidas por `/img/med/`.
- **Pilar Homes** — a busca vem renderizada do servidor: `curl` e um split em
  `data-test-id="property-card"` dão código, preço, m², quartos e vagas dos 12 de
  cada bairro, sem browser (testado em 2026-09-14). Tem exclusivos e off-market
  que não aparecem em lugar nenhum.
  **O card da busca mostra suítes, não quartos** — o regex de "N quartos" não casa
  e todo mundo sai com quartos desconhecido. Filtrar por quartos exige o
  `bedrooms` do payload da página de anúncio. Em 18/09 isso deixou passar dois
  imóveis de 2 quartos (MO6117 e ZI104551) até a lista de finalistas.
  **O `__NUXT_DATA__` da página de anúncio traz ~7 anúncios**, o principal mais os
  similares. Varrer o array por chave e pegar a primeira ocorrência mistura campos
  de imóveis diferentes: fixe **um** objeto (o primeiro `dict` que tem
  `askingPrice` e `condoFee`) e leia tudo dele. Confira área e preço contra o card
  da busca — se divergirem, você pegou um similar.
  **As características do payload são a união do anúncio com os similares.**
  No ZI290512 o payload listava 15 itens de área externa; a página renderizada
  mostra 7 no total (Closet, Lavabo, Varanda / Quintal, Playground, Salão de
  festas, Piscina). A descrição idem — a primeira string longa do array pode ser
  de outro imóvel. Pegue itens e descrição do **HTML renderizado** ou do bloco
  JSON-LD preso ao `@id` do código, nunca varrendo o array.
  **Para saber se dois anúncios são o mesmo apartamento, só as fotos decidem.**
  Nome de arquivo não serve: cada corretor sobe a própria cópia numa pasta S3
  própria, então dois anúncios do mesmo imóvel têm **zero** nomes em comum. E
  comparar todas as fotos da página também não serve, porque o HTML traz as dos
  similares junto — isso me deu "11 a 17 fotos idênticas" entre imóveis
  diferentes. O certo é filtrar as fotos cuja URL, depois do base64, contenha o
  `id` do objeto principal, e então **olhar**. Na Via Condoti, 5 anúncios eram 3
  apartamentos: AXS1443 = IEF578 = AEI5822 (vazio, painel de madeira na TV),
  AXS1447 = PLANTA1213 (mobiliado, sofá florido, banco de madeira na varanda) e
  o AP2442 (parede laranja, sofás creme). Preço + condomínio acertou o
  agrupamento, mas quem confirma é a foto.
  **`condoName` é o nome do prédio, não o endereço**, e nome de prédio costuma
  citar uma rua onde ele não fica: o "Momento Mota Pais" (2022) é na Vila Ipojuca
  e não tem nada a ver com o apartamento da Rua Mota Pais (Pateo Mondrian, 2012)
  que está na lista. Antes de declarar duplicata, confira a célula de geo e os
  quartos, e exija **preço e condomínio iguais ao real** — R$ 1,80 mi contra
  R$ 1,85 mi e cond R$ 2.616 contra R$ 2.600 não é o mesmo imóvel. Essa assinatura
  (preço + condomínio) é mais confiável que a metragem, que os portais arredondam.
- **Maramores** — bloqueia WebFetch (403), use o browser.

**Validando o endereço deduzido da célula da Pilar (ida e volta).** Reverse
geocoding com `zoom=18` devolve um `house_number`; então faça o caminho inverso,
geocodifique "<rua>, <número>" e meça a distância até a célula. Abaixo de ~100 m
o número está certo; acima de 400 m é outro prédio na mesma rua. Foi assim que o
ZI286621 fechou na Rua Traipu 1167 (28 m) e que o CVIA1900 e o AXS1552 foram
descartados como sendo os prédios que o QuintoAndar anuncia nas mesmas ruas (472
e 531 m). Sem essa volta o `zoom=17` engana: ele devolve a via mais próxima, que
muda conforme o zoom (o CVIA1900 dá "Dr. Homem de Melo" em 17 e "João Ramalho"
em 18 — é esquina).

**Mesma célula não é mesmo prédio.** A célula da Pilar é um hexágono de ~150 m
e cabe mais de um edifício. Em 21/09 eu disse que ZI166675 e GR2184 eram "o
mesmo prédio" do ZI290512 porque os três caíam na mesma célula — e no mesmo dia
o NRE2512 caiu nessa célula e era o AP2388, da Rua Dr. José Elias 227, a 162 m
do centro. Ou seja, aquela célula tem pelo menos dois prédios (Sales Júnior ~407
e Dr. José Elias 227). Célula igual só diz "mesma quadra"; para afirmar mesmo
prédio precisa de foto ou de número de rua batendo.

**Ano de construção em anúncio da Pilar sem endereço nem nome de prédio: não
tem como.** Testado no ZI286621, CVIA1900 e AXS1552 em 20/09. O campo "Ano de
construção" só aparece em parte dos anúncios, as bases de condomínio (Lopes,
Loft, QuintoAndar, imovelweb) só indexam prédios com nome comercial, e os
prédios pequenos e antigos não estão lá. Quando faltar, diga que falta — não
chute pelo estilo da foto.
  **Não confie nas coordenadas do mapa do anúncio.** Em 18/09 eu deduzi do
  `lat`/`lng` do embed do Google que o AP2352 ficava na Rua Ministro Godói com a
  João Ramalho, e afirmei isso pro usuário. O endereço real é Rua Diana, 863 —
  **1,1 km de distância**. O mapa da Maramores é ofuscado de propósito, coerente
  com o "endereço completo é compartilhado mediante agendamento". A célula de geo
  da Pilar (`h3Cluster`, ~150 m) é confiável; a da Maramores não é. Se o endereço
  não veio do anúncio ou do usuário, diga que não sabe.

**O que decide não é o acabamento, é o tamanho dos quartos** (dito pelo usuário
em 2026-09-20, depois de ele descartar 11 dos 12 imóveis que entraram em dois
dias). A busca e a triagem por números estão boas; a recusa acontece quando ele
analisa a planta. **Ele avalia isso manualmente e pediu para não mudar nada no
processo** — continue trazendo candidatos como antes, sem tentar pré-julgar a
distribuição dos cômodos.
**"Ele avalia manualmente" vale só para planta e tamanho de quarto.** Os filtros
de acabamento desta seção (contrapiso, reforma antiga, prédio muito antigo,
decorado de construtora) continuam sendo trabalho meu, com fotos, antes de
mandar qualquer lista. Em 21/09 eu entendi o contrário, mandei 21 imóveis sem
abrir nenhuma foto e passaram 3 que ele recusa na hora: dois em contrapiso (Rua
Campevas e Rua Rodrigo Lobato) e um lançamento com fotos só de maquete 3D (Rua
Pio XI). Ele percebeu antes de mim. Planta e medidas de cômodo nem existem nos portais
(testado em 17 anúncios de Pilar e QuintoAndar), então não prometa essa
informação.

Método que funciona para julgar acabamento: montar uma folha de contato local
com todas as fotos do anúncio numa página só (grid de `<img>` com
`referrerpolicy="no-referrer"`), servir com `python3 -m http.server` e olhar de
uma vez; depois ampliar as que decidem cada item. Muito mais rápido que o
carrossel do portal.

## Rotina de "tem algo novo?"

Sempre que ele pedir novidades, rode as duas partes — a segunda é tão útil quanto
a primeira, porque anúncio sai do ar sem aviso.

**1. Checar se os ativos ainda existem.** Só os ativos (status != descartado),
hoje ~11. Para cada `link`, leia o **conteúdo renderizado** e confirme preço e
disponibilidade.

> **Não use `curl | grep` para isso.** Testado em 2026-09-04: deu 8 falsos
> positivos em 30 links. As páginas são SPAs e as palavras "indisponível" e "404"
> aparecem dentro do bundle JavaScript mesmo em anúncio ativo. Use WebFetch
> (funciona em QuintoAndar, Pilar, MJOffre, Neto) ou o browser lendo
> `document.body.innerText` (necessário para VivaReal e Maramores, que devolvem
> 403 ao WebFetch).

Reporte mudança de preço junto — é sinal de negociação em andamento.

**2. Buscar anúncios novos.** Alterne a ordem de partida entre as rodadas para não
varrer sempre a mesma fonte:

- **QuintoAndar** — `/comprar/imovel/<bairro>-sao-paulo-sp-brasil/apartamento/novos-ou-reformados`,
  um bairro por vez. Colete os ~23 do primeiro load e navegue para o próximo: a
  lista é virtualizada e a rolagem programática trava.
- **VivaReal** — bairro no caminho com `ordem=MOST_RECENT`, filtrando os números
  no cliente (ver acima). Traz "Publicado há X".
- **Pilar** — `/venda/imoveis/<bairro>-sao-paulo-sp-brasil/apartamento?minAskingPrice=&maxAskingPrice=&regions=<Nome>`,
  via `curl`. Mostra 12 por bairro e não tem paginação: é amostra, diga isso ao
  reportar. A amostra gira: em 2026-09-14 nenhum dos 12 era novo em relação a
  09-11, mas em 09-15 metade dos bairros veio com códigos inéditos.
  A página de detalhe traz `__NUXT_DATA__`, um array em que os campos são índices:
  `condoFee`, `condoName`, `askingPrice` e `suites` resolvem com `arr[obj.campo]`.
  Nome do prédio e ano aparecem como `"<código>","<hash>","<nome>",[],[],"AAAA-MM-DD"`.
  As fotos vêm repetidas em vários tamanhos: deduplique pelo segmento base64 da URL.
  **Para achar onde fica um anúncio sem endereço:** o mesmo payload traz
  `h3Cluster.geometry.coordinates`, a célula de ~150 m onde o imóvel está, e a
  geocodificação reversa (`nominatim.openstreetmap.org/reverse?format=jsonv2&lat=&lon=&zoom=18`)
  devolve a rua. Foi assim que localizamos o ZI289918 (Jeroaquara) e o ZI284654
  (Piracuama). Margem de um quarteirão: trate como rua provável, nunca como endereço
  confirmado, e não publique no campo `endereco`.
- **Masfer** (incluída em 2026-09-22 a pedido dele: costuma postar só nas nossas
  áreas, e 4 dos ativos já vieram de lá) —
  `https://www.masferimoveis.com.br/imoveis/a-venda/apartamento+cobertura?quartos=3+&vagas=1+&area=115+&preco-de-venda=0~3000000`,
  via `curl`, mais `&pagina=2`. Os cards (`/imovel/<slug>/<CÓDIGO>-MA0U`) trazem
  bairro, m², quartos, vagas e preço; o detalhe traz condomínio e IPTU. Ignore
  "Rua Teodoro Sampaio" no texto: é o endereço da imobiliária, não do imóvel. A
  página de detalhe mistura fotos de outros anúncios (130+ URLs `img.kenlo.io`),
  e as primeiras ~10 são as do imóvel. A busca também traz Vila Madalena e Alto de
  Pinheiros, que ficam de fora.

**Antes de mostrar, cruze também com os descartados, não só com os códigos já
vistos.** Um apartamento descartado volta com código novo, em outra imobiliária ou
em outro portal. Compare m² + preço + condomínio com as linhas descartadas do
`index.html` e, se bater perto, confirme pelas fotos. Em 2026-09-22 mandei o Pilar
H2U212 ("Vitá", 129 m², R$ 2,10 mi) e o VivaReal 2913573233 como novidade: eram o
ZI281608, descartado em 21/09. Para ver as fotos de um anúncio antigo da Pilar,
monte a URL direto pela pasta do código:
`blintz-properties-sandbox.s3.amazonaws.com/<CÓDIGO>/pilar-homes-images-watermark/001.jpg`.

Depois **filtre por fotos antes de mostrar qualquer coisa** — ver a seção de
acabamento acima. A taxa histórica é de ~15% dos que passam pelos números.

## Decisões já tomadas (não reabrir sem motivo)

- **A planilha foi abandonada.** O projeto nasceu de `~/Downloads/Aptos.xlsx` e tinha
  um `build.py` que gerava o `index.html`. O usuário pediu explicitamente pra não
  depender mais dela. Os dados vivem no `index.html`. Não reintroduza build step.
- **Churrasqueira é dois itens:** `Churrasqueira` (no apartamento) e
  `Churrasq. prédio` (área comum). O usuário quis a distinção porque o uso é
  diferente. Só 3 dos 18 têm a do apartamento.
- **Repo público, com o endereço do AP2372 dentro.** Decidido conscientemente
  depois de eu levantar a questão. As anotações continuam só no `localStorage`.
- **Descartar não tira o favorito.** Decidido em 2026-09-14: a estrela fica no
  imóvel descartado para lembrar o que já foi favorito (Ponta Porã, Avenida
  Mercedes, Rua Mota Pais). Ao publicar um descarte, mexa só no `status:` e na
  `nota:`, nunca remova o `fav:`.
- **Ordenação padrão: data de entrada, mais novos primeiro.** Decidido em
  2026-09-15. Antes foi "mais itens" (trocada quando os itens viraram editáveis) e
  depois custo mensal crescente. Na mesma data, quem foi inserido depois no `apts`
  aparece antes.

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
