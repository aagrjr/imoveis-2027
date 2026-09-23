# Contexto da busca

Documento de handoff: o que não dá pra deduzir lendo o código.
Atualizado em 2026-09-23.

## O que estamos procurando

Apartamento para compra em São Paulo, zona oeste. Perfil que emergiu da lista:

- **Bairros:** Vila Leopoldina, Alto da Lapa, Vila Romana, Perdizes, Vila Ipojuca,
  Pompeia, Vila Madalena e Pinheiros (os dois últimos confirmados em 22/09/2026:
  entram na varredura dos portais como os demais)
- **Faixa:** R$ 1,55 mi a R$ 2,4 mi (o teto subiu de 2,2 para 2,3 em 29/08/2026 e
  para 2,4 em 22/09/2026; nada que já estava na página foi descartado pela mudança)
- **Tamanho:** a partir de 115 m², 3+ quartos (o mínimo de área subiu de 110 para
  115 m² em 2026-09-14). **Sem teto de área** (22/09/2026): maior que 200 m² dentro
  do preço também serve
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
  Rua Cayowaá. **Em apartamento vazio, olhe o piso, não a parede.** Parede branca
  recém-pintada e caixilho novo não querem dizer reformado: em 21/09 passaram
  Campevas e Rodrigo Lobato, e em 23/09 o VivaReal 2913814823 (Pinheiros, 127 m²,
  R$ 2,10 mi) — ele reclamou das três vezes. **Regra dura: apartamento vazio não vai para ele.** Eu erro a leitura do piso mesmo
  em foto grande — contrapiso claro e queimado parece porcelanato, e a varanda
  quase sempre já tem revestimento e confunde ainda mais. Foram quatro em três
  dias: Campevas e Rodrigo Lobato (21/09), VivaReal 2913814823 (Pinheiros), Unicco
  PDI17860 e PDI18218 (23/09) — nos dois últimos eu tinha até escrito "piso claro
  já instalado". Então: **se não houver móveis nas fotos, só mande se o texto do
  anúncio disser explicitamente que está pronto/reformado, e diga a ele que o
  imóvel está vazio e que o piso não foi confirmado.** Na dúvida, não mande.
  Imóvel habitado continua valendo a triagem normal por foto.
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
apareceram três, de R$ 1,67 mi a R$ 2,5 mi). **O Bairro Siciliano não elimina sozinho** (ele corrigiu em 23/09/2026: "tinhamos
combinado q vc ia me passar pra verificar"): mostre o imóvel com a localização
explícita e deixe a decisão com ele — foi assim que o La Dolce Vita (Rua Camilo,
556) entrou na lista em 22/09. O mesmo vale para o **Vila Nova Leopoldina** (as
ruas Nagel 12 e 33 já foram descartadas uma a uma, mas o condomínio não está
banido). A **Rua Lauriano Fernandes Júnior** e a **Rua Belchior de Azevedo**
(Podium) continuam sendo corte automático, junto com qualquer MaxHaus — e só eles.
**Bairro vizinho também não elimina** (ele corrigiu de novo em 23/09/2026, sobre
Vila Anastácio, Boaçava e Vila Hamburguesa): mande com a localização explícita e
deixe ele decidir. A Vila Anastácio tinha sido recusada em 01/09 num imóvel
específico, e eu transformei isso em regra de bairro por conta própria. A **Rua Coriolano**
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
- **Dimorah** (dimorah.com.br/imoveis/compra-ou-aluguel) — imobiliária pequena,
  9 anúncios, códigos `DMH`, parceira da Pilar: as fotos vêm do mesmo S3 e quase
  todos os imóveis também estão na Pilar. Responde a `curl`. A ficha traz
  condomínio e IPTU mensal, que a Pilar nem sempre mostra.

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

## Mapa (desde 2026-09-22)

O botão "Mapa" mostra um pin por prédio, com os filtros ativos. Não usa a API do
Google, que exigiria chave exposta no repo público: os tiles vêm do
OpenStreetMap (a CARTO passou a exigir chave) e são posicionados em código
próprio, sem biblioteca. Cada pin tem link para o Google Maps.

**Toda linha nova precisa de `lat`/`lon`** (5 casas, logo depois de `vgs`). Fontes,
da melhor para a pior:
1. QuintoAndar: o HTML do anúncio traz `"lat"`/`"lng"` exatos.
2. Endereço com número: Nominatim `search`. Confira se voltou `house_number`;
   sem ele o ponto é só a rua, e a linha leva `"aprox": true`.
3. Pilar: a célula `h3Cluster` (~150 m), sempre com `"aprox": true`.
Linhas com `aprox` mostram pin tracejado, e o "ver mapa" do card abre as
coordenadas em vez do endereço. Sem nenhuma fonte, a linha fica sem pin e é
listada abaixo do mapa como "sem localização".

**Busca de 2 quartos (22/09/2026).** Ele pediu uma rodada só de 2 quartos, com as
demais regras valendo e a régua das fotos bem mais alta: "só algo realmente muito
bom". Dos 38 anúncios na faixa, sobraram três. Ele recusou o melhor deles (Rua
Chafalote, 70) por preço. Os outros dois: o Ybyrá (Pilar FIKA5785, Rua Fidalga,
2020, 122 m², 1 vaga, R$ 2,2 mi, cond R$ 1.300) e um de 125 m² na Vila Ipojuca
(Pilar ZI280050 / Maramores AP2380, R$ 2,2–2,3 mi) cuja célula cai na Rua
Francisco Alves, no Bairro Siciliano. **2 quartos não virou regra**: foi uma
consulta pontual, e a busca padrão continua em 3+.

## Navegador: como varrer e como ver foto

O que custou tempo em 23/09/2026 e vale saber antes:

- **A Pilar só entrega 12 anúncios por `curl`.** É o furo que deixou passar o Jazz
  Perdizes. O detalhe está na seção da rotina, mas em uma linha: varra pelo
  navegador clicando "Ver mais" em laço, e não por `curl`. O `curl` continua ótimo
  para a **página de um anúncio** (`/imovel/<CÓDIGO>/x` devolve o `__NUXT_DATA__`
  inteiro, e 410 quer dizer removido).
- **O painel do navegador precisa estar visível.** Com ele oculto, `screenshot`
  falha com "the Browser pane is not displayed" e `requestAnimationFrame` não roda —
  ou seja, nada de triagem de foto. Peça para ele abrir a aba Browser; `navigate`
  para `localhost` pode ser recusado nesse estado, e aí `preview_start` com a URL
  resolve.
- **Folha de contato local.** Para triar em lote: gere um HTML com as miniaturas,
  sirva com `python3 -m http.server <porta>` dentro do diretório do arquivo e abra
  no painel. Sempre `referrerpolicy="no-referrer"` nas imagens — Pilar, VivaReal e
  Maramores bloqueiam por referer. **Miniatura serve para descartar, não para
  aprovar:** antes de citar um imóvel vazio, abra 2 fotos em `w:1400`.
- **VivaReal bloqueia `fetch` em série.** Umas 50 requisições e vem o desafio do
  Cloudflare ("Just a moment..."), que derruba também os `fetch` seguintes. O que
  funciona: `navigate` para a busca do bairro (o desafio passa sozinho), rolar a
  página e colher os cards do DOM — cada card traz 5 fotos, suficiente para a
  primeira peneira. Acumule entre navegações no `sessionStorage`, que a variável
  global morre a cada página.
- **Maramores e imovelweb** respondem 403 ao `curl` de anúncio; use o navegador.

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
- **Pilar** — `/venda/imoveis/<bairro>-sao-paulo-sp-brasil/apartamento?minAskingPrice=&maxAskingPrice=&regions=<Nome>`.
  **Não varra por `curl`: ele só devolve os 12 primeiros cards, sempre os mesmos**
  (`?page=`, `?pagina=`, `?offset=` são ignorados no HTML do servidor; a paginação
  roda no cliente). Perdizes tem **959 anúncios** e eu estava vendo 12 — ~1%, o que
  deixou passar o Jazz Perdizes (DMH002), que estava na Pilar o tempo todo e só
  apareceu quando ele mandou o site da Dimorah em 23/09/2026. **Varra pelo
  navegador:** abra a busca do bairro e clique no botão "Ver mais" em laço
  (`[...document.querySelectorAll('button,a')].find(e=>e.textContent.trim()==='Ver mais').click()`,
  ~1,3 s entre cliques; cada clique traz mais 12 e atualiza `?page=N` na URL), depois
  colha `a[href*="/imovel/"]`. Em 8 cliques foram 108 cards.
  **Cuidado com o limite de taxa:** depois de ~900 imagens em poucos minutos, o
  `imagens.pilarhomes.com.br` passa a responder **HTTP 429** e as fotos somem da
  folha de contato (a página do anúncio continua abrindo). Libera aos poucos, em
  dezenas de minutos. Varra em lotes e trie as fotos por partes. A amostra gira: em 2026-09-14 nenhum dos 12 era novo em relação a
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

**Como remontar a lista de "já vistos" numa sessão nova.** Não existe arquivo
versionado com isso: o `vistos.json` que eu uso vive no diretório temporário da
sessão e morre com ela. Reconstrua a partir de duas fontes, as duas no repo:
o `index.html` (todos os códigos que aparecem em `link`, `link2` e `foto`, ativos
e descartados) e a lista de recusados logo abaixo. Na prática:
`grep -oE 'imovel/[A-Z0-9]+|imovel/[0-9]+|id-[0-9]+' index.html | sort -u`.
Qualquer coisa fora dessas duas listas é novidade de verdade.

Recusados sem virar linha na página (cruze com eles também):
- **PDI18218** (Caminhos da Lapa, Rua Fortunato Ferraz, 127 m², 3 suítes,
  R$ 1,80 mi): **contrapiso**, recusado em 23/09. Eu tinha mandado como "porcelanato
  claro já instalado" depois de ver em foto grande — o erro que originou a regra
  dura acima.
- **VB26467** (Edifício Maresias, Rua Brentano, Vila Hamburguesa, 145 m², 1 suíte,
  R$ 2,10 mi): recusado em 23/09 — "pelas fotos está terrível, bem ultrapassado".
  Eu tinha mandado com ressalva, olhando só a miniatura; a regra é abrir as fotos
  antes de mandar, mesmo quando o imóvel vai com ressalva.
- **Recusados em 23/09/2026, na segunda leva** (passaram nas fotos, mas ele não
  quis nenhum): Maramores CO0250 (cobertura Vila Leopoldina, 140 m², R$ 2,35 mi,
  mensal R$ 1.600) e CO0261 (cobertura Perdizes, 186 m², 1 vaga, R$ 1,69 mi);
  VivaReal 2913810042 (Rua Pinto Gonçalves, 85, Perdizes, 140 m², R$ 2,20 mi),
  2913720839 (Pompeia, 120 m², R$ 1,79 mi), 2913814040 (Vila Madalena, 117 m²,
  R$ 1,93 mi) e 2913713658 (Pompeia, 146 m², R$ 1,89 mi).
- **VivaReal 2913814823** (Pinheiros, 127 m², R$ 2,10 mi): eu mandei como
  reformado e estava **no contrapiso**; ele reclamou. Ver a regra do piso na
  seção de acabamento.
- **Recusados em 23/09/2026, só pelos números e pelo anúncio** (ele não quis
  nenhum): Pilar ARCO1204 (Maison Montparnasse, Alto da Lapa, 134 m², R$ 1,75 mi),
  ARCO331 (Ed. Maia, Vila Madalena, 117 m², R$ 1,93 mi), ZI289384 (Perdizes,
  123 m², R$ 1,96 mi) e PNS012 (Solimões, Pompeia, 1993, 180 m², R$ 2,30 mi).
- **Rua Chafalote, 70** (Vila Ipojuca, 131 m², 2 suítes, 3 vagas, R$ 2,35 mi,
  cond R$ 1.800; QuintoAndar 894895292 e três anúncios no VivaReal): recusado em
  22/09 por preço — "não acho que vale 2.400". Apareceu numa busca à parte de
  2 quartos (ver abaixo). No mesmo prédio há outra unidade de 131 m² por
  R$ 1,8 mi (QA 895441660) e a Pilar RB4275, no contrapiso.
- **ZI277090** (Pilar, Vila Leopoldina, 115 m², 1 suíte, 2 vagas, R$ 1,90 mi,
  cond R$ 2.000): a célula de geo cai na Rua Lauriano Fernandes Júnior, que está
  excluída. Recusado em 22/09. O H2U220 tem a mesma assinatura e pode ser ele.

**Para ele ver as fotos, mande o link do anúncio, não uma galeria montada.** Pedido
dele em 23/09/2026, depois de eu montar páginas locais com todas as fotos do
Mercedes, da Chafalote e da Faustolo. A montagem local continua servindo para a
*minha* triagem quando o painel do navegador está visível.

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
  `nota:`, nunca remova o `fav:`. Até 22/09 a página ainda apagava a estrela ao
  descartar pelo celular (código de 30/08); corrigido.
- **Descartado após visita.** Desde 22/09, marcar "visitado" grava
  `visitou:<id>` com a data. A chave sobrevive a um descarte posterior e o card
  mostra "visitado em dd/mm". Visitas anteriores ao recurso: só a Ponta Porã
  (`true`, sem data).
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

## Estado em 2026-09-23

**56 linhas: 21 ativos e 35 descartados.** 6 favoritos, dos quais 2 ativos
(Presidente Antônio Cândido e Tonelero 239) e 4 já descartados — a estrela fica
de propósito. 10 ativos estão como `revisado`; o resto segue em `a-visitar`.

Ativos, do mais caro ao mais barato: Carlos Weber 663 (R$ 2,77 mi), Mofarrej 706
(2,40), Dr. José Elias 227 (2,40 / 2,33 / 2,10 — três unidades do Pátio das Artes),
Barão do Bananal CVIA1774 (2,39), Barão do Bananal 305 (2,30), Rua Camilo 556
(2,30), Mofarrej 706 (2,20), Rua Roma (2,19), Itapicuru 84 (2,19), São Geraldo 38
(2,10), Presidente Antônio Cândido ⭐ (2,05), AXS827 (2,00), Bartira 193 (2,00),
Carlos Weber 87 (1,98), Tonelero 239 ⭐ (1,95), Passo da Pátria 1407 (1,87),
Coriolano 1642 (1,85), Carlos Weber 535 (1,80) e Croata 169 (1,75).

**Uma visita registrada:** Ponta Porã 710, descartada depois dela ("apartamento
ótimo, mas o condomínio é muito antigo").

### Em aberto (23/09/2026)

- **45 candidatos da Pilar sem triagem de foto.** Saíram da varredura profunda de
  23/09 (1.194 anúncios coletados, 160 inéditos, 71 dentro de custo e ano). O CDN
  de imagens passou a responder **HTTP 429** depois de ~900 fotos e ainda não
  liberou; espere e retome. A lista desses 45 não está versionada: refazer a
  varredura é mais rápido do que tentar recuperá-la.
- **Rua Faustolo, 766** (VivaReal 2913704422, 118 m², 3 suítes, 3 vagas,
  R$ 2,0 mi): ele quis ver antes de eu descartar por causa do Bairro Siciliano.
  Sem resposta ainda.
- **Ano do Tower Hills** (Rua Croata, 169): nenhuma fonte publica. Ele vai
  perguntar à corretora (Carla).
- **Condomínio do ARCO940** (Vitá, R$ 2,05 mi): o cadastro da Pilar diz R$ 200,
  provável erro. Confirmar antes de adicionar.

## Estado inicial (2026-08-29, histórico)

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
