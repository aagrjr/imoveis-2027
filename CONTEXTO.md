# Contexto da busca

Documento de handoff: o que não dá pra deduzir lendo o código.
Atualizado em 2026-09-29.

## O que estamos procurando

Apartamento para compra em São Paulo, zona oeste. Perfil que emergiu da lista:

- **Bairros:** Vila Leopoldina, Alto da Lapa, Vila Romana, Perdizes, Vila Ipojuca,
  Pompeia e Vila Madalena (Vila Madalena confirmada em 22/09/2026). **Pinheiros saiu
  em 29/09/2026** ("vamos remover pinheiros dos possíveis bairros"): não varrer nem
  mostrar anúncios novos de lá
- **Faixa para novas buscas:** R$ 1,55 mi a R$ 2,3 mi (o teto subiu de 2,2 para 2,3
  em 29/08/2026, foi a 2,4 em 22/09/2026 e voltou a 2,3 em 29/09/2026).
  **Não remover nem descartar imóveis já presentes na página por excederem R$ 2,3 mi.**
- **Tamanho:** a partir de **120 m²**, 3+ quartos (o mínimo de área subiu de 110 para
  115 m² em 2026-09-14 e para 120 m² em 2026-10-08; imóveis já na página abaixo disso ficam). **Sem teto de área** (22/09/2026): maior que 200 m² dentro
  do preço também serve. **2 quartos também valem se a área for de 120 m² ou mais**
  (26/09/2026: "se os de dois quartos estiverem em tamanho apropriado pode mostrar");
  no QuintoAndar isso é o caminho `/2-quartos/` (que já inclui 3+).
- **Sem coberturas nem duplex (26/09/2026):** "vamos adicionar uma regra para ignorar
  coberturas/duplex". Corte na busca: na Pilar, tire `propertyTypes` (fica só `/apartamento`); no
  QuintoAndar e no VivaReal, ignore anúncios com "cobertura" ou "duplex" no título, na URL ou na
  descrição. Vale para as próximas buscas; o West Side (duplex) segue na página até ele decidir.
- **Vagas:** 2–3 é o normal, mas **1 vaga não elimina** se o apartamento for bom
  (definido em 2026-09-20). Antes disso eu cortava 1 vaga na triagem, sem abrir
  as fotos — vários imóveis foram descartados assim e precisaram ser resgatados.
  No VivaReal isso importa na URL: `vagas=2` no filtro esconde os de 1 vaga
- **Custo mensal** (condomínio + IPTU) é critério de peso — é a ordenação padrão da página
  mas **não tem teto** (decidido em 25/09/2026: "eu avalio pelas fotos"). Até 25/09 os
  scripts cortavam mensal acima de R$ 3.200 sem ele ter pedido — isso eliminou 141 de
  249 anúncios da Pilar em 25/09 e boa parte do QuintoAndar em 24/09, e teria cortado
  imóveis que ele aprovou (Presidente Antônio Cândido R$ 4.046, Rua Camilo R$ 4.600).
  Informe o mensal em toda sugestão, mas não filtre por ele. **Reconfirmado em 08/10/2026:**
  as rodadas de 03 a 08/10 cortaram "cond. acima de R$ 3 mil" por engano; o teto é só
  do preço do imóvel, nunca do condomínio/IPTU. Os outros parâmetros
  (faixa de preço, área, quartos, bairros, ano, acabamento) continuam valendo

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

  **Idade do prédio não elimina (26/09/2026):** "não desconsiderar nada pela idade do
  prédio, me deixe olhar se forem bons". Se o apartamento é bom nas fotos, mostre com o
  ano em destaque e deixe a decisão com ele. O ano continua obrigatório antes de mostrar.

  **Ano vazio não é ano aceitável.** Em 25/09 o filtro de ano deixou passar tudo que vinha
sem `launchDate`, e mandei o NRE1460 (Edifício Paula, 1974) sem saber o ano; ele pediu
para adicionar antes de eu descobrir. Levante o ano de todo candidato **antes** de
mostrar, sobretudo em Perdizes e Pinheiros, onde o estoque dos anos 70 é grande.

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
mais Pompeia e Vila Madalena (Pinheiros fora desde 29/09/2026). **Vila Anastácio está fora** (corte automático desde 09/10/2026, pedido
dele: "vamos remover vila anastacio da busca"; ver os vizinhos abaixo).

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
banido; desde 27/09 a Nagel inteira está fora, ver abaixo). A **Rua Lauriano Fernandes Júnior** e a **Rua Belchior de Azevedo**
(Podium) continuam sendo corte automático, junto com qualquer MaxHaus e as exclusões abaixo.
**Raimundo Pereira de Magalhães fora, 26/09/2026:** ele gostou do apartamento do
Quintas da Lapa ("está ótimo"), mas não quer essa via. Não sugerir outras unidades
nesse endereço; a recusa foi pela localização, não pelo acabamento do apartamento.
**Rua Fortunato Ferraz (Caminhos da Lapa: Jerivás e vizinhos) fora, 26/09/2026:** ele
descartou dois Jerivás com "Fortunato Ferraz não vamos" e "é de difícil acesso". Não trazer
mais nada da rua. **Nada do outro lado da ponte do Jaguaré** (Cidade São Francisco etc.):
descartou o Boulevard São Francisco com "não vamos cruzar a ponte do Jaguaré".
**Garden fora, 29/09/2026:** "Garden não queremos." Mesmo tratamento de cobertura e duplex: corte automático.
**Rua Nagel e Avenida Mofarrej fora, 27/09/2026:** "a partir de agora não quero mais nada novo na
Nagel ou na Mofarrej". Corte automático para anúncios novos nessas duas ruas (inclui o Vila Nova
Leopoldina, na Nagel). Os dois Le Havre (Mofarrej, 706) que estavam na página foram descartados
pela localização no mesmo dia.
**Rua Matias Roxo fora, 28/09/2026:** não sugerir novos apartamentos nessa rua, incluindo o
Terraças Alto da Lapa.
**Rua Itapicuru, 84 (Perdizes) descartado em 25/09/2026: "muito longe da região de
preferência".** Fica no leste de Perdizes (lon −46,665), perto do Pacaembu. Leitura
minha, não confirmada por ele: o lado de Perdizes que interessa é o que encosta na
Pompeia e na Vila Romana; no extremo leste do bairro, mostre com a localização
explícita e pergunte. **Barra Funda e Água Branca estão fora das próximas buscas** (decidido em 25/09/2026).
Eu tinha mandado Pateo Barra e Casa das Caldeiras esticando a regra do vizinho; ele vai
olhar os que já foram mostrados, mas não quer mais nada de lá. Os vizinhos que valem
são só **Boaçava e Vila Hamburguesa** (confirmado por ele em 25/09; a Vila Anastácio saiu em 09/10/2026),
sempre com a localização explícita. **Bairro vizinho também não elimina** (ele corrigiu de novo em 23/09/2026, sobre
Vila Anastácio, Boaçava e Vila Hamburguesa): mande com a localização explícita e
deixe ele decidir. A Vila Anastácio tinha sido recusada em 01/09 num imóvel
específico, e eu transformei isso em regra de bairro por conta própria; **em 09/10/2026 ele
mesmo a tirou da busca**, então agora é corte automático (inclui a Rua dos Coroados/Vanguarda). A **Rua Coriolano**
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
  **Varredura completa do QuintoAndar (24/09/2026).** O caminho
  `/comprar/imovel/<bairro>-sao-paulo-sp-brasil/apartamento/3-quartos/novos-ou-reformados`
  filtra 3+ quartos pela URL, e a lista **não é virtualizada nessa rota: o botão "Ver
  mais" (texto exato) carrega +12 por clique** até acabar (~11 cliques; Perdizes foi a
  29). Colha `a[href*="/imovel/"]` subindo até o ancestral com "R$" e filtre preço,
  m² e "Condo. + IPTU" no próprio navegador (o site bloqueia `fetch` para localhost e
  a ordenação "Mais recentes" não vira URL). As imagens dos cards só carregam quando
  aparecem na tela, então as fotos vêm da página de detalhe por `curl`:
  `__NEXT_DATA__` → `props.pageProps.initialState.house.houseInfo` traz `salePrice`,
  `area`, `suites`, `parkingSpaces`, `condoPrice`, `iptu` (mensal), `condominium.name`,
  `constructionYear` (quase sempre vazio), `rangeFloor`, `lastPublishedDate` e
  `photos` (servir por `/img/med/<nome>`). Até 23/09 a gente só via os ~12 primeiros
  por bairro: a primeira varredura completa achou 124 inéditos na faixa.
- **VivaReal, fotos:** na página do anúncio todas as imagens têm o mesmo nome de
  arquivo; o que distingue é o hash (`/img/vr-listing/<hash>/...`). Deduplique pelo hash.
- **Pilar, rotina diária (desde 25/09/2026, dica dele): uma chamada só, ordenada por data.**
  `curl` em
  `https://www.pilarhomes.com.br/venda/imoveis/vila-leopoldina-sao-paulo-sp-brasil/apartamento?sortBy=publication_date&orderBy=desc&minAskingPrice=1550000&maxAskingPrice=2300000&minArea=120&parkingSpots=1&regions=Vila+Leopoldina%2CVila+Romana%2CAlto+da+Lapa%2CVila+Ipojuca%2CPerdizes%2CPomp%C3%A9ia%2CVila+Madalena&propertyTypes=casa-de-condominio&cities=S%C3%A3o+Paulo&states=SP`
  devolve do servidor os 12 anúncios mais recentes de todos os bairros, já filtrados
  (preço, área, vaga; `propertyTypes` soma casa de condomínio ao; cobertura e duplex saíram em 26/09
  `/apartamento` do caminho). `page=` continua ignorado: se os 12 vierem todos
  inéditos, rode o mesmo link por bairro (`regions=<um só>`) para ver mais 12 de cada.
  A varredura completa com "Ver mais" fica só para quando houver atraso. Em 25/09 ela
  foi feita uma última vez: 530 na faixa, 280 inéditos (Perdizes e Pinheiros nunca
  tinham sido cobertos inteiros), 80 passaram nos números e 6 nas fotos.
- **Ano do prédio pelo QuintoAndar:** a página do condomínio
  (`/condominio/<condominium.slug>-<condominium.hashId>`, campos do `houseInfo`) traz
  `"constructionYear"` quando o QuintoAndar tem o dado. Nem sempre tem: sem ele, busque
  "<nome>, <rua> <número> ano" (Lopes/Loft/Attria).
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

- **Maramores (na rotina diária desde 05/10/2026, pedido dele)** — pelo browser (403 ao curl), na origem `maramores.com.br`: `fetch('/imoveis?page=N')` de 1 a ~5 (24 cards por página, mais recentes primeiro) e `DOMParser` nos `a[href*="/imovel/"]`; o texto do card traz código, bairro, preço, m² e quartos. Novo = código acima do último visto (**AP2560 em 05/10**). A ficha (`/imovel/CODE`) traz condomínio, IPTU e às vezes o comentário da corretora (idade do prédio). Endereço nunca vem e o mapa é deslocado (~1 km); ache o prédio por preço + condomínio + IPTU no VivaReal/Pilar e confirme pela foto.
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
  `https://www.masferimoveis.com.br/imoveis/a-venda/apartamento+cobertura?quartos=3+&vagas=1+&area=120+&preco-de-venda=0~2300000`,
  via `curl`, mais `&pagina=2`. Os cards (`/imovel/<slug>/<CÓDIGO>-MA0U`) trazem
  bairro, m², quartos, vagas e preço; o detalhe traz condomínio e IPTU. Ignore
  "Rua Teodoro Sampaio" no texto: é o endereço da imobiliária, não do imóvel. A
  página de detalhe mistura fotos de outros anúncios (130+ URLs `img.kenlo.io`),
  e as primeiras ~10 são as do imóvel. A busca também traz Vila Madalena e Alto de
  Pinheiros, que ficam de fora.
- **Leopoldina House** (incluída em 28/09/2026 a pedido dele) — usar esta busca com
  os parâmetros que ele enviou:
  `https://leopoldinahouse.com.br/busca?finalidade=Venda&tipo=Apartamento&bairro=Vila+Leopoldina%2CAlto+da+Lapa%2CLapa%2CPinheiros%2CPomp%C3%A9ia%2CSumarezinho%2CVila+Ipojuca%2CVila+Romana%2CVila+Pomp%C3%A9ia%2CVila+Madalena&areaTotalMin=120.00&max=2300000.00&dormitorios=3&order=maior-preco`.
  Aplique também as exclusões de ruas e tipos acima; a URL, sozinha, não as filtra.

**Mesmo prédio de um imóvel da lista = comparar as fotos com a linha, sempre.** Em
25/09 mandei o VivaReal 2914129567 como "terceira unidade do Riservato" porque dizia
143 m² e a linha diz 147 m²; era a mesma unidade, quarto anúncio dela. Metragem,
imobiliária e código diferentes não provam unidade diferente: o mesmo apartamento já
apareceu com 143 e 147 m², R$ 2,05 e 2,13 mi. Só as fotos decidem.

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
- **Revisão dos cortados só por mensal (25/09/2026), triados e não mostrados:** Pilar ZI294560, SEP21006, AEI1117, ZI291710, ZI286255, ZI276187, ZI293859, AXS1237, SOHA391, ZI293917, ZI294314, ZI274336, ZI94933, ZI274211, AEI3595, ZI276239, ZI292901, ZI292611, CVIA709, LEF4922, CBH338, PDI18055, CAA523, FH581, ZI240685, ZI295626, AXS1391, NRE2627, ZI166767, ZI121789, LXH5061, ZI294027, ZI137619, ZI293160, LAP3539, ZI290206, SGI575, ZI139505, ZI290456, ZI276533, ZI293790, ZI112162, PLANTA1752, AEI4587, ZI294938, ZI284291, ZI279330, ZI288913, ZI168478, LXH5727, AN3214, SEP21045, ZI283935, ZI292082, CVIA1792, ZI289584, ZI163363, ZI272067, ZI286335, ZAC29108, LV692, ZI289485, ZI47875, CBH313, AX284, HS27094, ZI291878, PNS020, ZI289413, ZI125810, AXS1479, ZI295640, CA18191, ZI123682, LXH2422, ZI290844, ZI292203, ZI282063, ZI164169, LEF36642, ZI162575, ZI281973, ZI293969, ZI267095, ZI289122, CVIA610, ZI168857, ZI283165, ZI164375, ECLAT540, ZI81597, ZI279575, KP1055, AEI4253, ZI123674, CVIA1933, HS28626, CCI797, ZI277965, ZI273839; QuintoAndar 893109534, 893215301, 893223360, 893226093, 893262513, 893270157, 893294976, 893334457, 893457286, 893551541, 893554495, 893658492, 893940705, 893950545, 893972886, 894380802, 894415560, 894486086, 894538765, 894539798, 894617825, 894684836, 894746517, 894769300, 894790243, 894887827, 894896930, 894941491, 894982219, 895001536, 895004328, 895012209, 895014334, 895027290, 895050014, 895055487, 895071524, 895071774, 895077989, 895117876, 895120934, 895173118, 895174513, 895192063, 895199178, 895255480, 895262684, 895265505, 895271415, 895289757, 895304182, 895312455, 895320555, 895323606, 895325439, 895332789, 895344167, 895365764, 895375199, 895398168, 895411478, 895412790, 895437862, 895448518, 895464003, 895484422, 895492853, 895505566, 895514678, 895516596, 895540827, 895542989, 895557683, 895561917, 895562431, 895562814, 895563640, 895573386, 895573784, 895600744, 895606191, 895611085, 895618559, 895621841, 895634014, 895659214, 895663465, 895663553, 895666973, 895674482, 895679263, 895683597, 895683941, 895697424, 895702983, 895705638, 895723183, 895731445, 895738361, 895743887; VivaReal 2913867623, 2913935319, 2913938334, 2913941747, 2913941748, 2914051417, 2914057371, 2914058416, 2914059033, 2914064508, 2914105639, 2914156567, 2914171854, 2914279424, 2914280666, 2914281009, 2914281042, 2914283187.
- **Boulevard São Francisco:** QuintoAndar 893906329 = 895042553, mesma cobertura (confirmado por ele e pelas fotos em 25/09); entrou na página em 25/09 (Rua Otávio de Morais, 156, 2009, Lopes/Loft).
- **Sondagem Jaguaré / Parque Continental / Butantã (25/09/2026)**, a pedido dele, sem
  entrar na busca regular. Parque Continental não tem nada na faixa. Recusados: QuintoAndar
  895678002 (Rua Inácio Manuel Álvares, Butantã, 171 m², R$ 2,0 mi): "muito longe da
  região"; 895443862 (Grand Metropolitan Butantã, Rua Sapetuba, 430, 120 m², R$ 2,40 mi):
  "o metro quadrado não faz nenhum sentido" (R$ 20 mil/m², contra a mediana de ~R$ 15 mil
  da página). Mostrados sem resposta: Boulevard São Francisco (Rua Otávio de Morais, 156,
  Cidade São Francisco, 2009), coberturas de 233–266 m² a R$ 2,0–2,2 mi (QuintoAndar
  893906329, 895042553, 894354260). Ele recusou esse Grand Metropolitan pelo R$/m²; **isso não
  virou regra de corte** (26/09/2026: "quem mandou cortar com esse argumento?"). Mostre com o
  R$/m² ao lado e deixe ele julgar.
- **Piazza Navona, Rua Belmonte, 360** (Vila Leopoldina, 1997, 20 unidades de 158 m²,
  mensal ~R$ 3.900): ele trouxe o Flow FL1766122 (3 suítes, R$ 1,55 mi) em 25/09 e
  mandou deixar de fora. Outras unidades do prédio, também fora: VivaReal 2757932617
  (R$ 1,495 mi) e QuintoAndar 893338796 = VivaReal 2913287934 (R$ 1,6 mi).
- **Ignorados em 25/09/2026** (mostrados em 24/09 sem resposta; ele mandou deixar de
  lado): QuintoAndar 895287289 (Atelier Aquarela, Rua Faustolo, 1450, 3 vagas,
  R$ 2,15 mi) e 895694063 (Reserva Alto da Lapa, Rua Sacadura Cabral, 160, R$ 1,69 mi).
- **Triados em 25/09/2026 e não mostrados** (fotos, ano, localização ou rua excluída):
  Pilar ZI286313, ZI276469, CVIA881, ZI295609, ZI260074, AEI263, LAP3948, ZI155843, ZI285303, ZI288471, LEF29478, ZI150566, ECLAT318, ZI277338, ZI273917, LEF29756, ZI293619, ZI279144, ZI278848, ZI142220, ZI294891, ZI287567, ARCO797, LAP3364, AEI2282, ZI292011, ZI272935, ZI163489, IMI1805, ZI287659, ZI286038, ZI273632, AXS1314, CE145, PNS085, OC906, LEF38509, ARCO1393, NK318005, ZI276046, CVIA1697, CVIA2004, ZI142197, SQP2303, ZI286498, ZI293820, ZI289490, ZI278516, ZI295085, VK178, LEF12295, CBH198, PDI17831, ZI283037, ZI293786, LEF4737, HS27270, IEF062, SGI537, AEI530, CVIA1022, AXS557, ZI98659, ZI295047, ZI166776, AXS1474, ZI169560, ZI290199, ZI263705, ZI288973, ZI284419, SOHA517, ZI294363, ZB253, ZI266217, AEI2282, ZI286255, NRE2673, ZI295763;
  QuintoAndar 893259871, 894497775, 895043780, 895420831, 895440538, 895560151, 895561873, 895566229, 895628461, 895634423, 895663484, 895714221, 895716137, 895723201, 895734560, 895737041;
  VivaReal 2914183734, 2914202816, 2914104054, 2914157734, 2914108851, 2914107341, 2914201053, 2914193399, 2914159734.
- **QuintoAndar triados por foto/ano/localização em 24/09/2026** (não mostrar de novo):
  895740604, 895725309, 895721112, 895701510, 895700558, 895691320, 895688485, 895676880, 895673601, 895672700, 895662777, 895662516, 895654743, 895653541, 895652061, 895648170, 895647629, 895646909, 895646015, 895641184, 895637690, 895637047, 895635892, 895635348, 895635250, 895623787, 895620952, 895619995, 895619070, 895618800, 895577943, 895574028, 895573245, 895567099, 895566198, 895563352, 895563145, 895563079, 895560053, 895554278, 895536301, 895535873, 895516979, 895495727, 895486849, 895476354, 895474752, 895473782, 895468869, 895463410, 895461514, 895460398, 895440699, 895433318, 895433119, 895413129, 895397641, 895391156, 895388045, 895382030, 895376444, 895359107, 895353667, 895340073, 895323470, 895315230, 895274745, 895271221, 895264798, 895264055, 895252216, 895228937, 895171133, 895149919, 895140188, 895135147, 895129214, 895115306, 895094192, 895088584, 895069985, 895058502, 895045087, 895042508, 895038387, 894959062, 894953424, 894928432, 894923286, 894917462, 894898851, 894816391, 894774588, 894762486, 894729340, 894710186, 894667976, 894667299, 894652165, 894640780, 894541186, 894536964, 894475285, 894398969, 894300397, 894253130, 894024640, 893896215, 893787044, 893785651, 893734050, 893726693, 893573782, 893493281, 893370076, 893217549, 893078516.
- **Ignorados em 24/09/2026** (mostrados em 23/09, ele mandou deixar de lado; não
  trazer de volta): Pilar PR7569 (Scena, Rua Filipinas, 327, 122 m², R$ 1,89 mi),
  ARCO1295 e TA148 (Vernissage Pinheiros, Rua Cardeal Arcoverde, 121 m², ~R$ 2,0 mi),
  PLANTA1090 e CLI403 (Sarau Pinheiros, 120 m², R$ 2,15 / 2,05 mi), ZI279874 (Vitá,
  Rua Guaipá, 129 m², 4 quartos, R$ 1,995 mi), ARCO940 (Vitá, R$ 2,05 mi, condomínio
  suspeito de R$ 200), ARCO1173 (Jardim Leopoldina Parque Clube, Av. Mofarrej, 275,
  121 m², R$ 1,75 mi), ECLAT162 (Domna Pompéia, 120 m², R$ 1,78 mi) e a **Rua
  Faustolo, 766** (VivaReal 2913704422; Pilar ZI295168 é provavelmente a mesma).
- **Scena Alto da Lapa, Rua Filipinas, 327** (Vila Ipojuca, 2018): a unidade de
  121 m², 3 suítes, 3 vagas, R$ 2,10 mi aparece com **dois códigos na Pilar,
  AEI2602 e LEF45174**. Mandada em 21/09 e de novo em 23/09; ele reclamou que "sempre
  vem repetido". Descartar pelos dois códigos. O PR7569 (122 m², 2 suítes, R$ 1,89 mi)
  é outra unidade do mesmo prédio.
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
- **Rodada de 02/10/2026:** ativos no ar. Scena VivaReal 2915294444 subiu para R$ 1,84 mi (card atualizado; QuintoAndar ainda 1,755). Entrou a pedido dele o **Scena de R$ 1,855 mi** (`scena-cl121164574`, classificados QuintoAndar 121164574/120538651/121116313, 122 m², 2018) como a visitar.
  - **Pilar:** candidatos CMI346 (Wide Life, Rua Vespasiano, Vila Romana, 118 m², 3 suítes, 3 vagas, R$ 2,0 mi, cond. R$ 2.200, ar) e GR2703 (Rua Guaipá, Vila Leopoldina, 147 m², 3 suítes, R$ 1,9 mi, cond. R$ 2.000, moderno; card diz 1 vaga, texto diz 2). **Depois:** GR2703 é no **Condomínio Grand Mond** (texto do anúncio; geocodifica perto da Rua Guaipá, 371), que ele já tinha cortado em 01/10 (LH3703): cortado. O Wide Life (CMI346) fica na **Rua Faustolo, 1101**, esquina com a Vespasiano, Bairro Siciliano; o QuintoAndar classifica o condomínio como Água Branca. **iUrbe (mandados por ele em 02/10):** CI905 = **CMI346** pelas fotos (mesma mesa branca, pendente e varanda; R$ 2,0 mi, 3 vagas, cond. R$ 2.200, IPTU R$ 917, ar nas 3 suítes e sala, escritório, depósito). CI480 = outra unidade do Wide Life (118 m², 3 suítes, 4 vagas, andar alto, R$ 2,2 mi, cond. R$ 2.200, IPTU R$ 1.000; acabamento padrão de construtora, granito; o iUrbe põe "Faustolo, 656", mas o lazer descrito é o do Wide Life). **Corretor Naldo Souza (iUrbe/Paulo Mauro), 02/10:** CI0458 (Romanée, Rua Coriolano, 134 m², 3 suítes, 3 vagas, reformado, ar em tudo, R$ 2,49 mi, cond. R$ 1.900, IPTU R$ 1.050; acima do teto); CI0030 = **W/L da lista** pelas fotos (mesma cozinha com prateleiras e parede 3D; R$ 2,185 mi; posto em `mais`); Zimóveis 293853 (Vista Pompeia, Rua José Tavares de Miranda, 152 m², 3 suítes, 3 vagas, R$ 2,43 mi, cond. R$ 2.600, IPTU R$ 1.370; acima do teto; outra unidade 292917 a R$ 2,45 mi). Cortados: ZI296097 (Faustolo 133 m², provável Atelier Aquarela QuintoAndar 895287289, posto de lado), SQP2310 (Barão de Ladário, datado; = QuintoAndar 895753196), CMI344 (Chateau d'Avignon, cond. R$ 2.977), MO6520 (cond. R$ 3.600).
  - **Masfer, Leopoldina House, QuintoAndar:** nada novo (895724584 é Alto de Pinheiros; 895762535 Louvre e Versailles, 200 m², clássico).
  - **VivaReal (59 novos, quase todos de uma imobiliária com código "OH…"):** modernos e inéditos: 2915454376 (Rua dos Coroados, 162, Alto da Lapa, 129 m², 1 suíte + escritório, R$ 1,885 mi, cond. R$ 1.100), 2915450508 (Faustolo, 656, Vila Romana, 145 m², 3 suítes, R$ 2,235 mi, cond. R$ 1.645, ar), 2915345763 (Rua Froben, 77, 120 m², R$ 1,97 mi; não é o Living Grand Wish). Voltou: 2915454188 = Neo Milano (Coriolano, 1642, 126 m², R$ 1,85 mi; era o NRE2722 a 1,8 em 28/09, descartado só por sair do ar). 2915453663 = outra unidade do Helbor True (Iperoig, 858, 133 m², R$ 2,19 mi, vazio). Cortados: 2915454383 (Pç. Monsenhor José Maria Monteiro, 4, Vila Ipojuca, 127 m², R$ 1,75 mi; acabamento antigo), 2915454277 (Diana, 863, datado, = REO1185084), 2915453193 (Belchior), 2915392354 (Barão da Passagem, recusado em 30/09).
  - **Refúgios Urbanos (02/10, primeira vez, pedido dele):** WordPress; a busca é um POST em `https://refugiosurbanos.com.br/wp-admin/admin-ajax.php` com `action=filtro_imoveis_novo` e `dados=` (form serializado: `faixa_preco=1550000,2300000&faixa_area=120,450&vagas=1,9&filtro-cidade=sao-paulo&bairros[]=alto-da-lapa&bairros[]=lapa&bairros[]=perdizes&bairros[]=pompeia&bairros[]=sumare&bairros[]=sumarezinho&bairros[]=vila-ipojuca&bairros[]=vila-leopoldina&bairros[]=vila-madalena&bairros[]=vila-romana&paginacao=N`), ~22 por página; curl funciona. Código "RU: nnnn"; condomínio, IPTU e descrição (rua, ano) no HTML do imóvel. 24 resultados, quase todos casas. Apartamentos: RU 10003 (Rua Caetés, Perdizes, 118 m², R$ 1,58 mi, cond. R$ 1.577, **prédio dos anos 70**) e RU 9857 (Rua Harmonia, Vila Madalena, 123 m², R$ 1,7 mi, **cond. R$ 2.800 + fundo R$ 399**, sem ar instalado) cortados; o resto é garden, cobertura, duplex ou 1 quarto (Loft Zarvos RU 10228, 360 Vila Ipojuca RU 9594).
  - **Segunda passada de 02/10 (fim da tarde):** Masfer e Leopoldina House iguais. Pilar: LEF30194/LEF30198 (Perdizes, LEF Properties, 130/115 m², R$ 2,2 mi; prédio recém-entregue, só fotos de área comum, provável contrapiso) e VB27369 (Vila Leopoldina, 180 m², R$ 1,8 mi, cond. R$ 2.783, decoração clássica antiga) cortados. VivaReal: ~80 ids novos (maioria Olimpia House "OH…"); 31 passaram nos números, 8 olhados em detalhe. **Mostrados:** 2915537505 (Pátio das Artes, Dr. José Elias, 227, "147 m² totalmente reformados", 3 qts com 1 virado closet, 3 vagas, R$ 2,235 mi, cond. R$ 2.149; móveis diferentes do 4º e do 5º à primeira vista; **depois, pelas fotos do Pilar ZI296085, é o próprio Pátio 4º** (mesmo sofá capitonê, tapete e vaso), a R$ 2,235 mi no VivaReal; link posto no card) e 2915492672 (Villa Dei Fiori, Desembargador do Vale, 350, 135 m², 3 suítes, varanda gourmet com churrasqueira, R$ 2,12 mi, cond. R$ 1.687; piso de madeira, acabamento mediano). Prováveis repetidos: 2915501688 (REO1130845, Vitá 129 m² R$ 1,97 mi = provável LH5087 on hold), 2915519483 (Scena 121 m², R$ 2,0995 mi, andar alto = provável LH5194 descartado, baixou de 2,13), 2915514116 (= Helbor True 2915462732), 2915523400 (= Neo Milano). Cortados: Cayowaá, 854 (130 m², dependência, hidromassagem, cond. R$ 2.790), Caraíbas, 743 (150 m², 1 suíte), Paraguaçu, 421 (1 vaga, dependência), Ministro Ferreira Alves, 330 (duplex), Lauriano (rua cortada), e os demais datados pelas fotos.
- **Rodada de 03/10/2026:** Masfer, Leopoldina House e Refúgios Urbanos iguais a ontem. Pilar, 3 novos: **CCMG134** (Casa Comigo, Perdizes perto da Rua Turiassu, 129 m², 3 quartos/2 suítes, 2 vagas, R$ 2,2 mi, cond. R$ 2.500, IPTU R$ 1.200; moderno, varanda gourmet; não é o Top Class, que tem 4 quartos e cond. R$ 1.825) mostrado; LEF4802 (Rua Girassol, Vila Madalena, 150 m², R$ 2,3 mi, vazio, acabamento de construtora, sem ar) e LAP4197 (cond. R$ 3.600) cortados. VivaReal: 29 ids novos, quase todos republicações da Olimpia House (Croata, Diana, Caraíbas, Iperoig = Helbor True, Faustolo 656, Monsenhor). **Park View Perdizes (Itapicuru, 801) voltou**: VR 2915597075 (OH56516), mesmo sofá e tapete do card, R$ 2,195 mi; estava em vendidos por ter saído do ar em 20/09. Mostrado também Piracuama, 377 (VR 2915597660, 133 m², 2 suítes + escritório, 3 vagas, R$ 1,77 mi, cond. R$ 2.850, lazer simples, wc de serviço). Cortados pelas fotos: Aimberê 159 m², João Ramalho 150 m² (1 vaga), Cayowaá 133 m², Apinajés 157 m², Aliança Liberal 180 m², Ministro Godói 187 m², Fradique Coutinho 130 m². QuintoAndar varrido depois (03/10, tarde): 709 cards nos 7 bairros pela rota 3-quartos/novos-ou-reformados, 90 na faixa, só 1 inédito: 895404131 (Solar da Bartira, Rua Aimberê, 128 m², R$ 1,895 mi, "compre já alugado", 0–3º andar, painéis de madeira e mármore anos 90; cortado). (Corrigido em 04/10: não há teto na página 12; o botão só demora a reaparecer. Espere ~1,5 s entre cliques e tente de novo quando o botão sumir; em 04/10 Perdizes foi a 26 páginas.) **Checagem dos ativos (03/10):** tudo no ar e com o mesmo preço, exceto: QuintoAndar classificado 114560281 (Key West, on hold) e 130765686 (3º link do Tonelero 239) desativados; o Loft do Key West deu 403 (não conferido). VivaReal 2893148094 do Palazzo está a R$ 2,0 mi (card R$ 2,05 mi; o outro VivaReal, 2888962586, segue a R$ 2,049 mi).
- **Rodada de 04/10/2026:** Masfer, Leopoldina House e Refúgios iguais. Pilar, 2 novos: **PDI18331** (Prateleira dos Imóveis, Perdizes perto da Rua Cayowaá, 576; 150 m², 3 suítes, 3 vagas, R$ 1,98 mi, cond. R$ 1.900, IPTU R$ 1.000; vazio, porcelanato, painel de madeira, varanda gourmet; moderno) mostrado; DMH067 (Pompeia, 135 m², R$ 2,25 mi; sanca, lustre, acabamento mais antigo) cortado. VivaReal: só 5 ids novos (4 com cond. > R$ 3 mil; Ministro Godói 135 m² = republicação). QuintoAndar varrido de novo (1.092 cards, 132 na faixa), 5 inéditos: 895614534 (Braido Tower, Desembargador do Vale, 156 m², 3 quartos sem suíte, 2 vagas, 0–3º andar, R$ 2,2 mi, cond. R$ 2.485; decorado moderno) mostrado; 895007196 (Rua Paris, Sumaré, 121 m², R$ 2,0 mi, painéis de madeira) provavelmente o prédio do VivaReal 2915096889 recusado em 30/09, avisado; 895561492 (Memphis, Patápio Silva, 0–3º andar, R$ 1,79 mi) e Pinheiros (893219421, 895615550) cortados. Pátio das Artes 5º e unidade baixa continuam no ar e **não** foram reativados (pedido dele). **Resposta dele: nenhum dos mostrados entra** (PDI18331 e Braido Tower 895614534 recusados em 04/10; não trazer de volta).
- **Rodada de 05/10/2026:** Masfer, Leopoldina House e Refúgios iguais. Pilar, 2 novos: **AXS1767** (AXS Imóveis, Perdizes perto da Turiassu/Cayowaá; 130 m², 4 quartos/3 suítes, 3 vagas, R$ 1,69 mi, cond. R$ 2.449, IPTU R$ 1.079; planejados, piso de madeira, andar baixo com árvores; bom estado) mostrado; NH037 (Nexo Homes, Alto da Lapa, 130 m², 2 suítes, R$ 2,1 mi, cond. R$ 2.500; vazio, piso protegido/em obra) cortado. VivaReal: 28 ids, quase todos republicações; Cayowaá 130 m² R$ 1,59 mi e Aimberê 149 m² datados. QuintoAndar (978 cards, 124 na faixa): 1 inédito, 894634586 (Jerivás, Fortunato Ferraz) cortado pela rua. Ativos: todos no ar, preços iguais.
  - **Maramores (05/10, varredura completa, 803 anúncios, fora da rotina diária):** na faixa e inéditos só AP2458 (Vila Leopoldina, **114 m²**, 3 suítes, 2 vagas, R$ 1,75 mi, cond. R$ 2.100, IPTU R$ 739; moderno, piso de madeira) mostrado com a ressalva do 1 m²; **= VivaReal 2913978451** (CLS Imóveis, Rua Paulo Franco, 8º andar, R$ 1,75 mi, cond. R$ 2.200, IPTU R$ 740; mesmas fotos: piso espinha de peixe, mesa redonda, pendente preto). Mesmo prédio e planta do **LH5449** (4º andar, R$ 1,79 mi, cond. R$ 1.361, IPTU R$ 739,42; a busca da LH usa área ≥120 e não pegava). Número não confirmado: o imovelweb 3029336382 (114 m², 3 suítes, R$ 1,589 mi, cond. R$ 1.600) diz Paulo Franco 142, mas o QuintoAndar põe no 142 o Double Space (77–101 m²); a planta de 112–117 m² com 3 suítes e 2 vagas é a do Insight (nº 153), que ele descartou em 30/08 (linha `paulo-franco-112`, sem motivo registrado). **Ele confirmou que é o Insight e mandou adicionar (05/10):** linha `rua-paulo-franco-153-114`, Maramores como link e VivaReal como 2º. AP2429 = **Pilar CMI344** (Chateau d'Avignon, mesmo cond. R$ 2.977 e IPTU R$ 1.428), já cortado. Cortados: AP2499 (cond. R$ 4.000), AP2236 (cond. R$ 4.350), AP2344 (cond. R$ 3.479), AP2428 (prédio de ~30 anos), AP2292 (Lapa, 220 m², cond. R$ 3.200). Lista: `maramores.com.br/imoveis?page=N` (24 por página, mais recentes primeiro); o card traz bairro, preço, m² e quartos.
- **Link `#s=` de 06/10 aplicado (estadoVersao 2026-10-06-3):** Insight (`rua-paulo-franco-153-114`) ficou a visitar com nota "Sala parece pequena, suite principal também" e itens (churrasqueira, ar, closet, varanda fechada, máquina de louça, academia, piscina); **Montparnasse SEP21058 → vendido** ("Apartamento recebeu proposta"); Montparnasse AP84850 a visitar, nota "Talvez visitar com a Márcia, prédio preparado para ar condicionado"; itens ajustados em Amalfi (sem varanda fechada), Itaguá (+piscina) e Sonare LH5193 (sem academia e piscina).
- **Rodada de 08/10/2026:** Masfer, LH (38), Refúgios e Maramores iguais. **Pilar:** 1 novo, **AXS1813** (Verana, Rua Guaipá, 451, Vila Leopoldina, 147 m², 3 suítes, 2 vagas, R$ 1,8 mi, cond. R$ 2.000, IPTU R$ 759; porcelanato branco, lustre de cristal, varanda gourmet; mesma planta e condomínio do GR2703, que era o Grand Mond na Guaipá, 371; o Verana é o prédio vizinho, no 451) mostrado. **VivaReal** (ids acima de 2916381645, agora **2916502155**): 43 novos. Cortados: Nagel, Lauriano, cond. acima de R$ 3 mil, Pinheiros/Sumaré/Pacaembu, Via Condoti (Tonelero ×2), Baccarelli (Húngara 154 ×2), LH190 recusado (= 2916469391, Dr. José Elias 144), Aimberê, Caraíbas, Cayowaá 125 (= ZI296576), Rua Madalena 118 (loft duplex), Cayowaá 140 (cobertura duplex), Tucuna 161 (mármore, clássico), Monte Alegre 136 (piso de mármore), Girassol 166 (armários brancos clássicos), Cotoxó 116 (provável Terrarium, recusado), Apiacás 130 (2 quartos, só render de lançamento), Piracuama 140 (Terrazzo, já triado). **Mostrados:** 2916419586 (Rua Fábia, Vila Romana, 153 m², 3 quartos, R$ 2,27 mi, cond. R$ 1.990; porcelanato claro, moderno, vista livre), 2916489495 (Rua Diana, 120 m², 3 quartos, R$ 1,6 mi, cond. R$ 2.100; reformado, marcenaria e piso de madeira), 2916426362 (Rua Cayowaá, 115 m², 3 quartos/1 suíte, R$ 1,89 mi, cond. R$ 1.600; andar alto com vista), 2916425556 (Rua Itapicuru, 136 m², 3 suítes, R$ 2,2 mi, cond. R$ 2.800; vazio, ar, piso de madeira), 2916427539 (Rua Tito, Vila Romana, 116 m², 3 suítes, R$ 1,7 mi, cond. R$ 1.500; reformado, porcelanato, andar alto), 2916425583 (Rua Oscar Caravelas, Sumarezinho/Vila Madalena, 127 m², 3 quartos, R$ 1,69 mi, cond. R$ 2.000; prédio novo com piscina na cobertura). **QuintoAndar** (rota com faixa de preço, 533 cards): 4 fora da lista de ontem, todos conhecidos: Mark (894545710 = CCMG047, descartado), Atelier Galeria (Rua Roma, 383, ×2; recusado), Ilhas Seychelles (São Geraldo, 216 m²). **Ativos:** todos no ar com preço igual.
- **Resposta dele (08/10): não adicionar TA968 (Wingfield) nem LH190.** Não trazer de volta.
- **Rodada de 09/10/2026 (mínimo de 120 m²):** **Ativos (17):** todos no ar com preço igual; VivaReal 2915462732 (Iperoig) a R$ 1,915 mi (QuintoAndar R$ 1,9 mi, igual ao card). **Erro meu:** gerei os ids tirando acentos e chequei 26 "ativos", 9 deles descartados (Capitão Alceu Vieira, José Elias 227 1ª linha, Barão do Bananal ×2, Guaipá, São Geraldo, Camândulas ×2, Apiacás 387); ele percebeu. A página **troca cada letra acentuada por hífen** (`rua-capit-o-alceu-vieira-44-138`), não remove o acento. Informação dos descartados, só para registro: AP2434 e QA 894760488 fora do ar; Pilar NRE2512 a R$ 2,29 mi. Divergências antigas iguais (Palazzo VR R$ 2,0 mi, José Elias 2 VR R$ 2,33 mi, Insight Lucro Certo R$ 1,85 mi, W/L VR R$ 2,15 mi). Classificados QA 114560281 e 130765686 seguem desativados. **Masfer, LH (38), Refúgios e Maramores** (AP2580–2585, nada na faixa) sem novidade. **Pilar:** 4 inéditos, todos cortados: CVIA2071 (San Patrick, 1995, Perdizes leste, datado), GR2735 (**Solimões**, Cotoxó 265: prédio já descartado por ele, "prédio antigo e sem a maioria dos itens"), PNS235 (Manhattan, 2000, Pompeia, 130 m², R$ 1,645 mi; sanca, lustre, papel de parede), ZI296334 (= VR 2916612932; Perdizes 123 m², vazio, porcelanato bege anos 2000). **VivaReal** (ids acima de 2916517259, agora **2916665962**): 27 na faixa. **Mostrados:** 2916660269 (**Westhouse, Rua Aimberê, 570**, 150 m², 3 suítes, 3 vagas, andar alto, R$ 2,221 mi, cond. R$ 2.105, IPTU ~R$ 908; **vazio**, mas o texto diz "impecável, pronto para morar": piso de cumaru, ar inverter em tudo, Bontempo; ano não achado), 2916551530 (Rua Ministro Godói, nº não informado, 167 m², 3 suítes, 3 vagas + depósito, R$ 2,3 mi, cond. R$ 1.578, IPTU ~R$ 1.045; habitado, porcelanato, cozinha nova, varanda gourmet com churrasqueira; ano não achado), 2916552292 (Rua Cajaíba, Pompeia, nº não informado, 124 m², 3 quartos/1 suíte (eram 4), 2 vagas + depósito, R$ 1,699 mi, cond. R$ 1.600; reformado, painéis amadeirados, ar, varanda envidraçada; não é o Arua; ano não achado). Cortados: Tonelero 239 (Via Condoti, só fotos de área comum), Princeton (Raul Pompéia 930, já recusado), Caraíbas 136 (prédio do Caraíbas 533, antigo/recusado), Caraíbas 161 e Caiubi 1363 (lançamento, só render), Capital Federal 210 (duplex), Fradique Coutinho 1051 (= ZI296502), Turiassu 152 (Manacá), Cotoxó 336, Ministro Godói 640, Bartira 1198, Apinajés x Bartira, Paraguaçu 278, Cardoso de Almeida 195, Coriolano 126, Apiacás (Solar das Perdizes), Desembargador do Vale 146, Carlos Weber 160 (vazio, datado), Leopoldina 158 (2916605877, vazio, porcelanato, sem rua; não mostrado pela regra do vazio). **Não conferidos (429/Cloudflare):** 2916535237 (Perdizes, 122 m², R$ 1,893 mi), 2916536841 (Perdizes, 120 m², R$ 2,18 mi), 2916550611 (Lapa/Vila Ipojuca, 146 m², R$ 1,72 mi). **QuintoAndar** (rota `/2-quartos/<faixa>/novos-ou-reformados`, 789 cards; Vila Romana travou na página 17, Perdizes 1,9–2,3 na 14 e foi completada com a faixa 2,1–2,3; Pompeia parou na 29): 232 na faixa e área; inéditos relevantes **mostrados:** 895634995 (**Edifício Daniela, Rua Paraguaçu**, Perdizes, 172 m², 3 suítes, 3 vagas, 12º–15º andar, R$ 2,1 mi, cond. R$ 3.929 + IPTU R$ 1.407; reformado moderno, ripado, trilhos, habitado; ano não achado) e 893968389 (**Vanguarda, Rua dos Coroados, 162, Vila Anastácio** (Lopes põe na Lapa), 2017–2018, 130 m², 3 quartos/1 suíte, 3 vagas, 16º–19º andar, R$ 2,2 mi, cond. R$ 1.000 + IPTU R$ 800; moderno, porcelanato, varanda gourmet com churrasqueira; mesmo prédio do VR 2915454376 mostrado em 02/10 a R$ 1,885 mi, provavelmente outra unidade). **Retirado no mesmo dia: Vila Anastácio saiu da busca (09/10).** Cortados: Alpes, Catuai, Águas Claras, Linked, Alto das Perdizes (anúncios de 2022–2025), Bois de Boulogne (datado), Saint Patrick (vazio, datado), Arua 2 quartos (duplex), Maison Dallas (5 fotos), Lester Young (= MO6520), Duplex Oggi, Maison Harmonie (473 m², térreo), Rua Roma (Atelier Galeria), São Geraldo 216 (Ilhas Seychelles), Itapicuru 135 (= VR 2916273859, recusado), Cândido Espinheira 168 (= LAP4197, recusado); fora dos bairros: Veiga Filho, Norma Pieruccini, Edgar Egídio, José Gomes Falcão, Thomas Edison, Sergipe, Piauí, Angélica, Bernardo da Veiga, Butantã, Marquês de São Vicente.
- **Rodada de 27/10/2026:** Masfer (9) igual; Maramores só AP2628 (Jardim Europa); Refúgios RU 10018 já visto; LH4219 (Villa Nova Leopoldina II, Nagel) cortado. **Pilar:** 5 novos, cortados: CVIA2109 (Villa Borghese, 1996, "para reforma", andar baixo), DMH132 (360 Graus, lofts), GR2806 (= AXS2059, Paulistânia), SQP2566 (Opus D'art Pompéia, 120 m², R$ 1,8 mi; sanca, área de serviço datada); ECLAT734 (Domna) republicado. **VivaReal** (ids acima de 2919333774, agora **2919558546**): 84, 32 inéditos. **Sem fotos do apartamento (só condomínio), não avaliados:** 2919502866 (**Tito 19, Rua Tito, Vila Romana, 2016**, 9º andar, 187 m², 3 suítes, 3 vagas, R$ 1,98 mi, cond. R$ 2.145; lazer moderno) e 2919528694 (**Via Condoti**, Rua Tonelero, 140 m², 3 suítes, R$ 1,88 mi, cond. R$ 1.800; Nortelar; pode ser a unidade visitada em 25/09, que estava a R$ 1,95 mi no Maramores AP2442); também só condomínio: Villa de Monaco (Tucuna, 165 m², 4 vagas, R$ 1,77 mi, cond. R$ 1.100), Gêmeos (Girassol, 170 m², R$ 1,6 mi), Lumieri (Coronel Melo, 2008, 2º andar, 143 m², R$ 1,65 mi). Cortados: **Mota Pais 131 R$ 2,025 mi** (contrapiso; outra unidade, não o favorito Pateo Mondrian), Pascoal Vita 146 e Filipinas 142 (duplex com escada), Paracuê 132 e Good Life Aurélia (render de lançamento), Princeton, Bonaire 1996, Antonieta 1992, João Pedro Cardoso 1972, Maison Remy Martim (Carlos Weber 296, terraço), Alves Guimarães ×3 (lado Sumaré/Oscar Freire), Iperoig 221, Ministro Godói 129, Nanuque 168, Irmãos Karmam 130 (datados/vazios), Turiassu 128 (sanca, perto da PUC), repetidos e ruas cortadas. **QuintoAndar:** 397 na faixa (Perdizes 1,5–1,9 e 2,1–2,3 incompletas, site lento); 1 novo, 895739300 (Anhanguera, Barra Funda), fora.
- **Rodada de 28/10/2026:** Masfer (9) igual; Maramores nada acima de AP2628; Refúgios RU 10274 (Podium, vazio) e LH5615 (= VR 2919689781, Jardim Leopoldina Parque Clube, Av. Mofarrej) cortados. **Pilar:** 3 inéditos, cortados: ZI282070 (Perdizes, 140 m², R$ 1,58 mi; sanca, datado), ZI290267 (Piazza Navona Pompeia, 130 m², 4 quartos, R$ 1,59 mi, cond. R$ 2.456; prédio anos 90, varanda de tijolo, lavabo de granito), ZI297645 (Perdizes, 210 m², 4 suítes, R$ 2,05 mi, cond. R$ 4.098; datado). **VivaReal** (ids acima de 2919558546, agora **2919700105**): 17 novos, quase todos republicados (lote Emcasa de Turiassu/Monte Alegre/Tonelero/João Ramalho, Westhouse, Princeton, W/L Catão 496 = card em espera, Personal Home, Carlos Weber 172 = REO904719, João Ramalho 586, Coelho de Carvalho 120 = REO1175431 recusado em 07/10). Cortados por foto: 2919665879 (Perdizes 136), 2919696343 (Apinajés 140), 2919648645 (Apinajés 225), 2919645871 (Carlos Weber 455, 172 m²), todos datados. **Mostrado:** VR 2919628979 (**Rua Coriolano, 1643, Vila Romana**, provável Neo Milano, 125 m², 4 quartos/2 suítes, 2 vagas, R$ 1,75 mi, cond. R$ 2.000, IPTU R$ 530; reformado, branco, iluminação embutida, ar nos quartos, closet montado num quarto; cozinha diferente da do card `rua-coriolano-1642-126`, logo outra unidade; fica no quarteirão do ZI289918). **QuintoAndar:** 408 na faixa, 0 inéditos (Vila Romana 1,9–2,3 e Perdizes 1,9–2,1 pararam com "Ver mais" ainda visível).
- **Rodada de 29/10/2026:** Refúgios (24), Masfer (9) e Maramores (nada acima de AP2628) iguais. **Pilar:** ARCO1561 (High Village, Vila Madalena, 130 m², R$ 2,29 mi; vazio e datado; = VR 2919882138, Fradique Coutinho), NH039 (360 Graus, cortado), ZI296066 (já visto), ECLAT753 (Helbor True, Iperoig 858, 134 m², R$ 1,9 mi; pelas fotos provável mesma unidade do card em espera `rua-iperoig-858-135`). **LH5645** = Nagel (Villa Nova Leopoldina), cortado. **VivaReal**, agora pelo **Zap** (mesmos ids; o detalhe do VivaReal dá desafio do Cloudflare; no Zap os bairros "Vila" são `vl-leopoldina`, `vl-romana`, `vl-ipojuca`, `vl-madalena`): ids acima de 2919700105, agora **2919885753**; 55 novos. **Mostrado por engano: 2919718472** (ele: "essa da Camândulas com os skates na parede já vimos muitas vezes"; = Riservato 147 m² descartado, quarto com skates na parede e mesma mesa rústica na varanda; Leardi anuncia 143 m², 22º andar, R$ 2,19 mi; eu tinha olhado só as 4 primeiras fotos. Antes de mostrar unidade de prédio com card descartado, comparar todas as fotos; 143 m², 3 suítes, 2 vagas, 22º andar, R$ 2,19 mi, cond. R$ 1.905, IPTU R$ 798; Paulo Roberto Leardi; sala com sanca de LED e piso de madeira escuro, varanda gourmet envidraçada, vista livre; ar só preparado na sala). Republicados: Jorge Americano 134 m² ×2 (= card Montparnasse descartado, mesma foto), Coelho de Carvalho 120 m² (recusado, agora R$ 2,2 mi), Coriolano 124, Monte Alegre 146, Camilo 168, Turiassu 128 ×2 (Manacá), José Elias 456, São Geraldo, Mota Pais, Camburiú, Barão do Bananal, Bartira, Diana 223, Antônio Borba, Cardoso de Almeida 263, Cândido Espinheira. Cortados por foto: Girassol 150, Ministro Godói 136 e 184, Fábia 128, Cardoso de Almeida 156, Apinajés 173, Wanderley 206, Piracuama 136, Carlos Weber 145, Cayowaá 140, João Ramalho 123 (datados); Carlos Weber 125 (vazio); Húngara 122 (contrapiso); Cotoxó 122 ×2 (só decorado). Fora por regra: Nagel ×2, Mofarrej, Bela Aliança ×5, Pinheiros, Sumaré/Sumarezinho, cobertura, duplex. **QuintoAndar** (chave `qq`, 13 faixas incluindo Vila Leopoldina): 413 na faixa, 3 inéditos, todos fora (Vila Buarque, Vila Anastácio, Pinheiros). Vila Romana 1,9–2,3, Pompeia 1,9–2,3 e Perdizes 1,9–2,1 terminaram com "Ver mais".
- **Propostas (26/10):** ele redigiu propostas para o Palazzo (AP 122) e o José Elias (AP 41). Valores, itens pedidos e forma de pagamento ficam em `PROPOSTAS.md`, **fora do git** (`.gitignore`), porque este repositório é público. Nunca copiar valor de proposta, teto ou financiamento para este arquivo nem para a página.
- **Anúncios do José Elias AP 41 (28/10, pedido dele):** Proprietário Direto e Pilar ZI296085 R$ 2,15 mi; VR 2916733437 R$ 2,199 mi; QuintoAndar 895792120, VR 2916814658 (Konex) e VR 2891095026 (YK Private) R$ 2,235 mi; VR 2903536711 e VR 2913081024 R$ 2,33 mi (mesmas fotos, valores e condomínio). VR 2915537505 sumiu da busca da rua. No mesmo prédio, outra unidade: VR 2905584040 (141 m², R$ 1,8 mi, piso cerâmico, datado).
- **Preços dos favoritos disponíveis (26/10, pedido dele): nenhuma mudança.** Palazzo: QuintoAndar 895465004, Masfer AP86050 (cond. R$ 2.298), Pilar ZI295981 e Zimóveis 295981 a R$ 2,05 mi; VR 2888962586 R$ 2,049 mi; VR 2893148094 R$ 2,0 mi. José Elias AP 41: Proprietário Direto e Pilar ZI296085 R$ 2,15 mi; QuintoAndar 895792120 e VR 2915537505 R$ 2,235 mi; VR 2903536711 R$ 2,33 mi. Avenida Mercedes: VR 2919114784 R$ 1,94 mi (QuintoAndar 895491256 segue indisponível).
- **Avenida Mercedes reativada (26/10, pedido dele; estadoVersao 2026-10-26-1):** status `a-visitar`, nota acrescida, link principal agora VR 2919114784 (QuintoAndar 895491256 virou `link2`). Idea segue vendido no site.
- **Avenida Mercedes em espera (27/10, pedido dele; estadoVersao 2026-10-27-1):** status `on-hold`, só isso; nota e links iguais.
- **Pátio das Artes, 28/10 (pedido dele):** ITBI conferido de novo pelo SQL 8010802 (planilhas de 2025 e de 2026 até 30/09): nada além do AP 32 mai/25. AP2388 (5º andar, descartado "não estamos podendo 2400"): Maramores R$ 2,398 mi; Pilar NRE2512 (Narrare) agora R$ 2,29 mi, mesmas fotos; nada no Zap/VivaReal.
- **Pátio das Artes "até 3º andar" (QA 895728005) volta a `a-visitar` (28/10, pedido dele; estadoVersao 2026-10-28-4):** QuintoAndar R$ 2,1 mi; VR 2913540535 fora do ar (404 no Zap); nenhum outro anúncio no Zap, VivaReal ou Pilar. Nota mantida.
- **AP2388 volta a `a-visitar` (28/10, pedido dele; estadoVersao 2026-10-28-3):** link principal agora é a Pilar NRE2512 a R$ 2,29 mi (`valor` atualizado); Maramores R$ 2,398 mi virou `link2`. Nota "Não estamos podendo 2400" mantida.
- **Avenida Mercedes sai dos favoritos (28/10, pedido dele; estadoVersao 2026-10-28-2):** segue `on-hold`; sem a estrela, deixa a página inicial.
- **Rodada de 26/10/2026:** LH (39), Refúgios (22), Masfer (9) e Maramores iguais. **Pilar:** AXS2059 (Superquadra Paulistânia, 1974, 1 vaga) e DMH129 (Podium, rua cortada) cortados. **VivaReal** (ids acima de 2919000564, agora **2919333774**): 42. **Avenida Mercedes de volta: VR 2919114784** (Lapa, 180 m², 6 quartos/3 suítes, 3 vagas, R$ 1,94 mi, cond. R$ 1.400) = card favorito `avenida-mercedes-180` (Villa Marchetti, mesmo preço e condomínio; janelas da sala iguais à capa do card), marcado vendido desde 14/09. Não mudei o status (esperar pedido). **Idea Vila Romana de volta: VR 2919114648** (Rua Catão, 177 m², R$ 2,29 mi, cond. R$ 2.654) = **o mesmo apartamento do card favorito `idea-ief262`** (vendido desde 02/10; card a R$ 1,99 mi pelo iUrbe, Pilar IEF262 a R$ 2,15 mi e despublicado). **Erro meu:** chamei de outra unidade comparando só a capa e os móveis; ele perguntou, e os pontos fixos batem (quarto com estante emoldurando a janela, quadro branco na parede do quarto ao lado do armário, painel ripado na entrada, parede da TV com prateleira iluminada, varanda gourmet de piso preto com churrasqueira). Status não alterado. **Mostrado com ressalva: VR 2919196292** (Rua Cardoso de Almeida, perto da PUC; 127 m², 3 quartos/1 suíte, **1 vaga**, R$ 1,55 mi, cond. R$ 1.796; "totalmente reformado, mobiliado", painéis de madeira, ilha marmorizada, ar em todos os ambientes, elétrica e hidráulica novas; academia no rooftop). Cortados: Braido Tower 156 R$ 1,65 mi (arcos, azulejo decorado; outra unidade que a PDI18332), Yara Quã 170 (Cândido Espinheira, sanca), Cotoxó 141 (condomínio-clube novo, fotos de decorado), Cayowaá 133 (2004, vazio, tijolinho), Apiacás 147 (datado), Traipu 230, Turiassu 205, Monte Alegre 198 ×2, Itapicuru 158, Tonelero 142, Camburiú 125, Fradique 129, Brentano 160, Nagel, Mofarrej, Belchior. **QuintoAndar** (11 faixas, 409 na faixa): 3 novos, Bela Cintra (Consolação), Croata (Lapa) e Fortunato Ferraz, fora.
- **Rodada de 23/10/2026:** Refúgios (22), Masfer (9) e Maramores iguais; LH4543 (Villa Nova Leopoldina II, Rua Nagel) cortado. **Pilar:** 9 novos. **Mostrado: ECLAT734** (Domna Pompéia, 2012, perto da Rua Dr. Miranda de Azevedo, 1085; 121 m², 3 quartos/1 suíte, 2 vagas + depósito, R$ 1,75 mi = R$ 14,5 mil/m², cond. R$ 1.880, IPTU R$ 831; habitado, porcelanato, parede 3D, ripado, ar, varanda gourmet fechada com churrasqueira, piscina com raia; quartos parecem compactos). **ECLAT733** (Vivace, Rua Fábia, Vila Romana; 129 m², 3 suítes, 3 vagas, R$ 2,12 mi, cond. R$ 1.600; varanda envidraçada, painel de madeira, banheiros anos 2000) é provavelmente o mesmo prédio do Masfer AP86380 (outra unidade, móveis diferentes): o prédio é o **Vivace, Rua Fábia**. Cortados: CVIA2155 (Piazza Veneza, 1988), DMH120 (Sarau Pinheiros), MO7310 (Del Nero, 1966), ZI296197 (cond. R$ 3.465, sanca), ZI297667 (sanca curva, ventilador), ZI297215 (vazio, datado); CVIA1934 já visto. **VivaReal** (ids acima de 2918785636, agora **2919000564**): 69, quase tudo republicação. Cortados: Fábia 161 (Vista Vila Romana, novo, vazio), Iperoig 171 (Ed. Iperoig 2016, só fotos do decorado de lançamento), Iperoig 140 (anos 90, tijolo de vidro), Iperoig 193, João Anes 180, Apinajés 190, Aimberê 159, Bergamota 160 (datados), Capitão Alceu Vieira 155 (cobertura), Nanuque 170 (Key West, 2º andar, = card on hold), Maracanã 177 (recusado em 20/10), São Geraldo 216, Paraguaçu 220, Conselheiro Fernandes Torres 378, Coronel Melo 158 (Chateau d'Avignon), Rafael Correia. **QuintoAndar** (11 faixas, 406 na faixa): 4 novos. **Mostrado com ressalva: 895810288** (Rua Coronel Melo de Oliveira, Pompeia; 130 m², 4 quartos, 3 vagas, R$ 1,69 mi, cond.+IPTU R$ 3.528; reformado, marcenaria nova, piso de madeira, rebaixo com LED; andar baixo, sala estreita). Cortados: 895808042 (Faustolo 133 m², R$ 2,2 mi = Atelier Aquarela, card descartado), 895810080 (Belchior), 895812286 (Higienópolis).
- **Link `#s=` de 23/10 aplicado (estadoVersao 2026-10-23-1):** única mudança, Montparnasse Masfer AP84850 (`montparnasse-ap84850`) foi para on hold; nota mantida.
- **Masfer AP86380 revisto (23/10, ele mandou o link):** agora com 31 fotos. Vila Romana, 128 m², 3 suítes, 3 vagas (1 fixa + 2 rotativas a cada 2 anos), R$ 2,15 mi (R$ 16,8 mil/m²), cond. R$ 1.921 (+ R$ 239 de taxa de obra), IPTU R$ 579. Fotos: habitado e conservado, piso de tábua, varanda gourmet envidraçada grande com vista verde e torres em volta, andar médio/alto; acabamento original dos anos 2000 (cozinha de azulejo branco com armário de vidro jateado e granito, banheiros de azulejo branco, escritório com armário laranja). Minha leitura: estado parecido com o Palazzo pelo preço do José Elias. Rua exata não informada.
- **Palazzo x José Elias (22/10):** Palazzo precisa de 2–3 aparelhos de ar e talvez mudar o quadro de luz (nota no card, estadoVersao 2026-10-22-1). No José Elias AP 41, a princípio o dono **deixa os aparelhos de ar**; da tabela de reposição do card sobram só os eletrodomésticos (~R$ 14 mil com geladeira). Depois (22/10): dos eletrodomésticos, ele acha que só a **geladeira** sai (R$ 5.699); cooktop, coifa, forno e micro-ondas ficam. Conta: Palazzo ~R$ 1,85 mi + cozinha R$ 100–150 mil + ar R$ 20–30 mil = R$ 1,97–2,03 mi; José Elias R$ 2,1 mi (líquido do QuintoAndar) + R$ 14 mil = ~R$ 2,11 mi.
- **Resposta dele (22/10): não adicionar** VR 2918515054 (Sales Júnior, 222 m², 1 por andar): "parece um prédio muito antigo". Não trazer de volta; vale como sinal de que prédio dos anos 80 pesa contra mesmo com reforma.
- **Rodada de 22/10/2026:** LH (38), Refúgios (22), Masfer (9) e Maramores iguais. **Pilar:** CVIA2098 (Solimões, prédio recusado; 175 m², R$ 2,1 mi) cortado; ZI272067 e ZI275516 republicados. **VivaReal** (ids acima de 2918675186, agora **2918785636**): 24, quase tudo republicação. **Mostrado: 2918515054** (Rua Sales Júnior, Alto da Lapa; prédio de 16 andares, 1 apartamento por andar; 222 m², 3 suítes, 3 vagas + depósito, R$ 2,299 mi = R$ 10,4 mil/m², cond. R$ 3.846; "meticulosamente renovado", piso de mármore no living, madeira nos quartos, closet e banheira; vista para o Jaraguá; outro prédio que o Sales Júnior 298 m² cortado em 20/10). Pendentes de ontem resolvidos: Tito 169 (Vitré Vila Romana Garden, garden), Camilo 168 (vazio, taco, paredes amarelas; não parece o La Dolce Vita), Minerva 128 (sanca, lustre, R$ 18 mil/m²) cortados. Cortados hoje: Juatuba (cobertura sem elevador), Cotoxó 179 (Solimões), Cajaíba 270 (duplex), Ministro Godói 189 (taco, antigo), Tonelero 143 (sanca, ventilador), Perdizes 290 m² e Jericó 134 (vazios/datados), Matias Roxo ×3, Lauriano. **QuintoAndar** (11 faixas, 403 na faixa): 2 novos, Croata (Lapa) e Brasílio Machado (Santa Cecília), fora.
- **Rodada de 21/10/2026:** Masfer (9) igual; Maramores AP2619 (Perdizes, R$ 1,43 mi, abaixo da faixa) e AP2625 (Itaim) fora; Refúgios RU 10258 (cobertura duplex, Vila Madalena) cortado. **Pilar:** 4 novos. **Mostrado: DMH097** (Villa Del Fiori, 2009, Rua Tucuna, Pompeia/Perdizes; 135 m², 3 suítes, 3 vagas, R$ 2,1 mi, cond. R$ 1.850, IPTU R$ 878; habitado, porcelanato, sanca com LED, varanda gourmet com churrasqueira, lazer completo; andar aparentemente baixo). Cortados: CBH470 (Manhattan, sanca, datado), ZI273426 (Perdizes 158 m², R$ 2,29 mi; vazio), ZI297584 = LH5530 (Vila Leopoldina 142 m², vazio, perto da Lauriano/Matias Roxo). **QuintoAndar 895792120 (Dr. José Elias, 140 m², 3 vagas, R$ 2,235 mi, cond.+IPTU R$ 3.564) = AP 41 do Pátio das Artes visitado** (mesmos móveis das fotos do ZI296085; card a R$ 2,15 mi direto com o proprietário). **VivaReal** (ids acima de 2918456871, agora **2918675186**): 47, maioria republicação. Cortados: Bergamota 284 (cobertura), Padre Chico 125 (duplex), Húngara 122 (novo, vazio, garden), Mário 203 (Ed. Azaléia, vazio/obra, cond. R$ 4.403), Aliança Liberal 188, Caiubi 215, Belmonte 160, Wanderley 207, Bartira 207, Barão do Bananal 121 (datados), Coriolano 126 R$ 1,695 mi (provável Neo Milano descartado), Aimberê 150 (Westhouse), Paraguaçu 232 (Vila Real), Franco da Rocha 170, Mofarrej, Belchior, Coroados. **Não conferidos (429/Cloudflare):** 2918675186 (Rua Tito, 169 m², R$ 2,3 mi), 2918675185 (Camilo 168 m², R$ 2,128 mi; provável La Dolce Vita, recusado a R$ 2,34 mi), 2918620171 (Rua Minerva, 128 m², R$ 2,3 mi; fotos da grade: sanca, LED, cozinha branca) e 2918515054 (Sales Júnior 222 m², 1 por andar, cond. R$ 3.846). **QuintoAndar** (11 faixas, 410 na faixa): 6 novos; fora 895792200 (Rua Original, Sumarezinho), 895797149 (Croata, Lapa), Higienópolis, Santa Cecília; 895788072 (João Ramalho 186 m², datado), cortados.
- **ITBI da Rua Schilling, 494 (20/10, pedido dele):** prédio de 1993 (ACC do IPTU), área construída no IPTU de 128 e 143 m² (inclui área comum), apartamentos e vagas com matrículas separadas (10º CRI, 778xx). Vendas: mar/26 AP 82 R$ 790 mil + vaga R$ 40 mil (financiado); dez/25 AP 94 R$ 557 mil (vagas 6, 7, 15 e 24 vendidas nos mesmos dias a ~R$ 164 mil cada); jul/25 AP 114 R$ 660 mil + 2 vagas R$ 90 mil; jul/25 AP 41 (143 m²) R$ 654 mil + 2 vagas R$ 146 mil; nov/24 AP 64 R$ 193 mil + vaga R$ 57 mil (abaixo do venal, provável transação não de mercado); set/24 AP 103 (143 m²) R$ 695 mil + 2 vagas R$ 120 mil. **2020–2022 (consultado depois):** 2020 nenhuma; jan/21 AP 72 R$ 550 mil + vaga R$ 40 mil; fev/21 AP 122 R$ 875 mil + 2 vagas R$ 46 mil; abr/21 AP 93 (143 m²) R$ 723 mil + 2 vagas R$ 77 mil; jun/21 AP 131 (143 m²) R$ 640 mil + 2 vagas R$ 160 mil; mar/22 AP 121 (143 m²) R$ 775 mil + vaga R$ 45 mil. Vaga avulsa: mar/23 vaga 8 R$ 20 mil. Valor declarado de vaga varia de R$ 20 a 164 mil (as de dez/25 foram declaradas pelo venal).
- **Resposta dele (20/10): não adicionar nenhum** — VR 2918363701 (Martese, Rua Schilling, 141 m²) e VR 2918437463 (Rua Maracanã, 177 m²) recusados. Não trazer de volta.
- **Rodada de 20/10/2026:** LH (38), Refúgios (21) e Masfer (9) iguais; Maramores AP2617/2618 (Jardins, Pinheiros) fora. **Pilar:** só ZI128424 e ZI275516, ambos já vistos (republicação). **VivaReal** (ids acima de 2918319822, agora **2918456871**): 38, onda de republicação. **Mostrados:** 2918363701 (**Martese Alto da Lapa**, Rua Schilling, Vila Leopoldina; 141 m², 3 suítes, 2 vagas, R$ 2,3 mi, cond. R$ 2.068; habitado, piso de madeira, LED, cozinha planejada anos 2010, banheiro com granito; outra unidade que não o card VK212 de 143 m²) e 2918437463 (Rua Maracanã, Vila Ipojuca; 177 m², 3 quartos/1 suíte, 3 vagas, R$ 1,69 mi = R$ 9,5 mil/m², cond. R$ 3.000; cozinha reformada em madeira, sala de mármore com LED, mas banheiro social antigo com pastilha verde; prédio pequeno). Cortados: Mofarrej ×2, Belchior (ruas), Camilo 169 (La Dolce Vita, recusado "muito caro", agora R$ 2,299 mi), Catão 132 R$ 2,185 mi (= W/L do card), Carlos Weber 125 (= LH5625), Mário Whately 121 (Scena), São Geraldo 216 (Ilhas Seychelles), Coronel Melo de Oliveira 173 (duplex) e 176 (taco, lareira, datado), Tucuna 155 (vazio, lareira), Sales Júnior 298 (datado), João Ramalho 184 (2 quartos; cozinha amarela e banheiros anos 2000), 2918380864 (= LEF45726), demais repetidos (Wanderley, Apinajés, Apiacás, Bartira, Franco da Rocha, Cardoso de Almeida, Turiassu, Caiubi). **QuintoAndar** (11 faixas; Vila Romana 1,9–2,3, Pompeia 1,9–2,3, Perdizes 1,9–2,1 e Vila Madalena 1,9–2,3 pararam na última página com o botão ainda visível, mesmas páginas de ontem): 407 na faixa, 1 id novo, 895805595 (Turiassu, Água Branca), cortado.
- **Segunda passada de 19/10 ("procura de novo"):** Refúgios (21) e Masfer (9) iguais; Maramores AP2610–2616 todos fora (Higienópolis, Vila Olímpia, Itaim, Paraíso, Jardins). **LH5625** (Personal Home Alto da Lapa, Rua Carlos Weber, 125 m², 3 suítes, 3 vagas, R$ 1,7 mi, cond. R$ 1.580) = VR 2915275650 de 01/10 (acabamento mediano; cozinha e banheiros anos 2000), cortado. **Pilar:** 9 códigos novos; ZI272067, ZI273917 e ZI274211 já triados em 25/09. Cortados: AEI5697 (Terraças Alto da Lapa = Matias Roxo; 142 m², 4 quartos, R$ 2,2 mi, bonito), DMH080 (Podium Vila Leopoldina, rua cortada), INVR405 (Edifício Lyon, Paulo Mauro, Pompeia, 173 m², R$ 2,1 mi, cond. R$ 3.500; vazio), LEF45726 (Pompeia 183 m², datado), ZI273045 (Maresias, Brentano, datado; prédio do VB26467 recusado), ZI296919 (Perdizes 184 m², datado). **VivaReal** (ids acima de 2918255053, agora **2918319822**): 10. **Mostrado: 2918319822** (Rua Monte Alegre, Perdizes leste perto da PUC e do Pão de Açúcar; 146 m², 3 quartos/1 suíte com closet, **1 vaga**, R$ 1,755 mi, cond. R$ 1.500; reformado por arquiteta, taco restaurado, cozinha com ilha em quartzo, 5 ar Fujitsu, hidráulica/elétrica e esquadrias novas; prédio antigo, lazer só salão de festas e playground; Sh Prime, código 7AD370AA). Cortados: Cândido Espinheira 168 (= LAP4197), Diana 234 (já visto), Traipu 290 (Pacaembu), Barão 305 123 m² R$ 2,16 mi (= 2914170335), Filipinas 156 (sanca, lustres, cozinha datada), Brentano 160 (datado), Mário Whately 121 (Scena), Belchior, Carlos Weber 172. **QuintoAndar:** varredura completa (11 faixas, 394 na faixa e área); 4 ids novos: Angélica, Alagoas e Av. Higienópolis (fora) e 895790537 (Rua Wanderley, 178 m², R$ 2,2 mi, cond.+IPTU R$ 4.484; datado), cortados.
- **Passada de 19/10 ("da uma olhada se tem algo novo"): nada para mostrar.** Pilar, LH (37), Refúgios (21), Masfer (9) e Maramores iguais. **VivaReal** (ids acima de 2918189940, agora **2918255053**): 18, nenhum passa (Barão do Bananal 120 e Luminárias 169 vazios e datados; Fradique Coutinho 129 datado; Bergamota 284 cobertura duplex com escada caracol; demais repetidos: Princeton, Agissê, Aimberê, Cayowaá, Caiubi, Caraíbas, Diana, Bartira). **QuintoAndar:** completados os bairros que travaram ontem (Alto da Lapa, Pompeia 1,9–2,3, Vila Ipojuca, Vila Madalena em duas faixas). Dica: o "Ver mais" volta a funcionar com o painel do navegador visível; com ele oculto, os timers ficam lentos. 5 ids fora das listas: Pascoal Vita 134 ×2 (1 quarto), 893949731 (360 Graus, Camburiú, 2 quartos, cond. R$ 4.087; lofts), 894769300 (indisponível), Cônego Eugênio Leite (Pinheiros), cortados.
- **Resposta dele (19/10): não adicionar nenhum** — LEF15555 (Rua Tito, 129 m²) e VR 2918096149 (Natingui, 124 m²) recusados. Não trazer de volta.
- **Rodada de 18–19/10/2026 (fim de semana; rede e navegador lentos, scratchpad zerado e baselines refeitas pelo histórico):** LH (37), Refúgios (21), Masfer (9) e Maramores (só AP2607 Bela Vista, AP2608 Santa Cecília) sem novidade. **Pilar:** 9 inéditos. **Mostrado: LEF15555** (Rua Tito, Vila Romana; 129 m², 3 suítes + closet, 4 vagas, R$ 2,1 mi, cond. R$ 2.000, IPTU R$ 700; habitado, porcelanato, ar, terraço gourmet com vista, cozinha moderna, lazer completo; não é o garden nem o 116 m² da Rua Tito recusados). Cortados: LEF21790 e LEF8057 (Lauriano; o 8057 é contrapiso), LEF34873 (Belchior), LEF30269 (Rafael Correia), LEF38197 (Mário Whately 122 = Scena), LEF711 (Tonelero 140 = Via Condoti), LEF31809 (Vila Leopoldina 121 m², condomínio-clube novo, vazio), PDI18342 (Perdizes 200 m², datado). **VivaReal** (ids acima de 2917826945, agora **2918189940**): 69, quase tudo republicação. **Mostrado: 2918096149** (Rua Natingui, Vila Madalena, 124 m², 3 quartos, 3º andar, R$ 2,1 mi = R$ 16,9 mil/m², cond. R$ 2.550; reformado, piso de madeira, ar, vista verde; = 2918101856, mesmo anúncio). Cortados: 2917978876 = Pilar LEF45710 (136 m², 3 vagas, R$ 1,85 mi, cond. R$ 1.800, perto da Palestra Itália) = **Caraíbas 533 recusado** (2916276443); Emílio Ribas 166 (2º andar, datado); Chafalote 130 (lançamento, render); Natingui 130 (Luiz Dumont, vazio); demais repetidos/datados. **QuintoAndar:** varredura **incompleta** (painel oculto travou o "Ver mais" em Alto da Lapa, Pompeia 1,9–2,3, Vila Ipojuca e Vila Madalena); nos 366 colhidos, 3 novos: Baronesa de Itu (Santa Cecília), Coroados (Vila Anastácio) e 895790791 (Dr. José Elias 144 m², R$ 1,95 mi = LH190 recusado), cortados.
- **Segunda passada de 16/10 (sexta à tarde, pedido dele: "nas sextas costumam sair mais anúncios"):** Pilar, LH (37), Refúgios e Maramores sem novidade. **Masfer AP86380** (Vila Romana, "rua plana e arborizada", 128 m² úteis, 3 suítes, 2 vagas + rotativas, R$ 2,15 mi = R$ 16,8 mil/m², cond. R$ 2.160 com taxa de obra (R$ 1.921 habitual), IPTU R$ 579; piso de tábua, varanda gourmet, ar; prédio "reformado/modernizado"; **só 2 fotos**, sala com decoração clássica; não é o W/L): mostrado como possível. **VivaReal** (ids acima de 2917772360, agora **2917826945**): nova onda de 89 republicações; inéditos (Conselheiro Fernandes Torres 398, Franco da Rocha 175, Apinajés 191 ×2, Paraguaçu 215) datados ou cond. alto, cortados. **QuintoAndar:** 2 ids novos: 895690521 (Jerivás, Fortunato Ferraz) e 895796686 (Tonelero 142, 5 suítes, R$ 1,62 mi = VR 2917658254; quase vazio, sanca curva, paredes manchadas), cortados.
- **Resposta dele (16/10): "não vamos adicionar por enquanto"** o LEF31775 / VR 2917770474 (João Ramalho, 144 m²). Não mostrar de novo como novidade; pode voltar se ele pedir.
- **Rodada de 16/10/2026:** Masfer (8), Refúgios iguais; LH 37 (saiu o LH834, não ativo); Maramores só AP2602 (Perdizes 216 m², = São Geraldo/Ilhas Seychelles), AP2604 e AP2606 (Santa Cecília). **Pilar:** 10 inéditos. **Mostrado: LEF31775** (Rua João Ramalho, Perdizes; 144 m², 4 dormitórios/2 suítes, 2 vagas, R$ 1,961 mi, cond. R$ 1.800, IPTU R$ 440; habitado, porcelanato, ar, sanca com LED, varanda, lazer completo) = **VivaReal 2917770474 a R$ 1,85 mi** (antes 2915515810; passou na minha triagem de fotos de 01/10 sem ser mostrado). Cortados: GR2764 (Roof Vila Madalena, 121 m², 2 quartos, R$ 2,27 mi = R$ 18,8 mil/m²), VB27373 (Atelier Galeria, recusado), ZI296505 (vazio, já cortado), LEF20520/LEF207/LEF27151/LEF32175 (datados), LEF34837 (232 m², cond. R$ 5.100, provável Vila Real), LEF7882 (vazio). **VivaReal** (ids acima de 2917596634, agora **2917772360**): onda de 78 republicações; inéditos todos cortados: Princeton (Raul Pompéia 146), Cotoxó 122 (lançamento), Mário Whately 121 (Newcore; Scena, quartos pequenos), Cardoso de Almeida 267, Franco da Rocha 205, Diana 223, Apinajés 226, Piracuama 148 ×2, Patápio Silva 132, Iperoig 223, Bartira 184, Wanderley 255, Agissê (1 quarto). **QuintoAndar:** 3 ids novos: Fortunato Ferraz, Santa Cecília e **895796623 (Neo Milano, Coriolano, 126 m², R$ 1,8 mi) = card descartado `rua-coriolano-1642-126`** (ventilador nos quartos; baixou de R$ 1,85 mi), cortados. **Ativos:** todos no ar com preço igual.
- **Rodada de 15/10/2026: nada para mostrar.** Masfer (8), LH (38), Refúgios iguais; Maramores só AP2601 (Pinheiros). **Pilar:** AEI6014 (Monte Alegre, 1986, 158 m², R$ 1,65 mi, cond. R$ 4.000) = **Monte Alegre 158 recusado em 10/10** (VR 2916842743, era R$ 1,749 mi), cortado. **VivaReal** (ids acima de 2917441995, agora **2917596634**): 20, nenhum passa. Repetidos/recusados: Apinajés 192, Ministro Godói 185, Bartira 247 e 190, Wanderley 200, Desembargador do Vale 146, Tonelero 140 (= Via Condoti), Imperatriz Leopoldina 141 (prédio do card descartado). Cortados: Apiacás 170 e 200, Bartira 183, Cotoxó 180 ×2, Monte Alegre 198, Apinajés 133 (datados ou só área comum), Tucuna 147 (2º andar, cond. R$ 3.243), Capital Federal 283 (Sumaré), Monte Alegre 171 (1 quarto), **Cayowaá 150** (2917578066, prédio novo, vazio: regra do vazio) e **Aimberê 122** (2917593142, prédio novo, fotos de decorado). **QuintoAndar:** 8 ids novos, só 3 nos bairros: Rafael Correia 251 (Água Branca), Rua Roma 162 (= card descartado) e 895777282 (Veneza, Miranda de Azevedo, 1998, 155 m², R$ 1,6 mi; vazio, datado), cortados. **Ativos:** todos no ar com preço igual.
- **Vitá on hold descartados a pedido dele (14/10/2026, estadoVersao 2026-10-14-3):** LH5087 e VivaReal 2914917807, nota "os quartos são pequenos e a região não melhora a qualidade de vida". O Carlos Weber 87 visitado ficou como está.
- **Vitá (Rua Carlos Weber, 87) fora das buscas novas (14/10/2026, dele: "vitá não vai rolar mesmo").** Só corta unidades novas do Vitá nas rodadas (cond. ~R$ 1.800–2.300, 96–130 m², varanda com parede de tijolinho e churrasqueira). **Os cards já na página ficam como estão**: eu tinha descartado os três (estadoVersao 2026-10-14-1) e ele reclamou ("não pedi pra mudar no site"); revertido na 2026-10-14-2. Regra: corte de busca não mexe no estado da página sem pedido explícito.
- **Rodada de 14/10/2026: nada para mostrar.** Masfer (8), LH (38), Refúgios iguais; Maramores nada acima de AP2595. **Pilar:** 9 códigos antigos republicados (ZI293631…ZI295245, todos da varredura de 25/09, mesmo preço). **VivaReal** (ids acima de 2917344498, agora **2917441995**): 21, nenhum passa. Repetidos ou já recusados: Caraíbas 136, São Geraldo 216, Apinajés 158 (= Napa Valley, vazio), Ministro Godói 135 (2917441995 = 2916551530, cond. R$ 1.578, recusado em 08/10), Paulistânia 130. Cortados: Itapicuru 134 (lançamento, render), Itapicuru 251 (1º andar, datado), Apinajés 192 e Ministro Godói 185 (datados), Girassol 153 (arcos, datado), Harmonia 120 (2 quartos, simples, sem ar), Faustolo 134 (2917441372, Imobz; padrão de construtora, sem ar, ventilador de teto; não é o AXS827), Belchior, Mofarrej, Francisco Matarazzo. **2917435370** (Vila Leopoldina, 130 m², 17º andar, R$ 2,1 mi, cond. R$ 1.800, endereço não informado, Konex): varanda gourmet com parede de tijolinho e churrasqueira igual à do Vitá 2914917807, provável **outra unidade do Vitá** (quartos pequenos); não mostrado. **QuintoAndar:** 1 id novo, 895704658 (Rua Bahia, Higienópolis), fora. **Ativos:** todos no ar com preço igual.
- **Segunda passada de 13/10 (tarde, "só pra garantir"): nada para mostrar.** Masfer (8), Refúgios iguais; Maramores só AP2586/2587/2595 (Higienópolis, Jardins, 107 m²). **Pilar:** VRH1026 (Vila Leopoldina, 142 m², R$ 1,896 mi, cond. R$ 2.700) = **Barão da Passagem já recusado** (mesmas plantas e sofá azul do VivaReal 2914546456/2915392354; baixou de R$ 2,09–2,1 mi), cortado; ZI296499 (Perdizes, 136 m², vazio, prédio antigo, 1 vaga) cortado. **LH5565** (Vitá, Carlos Weber 87, 129 m², R$ 2,05 mi, cond. R$ 2.000, IPTU R$ 906; reformado estilo industrial, concreto aparente) = outra unidade do Vitá, prédio dos quartos pequenos (visita de 05/10); não mostrado. **VivaReal** (ids acima de 2917282341, agora **2917344498**): Apiacás 155 m² (Foxter, datado) e Carlos Weber 160 m² ×2 (iUrbe, vazio, datado) cortados. **QuintoAndar:** 4 ids novos — Mourato Coelho (Pinheiros), Natingui 130 m² (Luiz Dumont, vazio, papel de parede, ar de janela), Paraguaçu 232 m² (cond. R$ 4.963) e Marquês de Paraná 150 m² (**cobertura duplex**), todos cortados.
- **Vendas reais no Pátio das Artes (Dr. José Elias, 227) pelo ITBI (13/10/2026):** unidades-tipo (área construída IPTU ~325 m² com 3 vagas; ~140–147 m² privativos): AP 23 jan/21 R$ 1,375 mi; AP 22 abr/21 R$ 1,30 mi; AP 61 set/21 R$ 1,47 mi; AP 13 mar/22 R$ 1,30 mi e de novo fev/23 R$ 1,10 mi; **AP 42 (4º andar) abr/24 R$ 1,30 mi**; AP 22 nov/24 R$ 1,50 mi; AP 53 dez/24 R$ 1,45 mi; AP 32 mai/25 R$ 1,425 mi (cessão de direitos). Nada em 2026 até setembro. Coberturas (4 vagas, ~515 m² construídos): AP 83 R$ 2,03 mi (jul/22) e R$ 2,30 mi (nov/22), AP 82 R$ 2,65 mi (out/23). Ignorados: AP 42 fev/22 (sentença judicial), AP 32 mai/22 (R$ 299 mil), AP 12 jul/24 (dação em pagamento). Leitura: fechado R$ 1,30–1,50 mi (~R$ 9–10,5 mil/m²) contra R$ 2,15–2,235 mi pedidos pelo 4º andar "totalmente reformado". **A unidade visitada (4º andar) é o AP 41** (informado por ele em 13/10/2026; campo `andar` do card). O condomínio tem **duas torres** (duas séries de SQL: 8010802 5xx/6xx e 8010802 7xx/8xx) e o complemento do ITBI não diz a torre. Nas planilhas de 2006–2018 (ODS) há dois AP 41, ambos comprados na entrega e nunca revendidos: SQL 8010802603 (fev/2007, R$ 380 mil) e 8010802840 (jul/2007, R$ 387 mil). Ou seja, o dono do AP 41 está lá desde 2007. Matrículas no **10º Registro de Imóveis**, pelo ITBI: AP 41 SQL 8010802603 = **matrícula 112615**; AP 41 SQL 8010802840 = **matrícula 112639**; AP 42 SQL 8010802859 = matrícula 112640. As matrículas 112639 e 112640 são seguidas, então esse AP 41 e o AP 42 vendido em abr/24 por R$ 1,30 mi são da mesma torre. A certidão sai pelo Registro de Imóveis do Brasil (ridigital.org.br), com cartório e número da matrícula.
- **O apartamento dele no Palazzo é o AP 122, 12º andar** (informado em 13/10/2026; campo `andar` do card). Não aparece no ITBI desde 2021.
- **Card do Palazzo (13/10/2026):** a pedido dele, os `detalhes` ficaram só com a tabela de vendas do ITBI desde mar/23 (simulações de R$/m², conta da corretagem e lista de anúncios saíram do card; seguem neste arquivo).
- **Vendas reais no Palazzo pelo ITBI (levantado em 13/10/2026):** planilhas "Guias de ITBI pagas" da Prefeitura (prefeitura.sp.gov.br/web/fazenda/w/acesso_a_informacao/31501; curl precisa de `-e` com essa página como referer, senão 403), 2021 a set/2026, filtro Rua Pres. Antônio Cândido, 350. Unidades-tipo (150 m² privativos; área construída do IPTU ~251–259 m² com 2 vagas; a 3ª vaga é vendida à parte, R$ 81–128 mil): AP 63 nov/22 R$ 1,22 mi + vaga 81 mil; AP 113 dez/22 R$ 1,30 mi; AP 141 mar/23 R$ 1,535 mi + vaga 100 mil; AP 61 dez/23 R$ 1,506 mi + vaga 94 mil; AP 71 fev/24 R$ 1,365 mi + 2 vagas 200 mil; AP 31 ago/24 R$ 1,607 mi + vaga 93 mil; AP 82 ago/24 R$ 1,50 mi; **AP 11 mar/25 R$ 1,903 mi**; **AP 163 fev/26 R$ 1,702 mi + vaga 128 mil = R$ 1,83 mi** (16º andar, financiado); **AP 42 mai/26 R$ 1,55 mi + vaga 100 mil = R$ 1,65 mi**. Coberturas AP 191 (out/21, R$ 3,19 mi) e AP 193 (jun/24, R$ 2,79 mi). Ignorados: AP 181 (2021 R$ 380 mil; 2025 integralização de capital de 1/3) e AP 23 (set/23 R$ 262 mil), valores fora de mercado. Leitura: o fechado recente no prédio é R$ 1,65–1,90 mi com 3 vagas (R$ 11–12,7 mil/m²), contra R$ 2,05 mi pedidos (R$ 13,7 mil/m²). Valor é o declarado pelo contribuinte; estado e decoração de cada unidade não aparecem.
- **Rodada de 13/10/2026:** **Palazzo:** os 9 anúncios do apartamento dele conferidos — 7 a R$ 2,05 mi, VivaReal 2888962586 a R$ 2,049 mi e 2893148094 a R$ 2,0 mi; condomínio diverge entre anúncios (QA R$ 2.955, Masfer R$ 2.298, Pilar R$ 1.900). **Card do Palazzo passou a R$ 1,95 mi a pedido dele** (meta de compra direta, sem corretagem; nota em `detalhes`). **Masfer voltou** (8 na busca, todos já vistos). LH (38), Refúgios e Maramores (nada acima de AP2585) iguais. **Pilar:** 4 inéditos. CH407 (Bois de Boulogne, 135 m², vazio, piso de mármore antigo), SQP2457 (Concorde, 1991, 170 m², R$ 1,65 mi, vazio, taco e lareira) e LEF45561 (Araruama, 1993, só fotos de área comum) cortados. **Mostrado: PDI18332** (Braido Tower, Perdizes, Rua Desembargador do Vale; 154 m², 3 suítes, 3 vagas, andar alto, R$ 2,09 mi, cond. R$ 2.644, IPTU R$ 852; habitado, piso de madeira, ar, marcenaria; **outra unidade** que o QA 895614534 recusado em 04/10 — sala azul e piso diferentes). **VivaReal** (ids acima de 2917191308, agora **2917282341**): 3, nenhum passa: Bartira 193 (247 m², já recusado), Simpatia 160 m² (duplex, datado), Raul Pompéia 146 m² (2917282341 = Princeton, recusado). **QuintoAndar** (rota `/2-quartos/<faixa>/`): nenhum inédito nos bairros (os ids novos eram Higienópolis, Santa Cecília, Pinheiros, Barra Funda, Água Branca, Vila Anastácio/Quintas da Lapa, Pacaembu). **Ativos:** todos no ar com preço igual; classificado QA 114560281 (Key West) continua indisponível, como desde 03/10.
- **Rodada de 12/10/2026: nada para mostrar.** Pilar sem códigos novos; LH (38) e Refúgios iguais; Maramores nada acima de AP2585. **Masfer: a página de busca deu 404/timeout o dia todo** (os anúncios individuais abrem; refazer amanhã). **VivaReal** (ids acima de 2917053036, agora **2917191308**): 8, nenhum passa (Wanderley 200 e 216, Caraíbas 136 do prédio do 533, Tonelero 140 = Via Condoti, Belchior, Traipu/Pacaembu, São Geraldo 216, Apiacás 216). **QuintoAndar** (rota `/2-quartos/<faixa>/`): 206 na faixa, 1 inédito, 895785956 (Napa Valley, Rua Apinajés, 235, 158 m², 4 quartos/3 suítes, R$ 1,798 mi): **vazio** (foto de capa decorada por IA), cortado pela regra do vazio. **Ativos:** todos no ar com preço igual; só o VivaReal 2915462732 (2º link do Helbor True, Iperoig) deu 404 — o QuintoAndar 895228969 e o VR 2915514116 seguem no ar.
- **Segunda passada de 11/10 (tarde):** LH, Masfer e Refúgios iguais. **Pilar:** só PDI18337 inédito: **Park View Perdizes** (Rua Itapicuru, 801, 2016), 127 m², 3 quartos/2 suítes, 2 vagas, R$ 2,2 mi, cond. R$ 2.525, IPTU R$ 1.114; habitado, piso de madeira, varanda envidraçada com churrasqueira. **Mesmo IPTU da linha `rua-itapicuru-801-128`** (vendido desde 20/09, R$ 2,195 mi, cond. R$ 2.200), mas a decoração das fotos é outra (estante com vasos coloridos na TV, contra sofá bege): não dá para afirmar se é a mesma unidade. Mostrado. **Resposta dele: não adicionar** (nem reativar a linha antiga). Não trazer de volta. **VivaReal** (ids acima de 2917006355, agora **2917053036**): 9, nenhum passa: Caraíbas 136, São Geraldo 216, Fortunato Ferraz (Vila Anastácio), Antônio Borba, Piracuama 130 (Newcore), Diana 145 (= QA 895769605, Os Luzíadas), Cotoxó 186 (2917012539; prédio antigo, piscina de pastilha), **WL Vila Romana 127 m² (2917052839, R$ 1,8 mi): contrapiso**, Mansão dos Nobres (Cayowaá 180, datado).
- **Insight (`rua-paulo-franco-153-114`) → on hold em 11/10, pedido dele** (estadoVersao 2026-10-11-1). Na fila "a visitar" fica só o Montparnasse AP84850.
- **Rodada de 11/10/2026 (domingo): nada para mostrar.** Masfer (16), LH (38), Refúgios e Maramores iguais; ativos todos no ar com preço igual. **Pilar:** 4 novos, cortados: CVIA2102 (Camburi, Pompeia, 1992, 125 m², R$ 1,58 mi; pedra na parede, sanca), CVIA2104 (**Solimões**, prédio já recusado), PNS250 (Ilhas Seychelles, 1987), ZI296588 (Vila Leopoldina 125 m², R$ 1,75 mi, cond. R$ 1.450 = VR 2916774681, Rua Nagel). **VivaReal** (ids acima de 2916857546, agora **2917006355**): 10 novos, nenhum passa: Queirós Aranha, João Ramalho 188, Bartira 247, Itapicuru 159, Apiacás 215, Paraguaçu 232 (Vila Real), Mourato Coelho (Pinheiros), Carlos Weber 130 (Vitá, 2 suítes), Desembargador do Vale 135 (2916979250; papel de parede, espelhos, datado), Dr. José Elias 157 (2916981040; térreo com terraço/garden, vazio). **QuintoAndar** (rota `/2-quartos/<faixa>/`): exatamente os mesmos 207 na faixa de ontem.
- **Resposta dele (10/10): não adicionar** VR 2916842743 (Monte Alegre 158) nem VR 2916816033 (Sumarezinho 147). Não trazer de volta.
- **Rodada de 10/10/2026:** Masfer (16), LH (38), Refúgios e Maramores (nada acima de AP2585) sem novidade. **Pilar** (minArea 120): 3 fora do CONTEXTO, todos cortados: CVIA2094 (Mar das Caraíbas, Perdizes, 150 m², R$ 1,75 mi, cond. R$ 2.400, IPTU R$ 400; reformado, ripado e LED) **= QuintoAndar 895448721, já mostrado e recusado em 25/09** (mesma sala, mesmos valores); INVR369 (Araruama, 1993, Pompeia, datado); ZI296505 (Perdizes, 136 m², vazio, mármore; = VR 2916451541). **VivaReal** (ids acima de 2916665962, agora **2916857546**): 34 na faixa. Cortados: Matias Roxo, Nagel, Água Branca (Rafael Correia ×2), Iperoig 153 (cobertura), Húngara 154 (Baccarelli), Dr. José Elias 140 ×2 (Pátio das Artes), 132 m² sem rua (= Ilha de Capri), Turiassu 128 (Manacá), Diana 124 (já recusado), Pinto Gonçalves 140 ×2 (recusado em 23/09), Piracuama 136 (Terrazzo), Paulistânia 130, Carlos Weber 124 (Newcore, sem foto), Av. Pompéia 160, Queirós Aranha, Caiubi 203 (Lester Young), Apiacás 125 (cobertura), Pascoal Vita 155 (vazio), Turiassu 166 (clássico), Franco da Rocha 205 (clássico), Tucuna 193 (sanca, 2000s); Imobz IM-895xxxxxx = republicações do QuintoAndar (Homem de Melo 678, Paraguaçu 294 e 456, Harmonia 564, Monte Alegre 634 e 791, Cardoso de Almeida 654). **Mostrados:** VivaReal 2916842743 (Rua Monte Alegre, 158 m², 3 quartos/1 suíte + escritório, R$ 1,749 mi, cond. R$ 4.000; habitado, moderno, piso de madeira, janelas grandes) e 2916816033 (Sumarezinho, sem rua, 147 m², 2 quartos (1 suíte + closet), R$ 2,28 mi, cond. R$ 3.670; reformado, marcenaria azul e madeira, ar, desníveis). **QuintoAndar** (rota `/2-quartos/<faixa>/`, 775 cards, 207 na faixa): 16 fora das listas anteriores; todos já cortados em 09/10 pela outra sessão (Linked, Alto das Perdizes, Bois de Boulogne, Saint Patrick, Arua duplex, Maison Dallas, Duplex Oggi, Vila Real/Paraguaçu 294, Lester Young, São Geraldo 216, Itapicuru 135, Cândido Espinheira 168) ou fora (Ribeiro de Barros garden, Iperoig 1 quarto); 895755604 (Taft Tower, Apiacás, 758, 155 m², R$ 1,66 mi) = VR 2916227367, datado. **Ativos:** todos no ar com preço igual.
- **Links da vitrine do QuintoAndar (corretor Marcos Leonardi, 09/10), triados:** `vitrine.quintoandar.com.br/imovel/v2/<id>/...` = `www.quintoandar.com.br/imovel/<id>/comprar`. 895581949 = **Botticelli** (já na página, on hold, R$ 2,208 mi, sem mudança). 895361898 = **La Dolce Vita** (Rua Camilo, 556, 169 m², R$ 2,34 mi, acima do teto; descartado por ele, "muito caro"). 895344167 = **Chateau d'Avignon** (Rua Coronel Melo de Oliveira, 327, Pompeia/Perdizes, 4º–7º andar, 158 m², 4 quartos/3 suítes, 3 vagas, R$ 2,2 mi, cond. R$ 2.900, IPTU R$ 1.550; habitado, porcelanato, ar, varanda gourmet com churrasqueira, decoração atual): **outra unidade**, não o CMI344/AP2429 recusado em 08/10 (cozinha e varanda diferentes); o CMI344 está como "negotiated" na Pilar. Mostrado. **Resposta dele: não adicionar nenhum dos três.** Não trazer de volta.
- **Resposta dele (09/10): não adicionar nada de hoje.** Nenhum dos mostrados entra (QA 895634995 Ed. Daniela, VR 2916660269 Westhouse, VR 2916551530 Ministro Godói, VR 2916552292 Cajaíba; Vanguarda já tinha saído pela Vila Anastácio). Não trazer de volta sem motivo novo.
- **Resposta dele (08/10, tarde): "não vamos adicionar nada hoje".** Nenhum dos mostrados em 08/10 entra (rodada da manhã e retriagem: AXS1813, VivaReal 2916419586/2916489495/2916426362/2916425556/2916427539/2916425583, LXH6752, CMI344, LAP4197, AP2344, Tucuna 888). Não trazer de volta sem motivo novo.
- **Erro meu (08/10): VivaReal 2916425583 (Rua Oscar Caravelas, 127 m², R$ 1,69 mi) está no contrapiso** ("nem deveria vir", dele). Foi mostrado como "prédio novo com piscina na cobertura" — exatamente o caso do decorado de construtora/unidade crua da seção de acabamento. Prédio novo ou lançamento sem móveis da própria unidade não vai para ele. Não trazer de volta. O 2916425556 (Itapicuru, vazio) da mesma rodada também furou a regra do vazio.
- **Segunda passada de 08/10 (manhã) + retriagem dos cortados por condomínio (03–08/10):** Masfer, LH (38), Refúgios e Maramores (nada acima de AP2572) iguais. **Pilar:** 2 novos, LXH6752 (mostrado) e ZI296502 (Vila Madalena, 130 m², R$ 1,75 mi; taco e azulejo azul, datado; cortado). **VivaReal** (ids acima de 2916502155, agora **2916517259**): 1 novo na faixa, 2916512568 (Queirós Aranha, 576, 224 m², arcos e lustre, datado; cortado). QuintoAndar e ativos não refeitos (feitos na rodada da manhã). **Retriagem:** reabertos 6 Pilar, 4 Maramores e 18 VivaReal (todos os ids desde 2915650000 com cond. > R$ 3 mil). **Mostrados:** Pilar **LXH6752** (V. Cinquo, 2019, Perdizes, célula perto da Rua Capital Federal, 116 m², 3 quartos/2 suítes, 3 vagas, R$ 1,99 mi, cond. R$ 2.900, IPTU R$ 1.262; moderno, habitado), **CMI344** (= Maramores AP2429; Chateau d'Avignon, Pompeia, reformado em 2019, 158 m², 3 suítes, 3 vagas, R$ 2,13 mi, cond. R$ 2.977, IPTU R$ 1.428; cobogó, marcenaria de cumaru, varanda gourmet; ano do prédio não achado), **PNS211** (Otávio Pereira Lopes; **erro meu: é a linha `rua-bartira-193-198`, descartada por ele com "Condominio muito caro"**, mesmo preço R$ 1,995 mi, 198 m², 1 vaga; link posto como `link3` em 08/10. A Pilar dá `launchDate` 1982, a linha diz 1975 pela Loft. Lição: cruzar o `condoName` da Pilar com o `predio` das linhas, inclusive descartadas, antes de mostrar), **LAP4197** = VivaReal 2915963099/2915844712 (Rua Dr. Cândido Espinheira, 439, leste de Perdizes perto do Pacaembu, 168 m², 3 suítes, 2 vagas, R$ 1,68 mi na Pilar e R$ 1,8 mi no VivaReal, cond. R$ 3.600, IPTU R$ 1.080; **vazio**, piso de madeira, painéis, ar em todos; ano não achado; vizinhos 540 e 629 são de 1975). Com ressalva: Maramores AP2344 (Vila Madalena, 120 m², **2 quartos**, R$ 1,6 mi, cond. R$ 3.479; piso de pastilha preta, vista aberta) e VivaReal 2916125794 (Rua Tucuna, 888, 147 m², R$ 1,55 mi, cond. R$ 3.243; porcelanato, varanda com azulejo antigo). Cortados nas fotos: Pilar GR2722, PNS200 ("estado original"), MO6520; Maramores AP2499, AP2236 (vazio), AP2292; VivaReal 2916423109, 2916381645 (sem vaga), 2916080946, 2916049291, 2916021176 (Passo da Pátria, mediano), 2915829946, 2915797335 (Caraíbas 383), 2915796179, 2915792212/2915721964 (Paraguaçu 294), 2915790114, 2915742140, 2915734233, 2915663939 (Lincoln Albuquerque 235, vazio), 2915661255 (Homem de Melo 250, mediano), 2915657549.
- **Segunda passada de 07/10 (tarde):** Masfer, Refúgios, Maramores iguais. VivaReal (ids acima de 2916295040, agora **2916381645**): 9, todos repetidos (Barão da Passagem recusado, Princeton, Aimberê, Caraíbas, Diana 145 = Os Luzíadas) ou cortados (cond.). Pilar: NRE2722 (Neo Milano, R$ 1,8 mi) já descartado; ZI296576 (Perdizes, 125 m², R$ 1,7 mi, cond. R$ 2.790; ventilador de teto, datado) cortado. **Mostrados:** Pilar **TA968** (Wingfield, Perdizes, 140 m², 3 suítes, 3 vagas, R$ 2,2 mi, cond. R$ 2.200, IPTU R$ 1.200; vazio, andar alto, varanda gourmet envidraçada com churrasqueira, painéis de madeira alaranjada) e **LH190** (Alto da Lapa, 144 m², R$ 1,95 mi, cond. R$ 1.600, IPTU R$ 775; piso de madeira, varanda envidraçada, mobiliado).
- **Insight (07/10, pedido dele):** removido o link do VivaReal 2913978451 (CLS), fora do ar; o 2º link agora é o da Lucro Certo (2908508722).
- **Resposta dele (07/10): não adicionar nenhum** dos candidatos de 06/10 (Parque Perdizes, Coelho de Carvalho, Idea 4º andar) e de 07/10 (Raul Pompéia, Diana, Itapicuru, Caraíbas). Não trazer de volta. **Top Class (`topclass-vr2914890362`) → vendido** a pedido dele: o VivaReal 2914890362 saiu do ar (404). estadoVersao 2026-10-07-1.
- **Rodada de 07/10/2026:** Pilar (12 mais recentes), Masfer, LH (37), Refúgios iguais; Maramores só AP2564/2571/2572 (Perdizes 184 m² R$ 3,7 mi, 70 m², Jardins). **VivaReal** (ids acima de 2916204463, agora **2916295040**): 17 novos. Cortados: Matias Roxo; Mota Pais 131 (= ZI288619); Bartira 190; Lincoln Albuquerque (cond. R$ 4.200); Apiacás 152 (2916227367, datado); Franco da Rocha 170 m² ×3 (antigo); Av. Pompéia 160 (You Estação Madalena, 1 vaga); Caraíbas 190 e Queirós Aranha (cond.). **Mostrados:** 2916240107 (Rua Carlos Weber, 150 m², 3 suítes, R$ 2,1 mi, cond. R$ 1.347; varanda envidraçada integrada com churrasqueira, vista aberta, automação; condomínio igual ao do Sky House, provável outra unidade dele a preço menor; **ele disse que já passou pela lista**, não mostrar de novo); 2916244372 = 2916219142 (Rua Raul Pompéia, 120–121 m², 3 quartos, R$ 1,7 mi, cond. R$ 1.840–2.200; ar, painel de madeira, piso de madeira); 2916243120 (Rua Diana, 125 m², 3 quartos/1 suíte, R$ 1,58 mi, cond. R$ 1.800; gesso com iluminação, marcenaria); 2916273859 (Rua Itapicuru, 135 m², 2 suítes, R$ 1,95 mi, cond. R$ 2.200); 2916276443 (Rua Caraíbas, 136 m², 4 quartos/1 suíte, 3 vagas, R$ 1,85 mi, cond. R$ 1.800; outra unidade do Caraíbas 533 de ontem, a R$ 2,08 mi). **QuintoAndar** (1.145 cards, 149 na faixa): 8 fora da lista de ontem, só 2 nos bairros e ambos cortados pelas fotos: 894101773 (Manacá, Rua Turiassu, 152, 2005, 128 m², 3 suítes, R$ 1,84 mi, cond. R$ 2.680; sanca, piso laminado escuro) e 895769605 (Os Luzíadas, Rua Diana, 1061, 145 m², R$ 1,8 mi; piso de mármore antigo, andar baixo). **Dica nova do QuintoAndar:** a rota com faixa de preço funciona por bairro (`/comprar/imovel/<bairro>-sao-paulo-sp-brasil/apartamento/3-quartos/de-1500000-a-2300000-venda/novos-ou-reformados`) e encolhe a lista: Vila Ipojuca, que travava na página 21, carregou inteira (63 cards). Perdizes ainda trava com a faixa toda; dividida em `de-1500000-a-1900000` e `de-1900000-a-2300000`, carrega. **Ativos:** todos no ar com preço igual, exceto **Top Class (VivaReal 2914890362) e o anúncio CLS do Insight (2913978451): 404**. O Insight continua no Maramores (AP2458) e na Lucro Certo. Observação: o `seen.txt` do scratchpad sumiu; a deduplicação agora é por CONTEXTO, index e a lista de ids do dia anterior.
- **Segunda passada de 06/10 (tarde, "nada mais de novo hj?"):** Masfer, LH e Refúgios iguais; Maramores nada acima de AP2560. **Pilar:** CN551 (Florenza, Pompeia, 163 m², R$ 1,8 mi, cond. R$ 2.708; vazio, piso de taco, antigo) cortado; **ZI295981 = Zimóveis 295981 = o Palazzo Dell Arte dele** (mesmas poltronas verdes e painel de madeira; R$ 2,05 mi, cond. R$ 1.900), posto em `mais` da linha do Palazzo. **VivaReal** (ids acima de 2916089835, agora **2916204463**): 58 novos, quase todos republicações da Lopes (REO...) criadas hoje. Cortados pelas fotos/cortes: Wanderley 155 m² (Pórtico, 2004, vazio, datado), Itapicuru 159 (antigo), Paulistânia 130 (= QA 895734461, antigo), Caraíbas 533 (136 m², antigo), Carlos Weber 158 (4 quartos, anos 90), Via Condoti (Tonelero, 2 unidades), Passo da Pátria 140 (prédio de tijolinho), Dardanelos 120 ("vintage"), Vitá (Carlos Weber 129, duas unidades), Belchior, Lauriano, Mofarrej, Nanuque/Doppio, condomínios acima de R$ 3 mil. **Mostrados:** VivaReal 2916152315 = Lopes REO214609 (Edifício Parque Perdizes, Rua Dr. Franco da Rocha, 9º andar, 157 m², 4 quartos/1 suíte, 2 vagas, R$ 2,3 mi, cond. R$ 1.900, IPTU R$ 503; moderno, ar, lustre, cozinha aberta); VivaReal 2916158942 = REO1175431 (Rua Coelho de Carvalho, 8º andar, 126 m², 3 suítes, 4 vagas, R$ 2,15 mi, cond. R$ 2.071, IPTU R$ 1.268; piso laminado, varanda envidraçada; a Lopes classifica como Alto de Pinheiros, o VivaReal como Alto da Lapa); VivaReal 2916159540 = REO1073597 (**Idea Vila Romana, 4º andar**, 177 m², 4 quartos/3 suítes, 3 vagas, R$ 2,1 mi, cond. R$ 2.594; mesmo andar e condomínio do Idea IEF262 marcado vendido, mas móveis diferentes, sofás cinza contra marrons: provavelmente outra unidade). Fora dos bairros: 2916155002 (Bela Aliança, prédio novo da Vivenda Lare, 128 m², R$ 2,173 mi, cond. R$ 1.200, vazio).
- **Montparnasse mobiliado (`montparnasse-vr2913109916`, R$ 1,82 mi) descartado por ele em 06/10:** "sem ar condicionado e andar baixo" (corrigi o andar na linha; eu tinha posto andar alto). estadoVersao 2026-10-06-4.
- **Lista Zimóveis recebida em 06/10 (14 links).** O código Zimóveis é o mesmo número do Pilar com prefixo ZI (ex.: zimoveis 288619 = Pilar ZI288619). Já vistos ou cortados: 268392 = VN191 (Stilo Villa Lobos, descartado); 293829 = Ilha de Capri (descartado); 293390 = Croata 130 m², R$ 1,75 mi (Tower Hills, descartado); 288619, 278746, 281608 descartados; 279874 (ZI279874) cortado antes; 295702 recusado em 30/09; 277090 (Lauriano/Cyrela Mond), 293282 (Matias Roxo) cortados pela rua; 284723 (Carlos Weber, 129 m², 3 suítes, R$ 1,97 mi, piso de porcelanato branco) é outra unidade do Vitá, que ele visitou e achou de quartos pequenos. 282120 (Rua Brentano, Vila Hamburguesa, 143 m², R$ 1,889 mi) cortado pelas fotos: varanda com azulejo rústico, datado. **Mostrados:** 293203 (Rua Mário Whately, Alto da Lapa, 127 m², 3 quartos/2 suítes, 3 vagas, andar alto com vista, R$ 2,1 mi, cond. R$ 1.600, IPTU R$ 1.515; moderno, piso de madeira, ar, varanda gourmet envidraçada; R$ 16,6 mil/m²) e 289523 (Reserva Alto da Lapa, Rua Sacadura Cabral, 160, 138 m², 3 suítes, 3 vagas, R$ 2,1 mi, cond. R$ 1.650, IPTU R$ 1.050; piso de porcelanato, ar, varanda gourmet com churrasqueira; não é o LH2442, que tem cond. R$ 1.350 e IPTU R$ 800). **Ele disse que os dois já tinham passado pela lista (reconheceu pelas fotos)**; eu não achei a linha antiga pelo número nem pelo preço, então a correspondência é dele. Não mostrar de novo.
- **Montparnasse mobiliado adicionado em 06/10 (pedido dele):** linha `montparnasse-vr2913109916`, R$ 1,82 mi, a visitar; links: VivaReal 2913109916 (principal), Pilar AXS717, Loft, VivaReal 2915644936 e 2909747181, spimovel 4532271. IPTU gravado como mensal (R$ 9.225 por ano ÷ 12 = R$ 769). Lição de operação: a última linha do array `apts` não tem vírgula; ao inserir depois dela, ponha a vírgula na anterior (o erro deixa a página em branco).
- **Por que o Montparnasse mobiliado (VivaReal 2913109916 e cia.) nunca entrou (06/10, pergunta dele): erro meu.** Em 28/09 (rodada da tarde) eu liguei todo anúncio da Rua Jorge Americano a "unidades do Montparnasse já vistas", por prédio e sem comparar fotos, quando só tinham passado o ARCO1204/LH3121 (andar baixo, vazio, recusado) e o SEP21058. A unidade mobiliada (3 suítes, 2 vagas, andar alto, mesa de vidro, pendente de cristal, painel de madeira na TV, cond. R$ 1.420, IPTU R$ 769) nunca foi mostrada: VivaReal 2913109916 (FLOW2461, R$ 1,82 mi; mesmo texto do Loft FL1773194), 2915644936, 2909747181, spimovel 4532271, imovelweb e Pilar AXS717 (R$ 1,95 mi). Regra de novo: **mesmo prédio não é duplicata; compare as fotos com cada linha antes de dizer "já visto"** (vale para qualquer anúncio de prédio que já tem unidade na lista ou nos recusados).
- **QuintoAndar 895579422 (Vista Pompéia, Rua José Tavares de Miranda, 50, prédio de 2019; 152 m², 3 suítes, 3 vagas, R$ 2.457.450; pergunta dele em 06/10, não está na lista):** acima do teto de R$ 2,3 mi. Mesmo apartamento (sofá bege listrado, quadro de dunas no painel de madeira, biombo vazado) em **VivaReal 2913291420** (mesmo preço; código do anunciante = 895579422) e **VivaReal 2906815432** (R$ 2,45 mi, cond. R$ 2.600, IPTU R$ 1.370, Creci 25618, criado em 20/08; o cond. R$ 2.900 e IPTU R$ 99 do QuintoAndar são provavelmente dado ruim). Outras unidades do prédio, diferentes: Zimóveis 293853 = VivaReal 2908335147 (R$ 2,43 mi, piso de mármore escuro), VivaReal 2909262821 (R$ 2,5 mi, porcelanato) e 2915795651 e outros quatro ids (R$ 2,53 mi, cond. R$ 2.000, parede de cimento queimado, OH62387).
- **Montparnasse AP84850: outros anúncios (06/10, pedido dele): não achei nenhum.** O AP84850 (Masfer, 134 m², andar alto, 2 suítes, vazio, parquet em tacos, lareira de mármore, cozinha recém-reformada, R$ 1,98 mi, cond. R$ 1.928, IPTU R$ 923) só aparece na Masfer. Comparei por foto com as outras unidades do prédio: a mobiliada (3 suítes, 2 vagas, mesa de vidro e pendente de cristal) é a mesma em Pilar AXS717 (R$ 1,95 mi), Loft FL1773194, spimovel 4532271, imovelweb e VivaReal 2915644936/2909747181 (R$ 1,82 mi, cond. R$ 1.420); HB1931 = spimovel 4457916 (R$ 1,85 mi, 3 vagas, terraço); ARCO1204 = LH3121 = VivaReal 2900133695 (andar baixo, vazio, hoje **R$ 1,62 mi** no VivaReal); SEP21058 (andar baixo, paredes verde-oliva); VivaReal 2507197592 (anúncio de 2021, 4 quartos, R$ 2,2 mi). O QuintoAndar lista 8 no prédio (R$ 1,75–1,87 mi, todos classificados do imovelweb) e nenhum bate. Dica: o VivaReal tem página de condomínio (`/condominio/edificio-maison-montparnasse-alto-da-lapa-id-f27f7a20-b78b/`) e o QuintoAndar também (`/condominio/maison-montparnasse-alto-da-lapa-sao-paulo-ed5zswnwdm`); servem para achar todas as unidades à venda. Imagens do Pilar: use `watermarkUrl` do `images[]` (S3 público); `imagens.pilarhomes.com.br` dá 403 no curl.
- **Insight (Rua Paulo Franco, 153), outros anúncios do mesmo apartamento (06/10):** além do VivaReal 2913978451 (CLS), o **VivaReal 2908508722** (Lucro Certo, R$ 1,85 mi, cond. R$ 1.332, IPTU R$ 737, no ar desde 29/08) tem as mesmas fotos (mesa redonda, pendente preto, sofá cinza com almofada rosa); entrou como 3º link. O LH5449 é outra unidade (painel de madeira, mesa de mármore redonda). O código "AP2207" do anunciante Lucro Certo não tem relação com o AP2207 da Maramores (Higienópolis). Insight: Setin, torre única de 60 unidades, entregue em 06/2021 (ano da linha agora 2021). Outras unidades à venda no prédio, mais baratas e não vistas: imovelweb 3029336382 (114 m², 3 suítes, R$ 1,589 mi, cond. R$ 1.600; diz Paulo Franco 142) e spimovel 4491294 (R$ 1,55 mi). **Ele não quis nenhuma das duas (06/10): não mostrar de novo.**
- **Montparnasse AP84850 (Masfer, Rua Jorge Americano, 263, andar alto, 2 quartos, R$ 1,98 mi) reativado em 06/10, pedido dele:** saiu de descartado para a visitar (estadoVersao 2026-10-06-2). É outra unidade do mesmo prédio do SEP21058 (revisado, andar baixo, R$ 1,72 mi).
- **Vitá, Rua Carlos Weber, 87 (06/10, pedido dele):** visitado em 05/10 (18h30, Masfer), favorito removido, "os quartos são pequenos". Linha `rua-carlos-weber-87-129`, estadoVersao 2026-10-06-1.
- **Rodada de 06/10/2026:** nada para mostrar. **Pilar** (12 mais recentes, 3 inéditos, todos cortados por condomínio): GR2722 (Perdizes, Baltico, 208 m², cond. R$ 3.577), PNS200 (Groove Island, 215 m², cond. R$ 5.200), PNS211 (247 m², cond. R$ 3.800). **Masfer, Refúgios e Maramores** (nada acima de AP2560): sem mudança. **Leopoldina House:** paginação é `page=N` (não `pagina=`; com `pagina` vêm os mesmos 12 três vezes); 37 códigos, único inédito LH4959 (Pinheiros, 102 m², R$ 1,49 mi) cortado. **VivaReal** (ids acima de 2915817537, agora **2916089835**): 53 novos, 32 após filtro de condomínio/rua; quase tudo republicação ou já visto (Mário Whately R$ 1,855 mi = Scena cl121164574, descartado; Camilo = La Dolce Vita; Desembargador do Vale, Froben, Mofarrej, Nagel, Belchior, Nanuque/Doppio, Aimberê, Cardoso de Almeida já vistos ou cortados; Itapicuru = Park View). Cortados pelas fotos: Apiacás 115 m² (2915953607, terraço com churrasqueira, é cobertura), Dr. Homem de Melo 121 m² (2915953436, piso de taco, datado), Pompeia Dr. Augusto de Miranda 127 m² (2916059612, FM Prime, decoração e acabamento antigos), Camburiú 127 m², 2 quartos (2916077352, datado), Apiacás 152 m² (piso de taco). Sem fotos de verdade (só banner da Newcore): 2915892419 (Carlos Weber, "Roma", 124 m², R$ 1,7 mi, cond. R$ 1.700, "totalmente reformado") e 2915898244 (Spazio Vernice, 180 m²); não confirmados. **QuintoAndar** (Vila Ipojuca parou em ~280 cards, o botão "Ver mais" travou; os outros completos; Perdizes ~1.070): 180 na faixa, só 1 relevante (895752685, Rua Girassol, 115 m², R$ 1,95 mi = Edifício Maia, já recusado). O resto inédito é Santa Cecília/Consolação, fora dos bairros (a rota de Perdizes puxa esses depois dos ~500 primeiros). **Ativos:** todos no ar, preços iguais (QA salePrice, Pilar, Masfer, Garoni, LH, iUrbe, Maramores); VivaReal Top Class (2914890362) e Palazzo (2893148094) em 429/Cloudflare, não conferidos.

Depois **filtre por fotos antes de mostrar qualquer coisa** — ver a seção de
acabamento acima. A taxa histórica é de ~15% dos que passam pelos números.

## Mensagem para corretores (02/10/2026, texto dele)

Usar exatamente este texto quando ele pedir o que mandar a um corretor. A faixa e o teto de condomínio aqui são
mais apertados que os da busca (R$ 2,3 mi / ~R$ 3 mil) de propósito: "é pq eles sempre mandam coisa acima do
esperado" (dele, 02/10). A busca diária não mudou.

> Região: Vila Romana, Alto da Lapa, Vila Leopoldina, Pompeia, Perdizes, Vila Ipojuca e Vila Madalena.
>
> Não quero:
> Ruas na Leopoldina: Lauriano Fernandes Júnior, Belchior de Azevedo, Fortunato Ferraz, Nagel, Mofarrej e Matias Roxo.
>
> Faixa: Até 2,2 mi, com condomínio até uns R$ 2,5 mil.
>
> Imóvel: a partir de 115 m², 3 quartos (ou 2 se for bem amplo), pelo menos 1 vaga. Pronto para morar, com acabamento atual. Não quero nada para reformar, no contrapiso ou em obra.
>
> Prédio: de preferência dos anos 2000 para cá, com lazer (piscina e academia). Não quero cobertura, duplex nem garden.
>
> O que pesa a favor: varanda gourmet fechada com churrasqueira, ar-condicionado, escritório, closet, lava-louças e depósito na garagem.

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

**58 linhas: 15 ativos e 43 descartados** (estado publicado em 23/09/2026, versão
`2026-09-23-1`). 6 favoritos, dos quais 2 ativos (Presidente Antônio Cândido e
Tonelero 239) e 4 já descartados — a estrela fica de propósito. **Todos os 15
ativos estão como `revisado`**: o filtro "a revisar" está vazio.

Ativos, do mais caro ao mais barato: Mofarrej 706 (R$ 2,40), Dr. José Elias 227
(2,40 / 2,33 — duas unidades do Pátio das Artes), Barão do Bananal CVIA1774 (2,39),
Barão do Bananal 305 (2,30), Rua Camilo 556 (2,30), Mofarrej 706 (2,20), Rua Roma
(2,19), Itapicuru 84 (2,19), Presidente Antônio Cândido ⭐ (2,05), AXS827 (2,00),
Carlos Weber 87 (1,98), Tonelero 239 ⭐ (1,95), Coriolano 1642 (1,85) e Carlos
Weber 535 (1,80).

Descartados em 23/09 pelo link dele: Carlos Weber 663, José Elias 227 (3ª
unidade, "se gostar muito do prédio vale considerar depois"), São Geraldo 38
(Jazz Perdizes), Bartira 193, Passo da Pátria 1407, Croata 169, Rua Bergamota
(ZI293585) e o **VK212 (Martese)**, descartado logo depois de entrar, sem motivo
registrado.

**Visitas registradas:** Ponta Porã 710, descartada depois dela ("apartamento
ótimo, mas o condomínio é muito antigo"); Tonelero 239 (Via Condoti, AP2442 + QuintoAndar
894729340), visitada em 25/09/2026 às 17h: "gostamos", segue na lista como `visitado`.
Presidente Antônio Cândido (QuintoAndar 895465004 + Masfer AP86050), visitado em 26/09/2026 às
12h40: "visita boa", segue na lista com ressalvas (precisa de ajustes em móveis e cozinha).

### Em aberto

- **Rodada de 27/09/2026:** 29 ativos no ar, preços iguais. O polígono do QuintoAndar por URL não é
  confiável (numa carga respeita a área, noutra traz a cidade inteira); voltei aos bairros com
  `/2-quartos/`. Pilar: MLN030 (Pinheiros, Av. Rebouças/Oscar Freire, 2q 135 m², reformado — longe,
  lado Jardins), ZI296066 (Perdizes, Cayowaá provável, 133 m², 3 suítes, andar alto), ZAC45069
  ("potencial de transformação" = precisa reforma, cortado), LEF26219 (lançamento, renders, cortado).
  QuintoAndar (faixa estendida a R$ 1,3 mi): 894438290 (Maggiore, Nanuque, 488, 115 m², R$ 1,45 mi),
  895247073 (Concorde, Franco da Rocha, 215, 170 m², R$ 1,51 mi); os demais antigos. VivaReal
  (ids > 2914478000): 2914486821 (Fradique Coutinho, 120 m², R$ 2,18 mi), 2914546456 (Barão da
  Passagem, 142 m², R$ 1,9 mi), 2914643284 (Diana, 223 m², R$ 2,2 mi), 2914541559 (Carlos Weber,
  174 m², R$ 2,25 mi); 2914637233 = 2914292741 (já visto); o resto antigo.
  **Resposta dele: nada entra.** Os mostrados acima (ZI296066, MLN030, 894438290, 895247073,
  2914486821, 2914546456, 2914643284, 2914541559) ficam recusados; não trazer de volta.
- **Rodada de 28/09/2026:** os 21 ativos continuam no ar, sem mudança de preço. Mostrados: VivaReal
  2914743134 = QuintoAndar 895646909 (Edifício Pompéia, Rua Tucuna, 223, 127 m², 3q, 1 vaga,
  R$ 1,55 mi, cond. R$ 1.365, andar 8–11, reformado; eu tinha cortado em 24/09 sem mostrar) — **entrou na página em 28/09 a pedido dele, com os dois links**; **descartado por ele no mesmo dia: "Prédio de 1971 é antigo demais"** (referência de até onde vai a idade que ele aceita; a regra continua sendo mostrar e deixar ele julgar) (linha `pompeia-qa895646909`; o prédio é a Rua Tucuna, 132 pelo QuintoAndar, Lopes e Loft, 1971 segundo a Loft) e VivaReal
  2914738954 (Rua Bartira, 200, Perdizes leste perto da PUC, 220 m², 4q, 1 vaga, R$ 1,98 mi,
  cond. R$ 2.976, reformado, um por andar). Triados e não mostrados: Pilar PNS169 (Vila Ida/Alto de
  Pinheiros, antigo), NRE2664 (duplex), LXH6700 (Perdizes Privilege, Tucuna, 2003, acabamento
  antigo), INVR256 (Solar das Perdizes, Apiacás, 1986, madeira escura); QuintoAndar 894618696
  (Sumarezinho), 895225234 (Ásia 173, lado Cerqueira César), 895566965 (Av. Rebouças, 1 foto);
  VivaReal 2914713473 (Spazio Vernice, Carlos Weber, 457, vazio e antigo), 2914735699 e
  2914739936 (Desembargador do Vale, antigos), 2914739677 (Paraguaçu, 232 m², cond. R$ 4.800),
  2914728913 (Aimberê, 577, lustres, Sumaré), 2914739343 = 2914716231 (Barão do Bananal, 611, piso
  antigo), 2914621735 (Princeton, Raul Pompéia, 930, já recusado como 895562239), 2914686354
  (Lauriano), 2914739183 (Mofarrej). **VivaReal pediu verificação humana (Cloudflare) no meio da
  rodada**; ficaram sem fotos: 2914727318, 2914713209, 2914741351, 2914739147 = 2914716664
  (Fradique Coutinho), 2914737389 (Agissê), 2914741739 (Bianchi Bertoldi), 2914740537 (Alves
  Guimarães), 2914726337 (Mateus Grou), 2914699734 (Oscar Freire), 2914715671 (Faustolo).
- **Status "on hold" (01/10/2026, pedido dele):** "não seria visitado agora mas não queremos descartar". Não aparece na lista de disponíveis (pedido dele, 01/10): só no chip "on hold", apagado e com borda tracejada; conta à parte no topo e não entra em "disponíveis".
- **Item "Carregador elétrico" (03/10/2026, pedido dele):** novo item nos cards, último da lista de amenidades; marcar quando o anúncio citar carregador/tomada para carro elétrico na vaga ou no prédio.
- **Visitados só no próprio chip (03/10/2026, pedido dele):** como on hold, visitado não aparece na lista de disponíveis nem conta como disponível; visitado e depois descartado/vendido continua no chip de descartados/vendidos.
- **Status "vendido" (02/10/2026, pedido dele):** separa dos descartados o que foi vendido ou saiu do ar. Tem chip próprio ("vendidos"), não conta como disponível nem aparece nos descartados. Anúncio que sair do ar vai para vendido, não para descartado. AP2352 (Maramores, "negociações avançadas") também foi para vendido a pedido dele. CA32072 (Capote Valente, Pinheiros) e ZI160331 voltaram para descartado: "não estavam realmente considerados". Vendido é só para o que estava de fato na disputa.
- **Leopoldina House entra na rotina diária (01/10/2026):** "leopoldina house não é pra ficar comigo, pode fazer". Varra e trie como os outros sites (a regra abaixo, de 28/09, deixou de valer).
- ~~Leopoldina House: ele mesmo revisa a lista inteira (28/09/2026).~~ "Do Leopoldina House eu já tinha olhado todos aqui localmente. Quando perguntei de outros anúncios hoje seriam de outros sites." Não traga triagem da Leopoldina House como novidade; quando ele mandar um código de lá, o trabalho é achar o mesmo apartamento em outros sites (QuintoAndar, VivaReal, Pilar, Masfer etc.) para ter mais fotos.
- **Leopoldina House, primeira varredura (28/09/2026):** a busca dele dá 41 anúncios em 4 páginas
  (`&page=N`). O site limita o número de acessos (HTTP 429, "Rate exceeded"), e a página de busca
  pré-carrega os links dos cards e gasta esse limite. Para abrir os detalhes, saia da busca (por
  exemplo, para `/robots.txt`) e faça `fetch('/imovel/x-LHnnnn')` com uns 6 s entre as chamadas. O
  anúncio principal só aparece no HTML renderizado: os campos `Endereco`/`Empreendimento` do payload
  são dos "imóveis semelhantes". As fotos ficam em `"Codigo":"<n>","Foto":"..."`, e o `<n>` pode diferir
  do código (LH5194 usa a pasta 5195). **LH3121 = Pilar ARCO1204 = VivaReal 2900133695** (mesma varanda baixa com árvores, mesmo texto e mesmo condomínio; ele pediu o link da ARCO como principal). **Entraram como "a visitar", escolhidos por ele (primeiro marquei revisado, mas ele corrigiu: ainda não foram revisados):** LH3121
  (Maison Montparnasse, Jorge Americano, 263), LH2548 (Key West, 160 m², outra unidade) e LH5194
  (Scena, outra unidade). **Depois ele pediu também o LH5087 (Vitá, Carlos Weber, 87, outra unidade pelas fotos). E o LH5206 (Key West, 160 m², reformado; os valores são iguais aos do LH2548, mas pelas fotos é outra unidade). Triagem dos outros 36 (28/09, tarde). **Mostrados:** LH5397 (Martese, 143 m², R$ 2,39 mi; outra unidade, não o VK212), LH5503 (Doppio Alto da Lapa, 127 m²), LH513 (Pompeia, 160 m², novo), LH2442 (Reserva Alto da Lapa, 140 m², reformado; não é nenhum dos recusados em 26/09), LH5091 (Vitá, 129 m²), LH4858 (Antonieta, 160 m²), LH4397 (Pinheiros, 157 m², 1 vaga), LH4608 (Residencial Roma, 130 m²). **Repetido:** LH3143 = Baccarelli descartado (QA 895574028), agora a R$ 2,2 mi. **Cortados:** pela rua, LH5445/LH1785/LH5364/LH834 (Vila Nova Leopoldina I e II, Nagel), LH5539 (Podium) e LH5443 (Terraças, Matias Roxo); LH5335 (Chateaux de France, 138 m², provável unidade já descartada); por acabamento antigo ou vazio/obra, LH4398, LH2421, LH821, LH3096, LH1546, LH2045, LH1160, LH5384, LH2805, LH1194, LH2991, LH3855, LH1390 e LH2793; LH5119, LH3362 e LH5319 são medianos. VivaReal que tinham ficado sem foto: 2914737389 (duplex), 2914739147 (cobertura) e 2914699734 (Oscar Freire) cortados pela regra; 2914713209, 2914726337, 2914727318, 2914740537 e 2914741739 por acabamento antigo; 2914741351 é duplex (escada caracol); 2914715671 (Faustolo, 133 m², 3 suítes, R$ 1.790.100) parece ser do Atelier Aquarela, falta comparar as fotos com o AXS827.**
- **Rodada da tarde de 28/09/2026:**
  - **Mostrados, Pilar:**
    - NRE2722 = Neo Milano, Rua Coriolano, 1642: mesma cozinha da linha descartada em 24/09 porque o VivaReal 2912394750 saiu do ar. Voltou a R$ 1,80 mi, condomínio R$ 2.209.
    - ZI295930: outra unidade do Neo Milano, 126 m², 4 quartos, R$ 1,59 mi.
    - PNS180: Pedroso de Morais, 135 m², 4 quartos, 1 vaga, R$ 1,65 mi.
    - VERO1117: Rua Antônio Bicudo, Pinheiros, 121 m², R$ 2,36 mi, vazio e novo.
  - **Mostrados, VivaReal:**
    - 2914801399: Top Class, Rua Caraíbas, 135 m², 3 suítes, R$ 1,55 mi.
    - 2914774011: Rua Girassol, Vila Madalena, 148 m², 3 suítes, reformado, R$ 2,17 mi.
  - **Cortados:**
    - Pela localização: Pilar ZI295641 (Água Branca); QuintoAndar 893476542 (Oscar Freire) e 894118271 (Henrique Schaumann).
    - Por acabamento antigo: Pilar LEF45414 e TA538 (Bartira); VivaReal 2914821339 (Wanderley), 2914787033 (Fernão Dias), 2914773548 e 2914756949 (Simão Álvares).
  - Os demais VivaReal eram republicações do QuintoAndar já vistas.
- **Rodada de 01/10/2026:** os 23 ativos continuam no ar, sem mudança de preço (o Idea na Pilar está a R$ 2,15 mi, o card usa o iUrbe a R$ 1,99 mi). Faixa usada: R$ 1,55 a 2,3 mi (ontem usei 2,4 por engano).
  - **Mostrado por engano:** Pilar ZI296085 (Rua Sales Júnior, 140 m², R$ 2,15 mi) = **Pátio das Artes, 4º andar, já na lista (★)**; ele reconheceu antes de mim; confirmado pela foto da sala. Link posto como 3º anúncio no card. **Antes de mostrar código novo da Pilar em Alto da Lapa/Vila Romana, compare as fotos com os cards ativos do mesmo bairro.**
  - **Pista, sem fotos vistas (Cloudflare 429 no VivaReal):** VivaReal 2915294444 (Scena, Mário Whately, 383, 122 m², R$ 1,755 mi, cond. R$ 1.500; mesmo preço do QuintoAndar 895304182, que estava "vendido"), 2915290983 (Nanuque, 310, 127 m², R$ 1,99 mi), 2915288224 (Tucuna, 270, 126 m², R$ 1,8 mi), 2915275650 (Carlos Weber, 125 m², R$ 1,7 mi, cond. R$ 2.050). ~90 outros anúncios novos do VivaReal (maioria Lopes Prime, ids 2915171612 a 2915245872) não foram abertos.
  - **VivaReal, fim da rodada de 01/10 (liberou à tarde, bloqueou de novo depois de ~50 páginas):** 2915224789 (Catão 496, W/L R$ 1,78 mi) é **contrapiso**; 2915200553 (Cardoso de Almeida) pede modernização; 2915200062 (Pres. Antônio Cândido, 126 m²) datado. Os 40 restantes eram quase todos Lopes Prime (código REO), e o site da Lopes abre por curl com fotos: `https://www.lopes.com.br/imovel/<REO...>` (fotos em `betaimages.lopes.com.br/realestate/med/<REO>/...JPG`). **Use a Lopes em vez do VivaReal para os anúncios REO.** Resto conferido no fim da tarde: 2915190550 (Maracanã, garden), 2915176008 (Capital Federal, duplex), 2915171802 (Nanuque 155 m²) e 2915188378 (Diana, = REO1185084) datados, 2915195067 (Ministro Godói, reforma simples) e 2915173584 (Desembargador do Vale, R$ 2,3 mi) medianos, 2915175067 (Homem de Melo, 1 vaga), 2915193784 = W/L da lista (link posto). Mostrado: REO255395 (VivaReal 2915176249/2915201061; Edifício Maia, Rua Girassol, Vila Madalena, 115 m², 3 quartos com 1 virado escritório, 1 suíte, R$ 1,95 mi, cond. R$ 2.300, IPTU R$ 399; acabamento atual; **recusado por ele: prédio de 1985, Rua Girassol, 464**, sem porteiro 24h nem gerador pela Loft). Datados ou medianos: REO1111173 e REO281204 (Iperoig), REO1123202 e REO32880 (Coriolano), REO1185084 (Diana), REO1191251 (Cayowaá), REO246478 e REO309190 (Miranda de Azevedo), REO405271 (Apinajés), REO888460 (Wanderley), REO904719 (Carlos Weber 172 m²), REO1150626 (Carlos Weber 117 m², R$ 2,1 mi), REO1039332 (Raul Pompéia 146 m²). REO1110423 (Pinto Gonçalves, 137 m², R$ 2,2 mi, cond. R$ 2.600) = provavelmente o Pinto Gonçalves 85 de 140 m² já visto em 23/09. Faustolo 118 m² (REO255777/703482/1072742) = prédio do 2915104543 recusado em 30/09. Sem fotos na Lopes: REO1034652, REO1157945, REO1165318, REO1185062, REO1192328, REO742443.
  - **Leopoldina House (01/10, primeira rodada feita por mim):** busca dele sem Pinheiros, R$ 1,55–2,3 mi, 115 m²+, 2+ dormitórios, com Perdizes: 39 códigos, 8 inéditos. Mostrados (endereço não sai do HTML; o `Endereco`/`Empreendimento` do payload é dos semelhantes): LH2213 (= **Living Grand Wish, Rua Froben, descartado**, QuintoAndar 895343441; ele reconheceu; confirmado pela varanda; link posto no card descartado), LH3703 (= Cyrela Grand Mond, na Lauriano; ele cortou: "não vamos considerar"), LH5193 (= QuintoAndar 894651595, Sonare, Rua Dardanelos, 488) e LH3818 (Le Rêve, Rua Cuevas, City Lapa, 2023; geocodifica em Vila Anastácio) **entraram como a visitar a pedido dele**. Cortados: LH4116 (em construção), LH5064 (datado), LH4269 (Perdizes, vazio, R$ 2,05 mi por 115 m²) e LH2041 (Perdizes, 138 m², 1 suíte e dependência, prédio antigo).
  - **Fotos conferidas depois (01/10, VivaReal liberou):** VivaReal 2915294444 (Nortelar) = **Scena QuintoAndar 895304182** ("vendido" na página): mesma sala (parede 3D branca, estante de madeira com vidro, piso de mármore) e mesmo texto (ar na sala e nos 3 quartos, som embutido), mesmo preço R$ 1,755 mi; ou seja, não foi vendido, trocou de anúncio. **Reativado por ele em 01/10 como a visitar**, com o VivaReal como link principal e o QuintoAndar como 2º. 2915290983 (Nanuque, 310 = Condomínio Doppio, 127 m², R$ 1,99 mi): moderno, varanda envidraçada com churrasqueira; provavelmente o LH5503 de 28/09. 2915288224 (Tucuna, 270): datado, cortado. 2915275650 (Carlos Weber, 125 m², R$ 1,7 mi): piso de madeira, planejados, acabamento mediano.
  - **Cortados:** Pilar GR2697 (= VivaReal 2915160636, Tavares Bastos 697) e ZI295441, LEF45393 (acabamento datado), ZI279219 (Bartira, cond. R$ 3.800); QuintoAndar 895574180 (Harmonia, duplex), 895644317 (Memphis, Pinheiros) e 4 em Pinheiros; Atelier Galeria 2915289490 (Roma, já descartado); Raul Pompéia 930, Belchior 156, Mário Whately/Franco da Rocha/Turiassu/Paraguaçu/Apinajés (cond. alto ou 200 m²+). Masfer: nada novo.
- **Rodada de 30/09/2026:** VivaReal 2914962877 (Lopes Triunfo, R$ 2,15 mi) = W/L da lista (QuintoAndar 894667976, R$ 2,185 mi). **Erro meu:** chamei de outra unidade comparando sofá e cozinha em miniatura; ele perguntou e as fotos maiores bateram (painel cinza com LED na suíte, espelho redondo do lavabo, escritório com dois monitores). Compare pontos fixos em tamanho legível, nunca móveis. Os 23 ativos continuam no ar, sem mudança de preço. O classificado QuintoAndar 114560281 (Key West, 169 m²) saiu do ar, mas o Loft do mesmo imóvel continua (R$ 1,802 mi).
  - **Mostrados:** 2915086210 = 2915086211 (Terrarium Perdizes, Rua Cotoxó, 1055, 122 m², R$ 2,17 mi); Pilar ZI295702 (Rua Baumann, 125 m², R$ 1,97 mi, acabamento datado); 2915096889 (Rua Paris, Pompeia, 120 m², R$ 2,3 mi); 2915098643 = 2915065640 (Barão da Passagem, 142 m², R$ 2,1 mi); 2915104543 (Faustolo, Paulo Mauro, 118 m², 2 quartos, R$ 1,89 mi).
  - **Segunda passada (30/09, tarde):** Pilar NRE2625 (Key West, 168 m², R$ 1,75 mi, acabamento antigo; provavelmente o mesmo do VivaReal 2915107475) e ZI294256 (Tucuna, 156 m², datado) cortados; ZI274385 (Jurandá, garden) cortado. VivaReal: Newcore e Imobz republicaram em massa (Ecos Vila Madalena é contrapiso; Terrazzo e Monte Alegre 662 = QuintoAndar já triados; Mofarrej fora). Sem fotos vistas, porque o Cloudflare do VivaReal bloqueou: 2915160636 (Tavares Bastos, 697, 130 m², R$ 1,685 mi), 2915149408 (Praça dos Pinheiros, Antônio Borba, 124 m², R$ 1,799 mi), 2915137367 (Girassol, 713 = QuintoAndar 893655350, 155 m², R$ 2,325 mi), 2915155005 (Outeiro dos Pássaros, Pres. Antônio Cândido, 126 m², R$ 2,399 mi).
  - **QuintoAndar, varredura completa (30/09, noite; ~870 cards com "Ver mais" nos 7 bairros, 116 na faixa, 19 inéditos):** publicado hoje só o 895385049 (Edifício Belmonte, Rua dos Aliados, 150 m², R$ 1,95 mi; taco antigo, datado). Cortados também: 895733961 (Skyline, Bergamota, datado), 895189649 (Le Millesime, datado), 895599486 (High Society, Bergamota, provavelmente o descartado de 147 m²), 895440335 (Villa Marchetti, Av. Mercedes, provavelmente o descartado de 180 m²), coberturas/duplex/garden (895616599, 895426878, 895348253, 895362373, 893280838, 895239366), Lauriano (894919797), MaxHaus (895186469), Pinheiros e Alto de Pinheiros (894137166, 895545651, 894651595), Toulouse (894862713), Rosa F Mauro (895430014), Flora 2q (895252177). **Faixa usada nas buscas de 30/09 foi 2,4 por engano; o teto é 2,3.**
  - **Resposta dele (30/09): nenhum dos mostrados entra** (Terrarium Perdizes 2915086210/2915086211, Pilar ZI295702, Rua Paris 2915096889, Barão da Passagem 2915098643/2915065640, Faustolo 2915104543). Não trazer de volta.
  - **Voltaram:** VivaReal 2915113144 = **AX396** descartado (Atelier Galeria, R$ 1,998 mi, antes R$ 2,2 mi). **Erro meu de novo:** chamei de quarta unidade; ele reconheceu pelos quadros. Nas fotos, quadros e estantes são pontos fixos melhores que sofás e poltronas, que mudam de lugar entre sessões de fotos. VivaReal 2914961852 (Via Condoti, 149 m², R$ 1,699 mi) = QuintoAndar 895664086 descartado, confirmado pela foto da sala de jantar; **reativado a pedido dele** (a revisar), com o VivaReal como link principal e valor R$ 1,699 mi e 2915100350 (Park View, Itapicuru, 801, 128 m², R$ 2,3 mi; descartado em 20/09 por ter saído do ar).
  - **Cortados:** Pilar ZI295853 e ZI295955 (Franco da Rocha, acabamento antigo), MO1859 (Purpurina, prédio antigo); VivaReal 2914933146 (Bela Aliança, contrapiso), 2915019546 (Airosa Galvão, o anúncio diz Barra Funda), 2915083167 (Casa das Caldeiras, outra unidade, Água Branca), 2915015613 (Belchior de Azevedo), 2915107475 (Key West, 168 m², acabamento antigo), 2915098188 e 2915082774 (Camândulas), Lincoln Albuquerque e Toulouse (condomínio de R$ 4 a 5,5 mil); QuintoAndar 895406378 (Desembargador do Vale), 895745054 (Toulouse), 895248581 (garden); VivaReal 2915030171 (Doutor José Elias, 528, garden, disse ele) 2915022869 (Lacerda Vergueiro, 479 = QuintoAndar 895535873, já triado em 24/09) e 2915015886 (Mota Pais = QuintoAndar 895619368, recusado em 26/09: eu mostrei de novo sem cruzar o "Código do anunciante" do VivaReal, que é o id do QuintoAndar; ele pediu para adicionar, soube que já tinha recusado e mandou tirar: **o que ele já descartou ou recusou não entra, nem a pedido na hora; avise antes**). Masfer: nada novo.
- **Rodada de 29/09/2026:** os 26 ativos continuam no ar, sem mudança de preço.
  - **Pilar:** MLN033 (Jardim América, precisa reforma) e CLI406 (Alto de Pinheiros, Lindenberg clássico) cortados.
  - **QuintoAndar:** 893546846 (Turiassu, R$ 1,3 mi), 893680769 (Monte Alegre, condomínio R$ 3.900) e 894316762 (Smart Vila Madalena, duplex) cortados.
  - **Masfer:** nada novo.
  - **VivaReal:** enxurrada de republicações durante a noite.
    - Repetidos: 2914881878 = ECLAT478 descartado (Rua Fábia, 141 m², condomínio R$ 1.300); 2914847269 = AXS827 (Faustolo, R$ 2,0 mi, condomínio R$ 1.393); Jorge Americano = unidades do Montparnasse já vistas; Raul Pompéia 146 = Princeton; Navarro de Andrade 135 = PNS180; Luís Augusto de Queirós Aranha 224 = CLI406.
    - Mostrados: 2914880286 (Rua Tito, garden de 129 m² + jardim, R$ 2,35 mi; outra unidade, não o AXS884; recusado: ele não quer garden), 2914881245 e 2914890362 (Caraíbas), 2914891537 (Ministro Godói), 2914890139 (Minerva: **erro meu, é contrapiso**, ele reclamou: "não deveria ter vindo"; a regra do piso já existia), 2914894442 (Cotoxó), 2914901217 (Caiubi), 2914904330 (Doutor José Elias, 157 m²), 2914882376 (João Ramalho), 2914882778 (João Moura), 2914917807 (Carlos Weber, 130 m², Paulo Roberto Leardi; ele achou que já tinha passado, mas não bate por fotos com ZI288619, ZI278746, ZI281608, QA 895135147, DMH010, DMH028, NK318236 nem ARCO940), 2914918005 (Pinheiros, sem endereço).
    - Cortados por acabamento antigo: Fradique Coutinho, Mourato Coelho, João Ramalho 157 e 123 (2914880904), Coronel Melo de Oliveira, Apinajés, Gomes Freire e Caraíbas 2914912162.
- **Erro meu, 29/09/2026:** disse que o VivaReal 2914917807 (Carlos Weber, 130 m²) não era o Vitá, comparando a quadra (cor diferente) e o deck da piscina externa. Ele corrigiu: "é exatamente a mesma piscina e academia"; os três (Masfer AP86113, LH5087 e esse) são Vitá. **Para identificar o prédio, compare a piscina coberta, a academia e o salão, que mudam pouco; quadra e deck são repintados ou trocados.**
- **Presidente Antônio Cândido (visitado, favorito): contato direto com o proprietário (29/09/2026).** Sem corretagem, dá para negociar. Nos detalhes do card estão as simulações de R$/m² para R$ 1,80, 1,85, 1,90 e 1,95 mi (150 m²) e o líquido equivalente sem os ~6% de corretagem (~R$ 1,93 mi).
- **Outras unidades à venda no Palazzo Dell Arte (Rua Presidente Antônio Cândido, 350), levantadas em 29/09/2026 para a negociação:**
  - O prédio tem unidades de 146–150 m², todas com 3 suítes.
  - **O apartamento dele** aparece também, confirmado por ele, como VivaReal 2888962586 (diz 4 quartos, 12º andar, R$ 2,049 mi, condomínio R$ 2.500), 2908652619, 2911436415 (texto igual ao do QuintoAndar), 2891648395 (12º andar) e 2893148094 (R$ 2,0 mi): são 7 anúncios com o QuintoAndar e o Masfer. **O VivaReal 2902413450 (15º andar) é outra unidade**, apesar do condomínio de R$ 2.955 e do IPTU de R$ 1.091 iguais.
  - **Outras unidades, pelas fotos** (agrupamento provável):
    - QuintoAndar 895567132: 147 m², 12º–15º andar, **R$ 1,90 mi**, condomínio R$ 2.950.
    - VivaReal 2913941747 = 2913941748 (YK Private): sofá estampado, cadeiras cinza; R$ 2,03 / **1,96 mi**; condomínio R$ 2.238. (Eu tinha juntado o 2908652619 aqui por engano: aquele é o apartamento dele.)
    - Pilar ZI286540 = VivaReal 2870239819: 146 m², hall privativo, **R$ 1,95 mi**, condomínio R$ 1.900; talvez também o 2898888908 (R$ 2,05 mi).
    - VivaReal 2901663428: 14º andar, **R$ 1,95 mi**, condomínio R$ 2.000.
    - VivaReal 2825707942: **R$ 1,97 mi**.
    - VivaReal 2732596241 / 2777503716: **R$ 1,97 mi**; talvez = 2803530433 (R$ 1,899 mi, informado como número 330).
  - Faixa pedida pelas outras unidades: R$ 1,90–2,03 mi, a maioria perto de R$ 1,95–1,97 mi. **Opinião dele: as outras unidades "não estão legais"** (acabamento e decoração inferiores); servem só como referência de preço.
- **Via Condoti 149 m² (QuintoAndar 895664086 = Pilar SEP21192) descartado em 26/09/2026:** o Tonelero 239
  visitado no mesmo prédio é muito melhor. Outras unidades do Via Condoti só valem se forem claramente
  superiores ao AP2442.
- **Entrou em 26/09/2026, achado por ele:** classificado QuintoAndar 114560281 (Key West, Rua Nanuque,
  473, 1995, 169 m², R$ 1,802 mi, Leopoldina House).
- **26/09/2026:** QuintoAndar 895664086 = Pilar SEP21192 (Via Condoti, 149 m², andar alto, R$ 1,8 mi) entrou a
  pedido dele. O classificado QuintoAndar 130765686 é o Tonelero 239 visitado (fotos) e virou `link3`
  dele. Links `/classificado/<id>` do QuintoAndar são anúncios de terceiros (Imobz etc.); as fotos
  vêm no `__NEXT_DATA__` como `quintoandar.com.br/img/v2/photo/navent_houses:...`.
- **Entrou em 26/09/2026 a pedido dele:** QuintoAndar 893808605 (Itaguá, Rua Luís Martins, 25, 1989,
  200 m², 1 por andar, R$ 1,58 mi). Eu tinha cortado pelas fotos na lista do polígono.
- **Entrou em 26/09/2026 a pedido dele:** QuintoAndar 894667976 (W/L Vila Romana, Rua Catão, 496, Tecnisa,
  2024, 132 m², 3 suítes, R$ 2,185 mi). Eu tinha cortado na triagem de 24/09; ele achou que já tinha
  visto, mas não estava nos descartados (conferido pelas fotos contra CCMG083, FIKA5854, ZI288619).
- **Entrou em 26/09/2026, escolhido por ele:** QuintoAndar 895738361 (Jardins de Monet, Rua Passo da
  Pátria, 971, 2005 pela Loft, 151 m², 3 suítes, R$ 2,3 mi). Estava na lista de "cortados só por mensal"
  de 25/09 (mensal R$ 5.200).
- **Busca do QuintoAndar que ele mandou em 26/09/2026 (polígono Leopoldina–Lapa–Pompeia, 2+ quartos,
  120+ m², 1+ suíte, 1-3 vagas, até R$ 2,4 mi):** o contador diz 877, mas a lista carrega só 187 e
  para; testado por faixa de preço, o resto são sugestões fora da área. Faixa de preço na URL só
  funciona com valores redondos (`de-1650000-a-1800000`); com `1600001` ela perde o polígono.
  119 nunca registrados; 104 sem cobertura/duplex. Mostrados: 895562239 (Princeton, Raul Pompéia,
  930), 895428427 (Reserva Alto da Lapa, Sacadura Cabral, 160), 895289113 e 895393639 (Rua Croata,
  169/157), 895412761 (Personal Home, Carlos Weber, 499), 894118175 (Coline de Nice, Oscar Caravelas,
  334); 2 quartos: 892914307 (Ribeiro de Barros, 2016), 895739843 (Rua Aurélia, 1851), 895182469
  (Plátano, Escultores, 597, 2002). Atelier Aquarela 895630070 e 895731546 são outras unidades do
  prédio do AXS827 (fotos). Dolce Vita 895361898 é provavelmente o AXS884 da página.
  **Resposta dele: nenhum desses entra** (só o 895738361, que ele mesmo escolheu da lista). Não trazer
  de volta os mostrados acima.
- **Busca da Pilar que ele mandou em 26/09/2026:** mapa com `h3Ids=87a8100cdffffff,87a8103b6ffffff,87a8103b0ffffff,87a8103b4ffffff,87a8103b2ffffff,87a8103b5ffffff`,
  `maxAskingPrice=2400000&minArea=120&bedrooms=2&suites=1&parkingSpots=1&propertyTypes=duplex,cobertura`
  (sem piso de preço). 247 anúncios; 181 nunca registrados. Varredura com "Ver mais" no navegador; o
  CDN de imagens bloqueou (429) depois de ~500 fotos e as fotos vieram direto do S3
  (`blintz-properties-sandbox.s3.amazonaws.com/<CÓDIGO>/pilar-homes-images-watermark/...`, que é o
  `watermarkUrl` da página). Mostrados: MRP268 (Pompeia, Rua Novais Junior, 158 m², 2008), ZI293631
  (Perdizes, Rua Tucuna, 154 m²), AEI5638 (Vila Leopoldina, Aliança Liberal, 189 m², 2011),
  SEP21083 (= **AX396, já descartado na página**: mesmas fotos, R$ 2,2 mi, cond. R$ 2.400; eu não
  cruzei m² + preço + condomínio com os descartados; a célula é a do ZI161755, Rua Roma, e não a
  Jeroaquara como a geocodificação reversa sugeriu; LAP3292, ZI287276 e ZI268545 são outras unidades
  de 162 m² do mesmo prédio), NK317636 = AX397 (Alto da Lapa, Rua
  Votupoca, 167 m², 2 quartos, 2012), ZI283956 = VB27161 = OI1071 (Alto da Lapa, Rua Filipinas,
  144 m², 2 quartos). AEI5304 cai na Lauriano: cortado. Vila Anastácio de 127 m² (ZI294411,
  INVR238, ZI285603, LEF45099) é Caminhos da Lapa/Fortunato Ferraz: fora. IEF262 (Lapa, Rua Tito
  provável, 177 m², 4 quartos/3 suítes, R$ 2,15 mi, 2011) passou nas fotos e eu deixei de fora só
  para encurtar a lista; ele perguntou por ele. É o Idea Vila Romana (Rua Catão, 804, 2010/11), no
  quarteirão do ZI289918 recusado pela localização. Os três (IEF262, ECLAT478, ZI248983) entraram na
  página em 26/09 a pedido dele.
  **Ele questionou dois que eu cortei só pelo R$/m²:** ECLAT478 (Vila Romana, Rua Fábia provável,
  141 m², 3 suítes, 2 vagas, R$ 2,35 mi, R$ 16,7 mil/m², mensal R$ 2.300) e ZI248983 (Pompeia, Rua
  Padre Chico provável, 123 m², 3 quartos/1 suíte, 3 vagas, R$ 2,3 mi, R$ 18,7 mil/m²). Lição: até
  R$/m² não é critério de corte; mostre com o valor em destaque.
- **Recusados em 26/09/2026 ("dos de hoje nada que valha adicionar"):** QuintoAndar 895178621
  (Terraças Alto da Lapa), 895635190 (Terrazzo vazio), 895448721 (Mar das Caraíbas), 895560323 (Noble
  Hills), 895744947 (Maresias), 893295712 (Azaleia), 895062508 (Santa Martin), 895467216 (Fidalga),
  895212704 (Essencis), 894606873, 895325547 (Paulistânia); Pilar ZI294865; VivaReal 2914354365,
  2914478641 (Kayowá), 2914070442 (Terrazzo mobiliado). Não trazer de volta.
- **2 quartos recusados em 26/09/2026 ("não são legais"):** QuintoAndar 895576748 (Horizon, 2021),
  894878773 (360 Graus, 2013; as outras unidades 894979476 e 894705105 vão junto), 895129605 (Upcon
  Blue, 2016) e 895619368 (Rua Mota Pais). Não trazer de volta. Motivo não dito; os quatro eram
  plantas de 124-138 m² em prédios novos, decorados. Os 2 quartos que ele aceitou são maiores ou
  achados por ele (Tribeca, Medley, Ilha de Creta, Saint Patrick).
- **Pilar CVIA1927 (26/09/2026, ele perguntou por outros anúncios):** Edifício Saint Patrick, Rua
  Monte Alegre, 634 (Perdizes leste, lon −46,668, perto da região do Itapicuru que ele achou
  longe), 1995; 179 m², 3 quartos viraram 2 suítes, 3 vagas, R$ 1,95 mi, cond. R$ 4.500 +
  IPTU R$ 1.500. = VivaReal 2871069578 (Sh Prime, R$ 2,04 mi, cond. R$ 4.300, 16 fotos), mesma
  unidade pelos pontos fixos (cozinha com azulejo azul, painel de madeira no quarto, deck na
  varanda). O QuintoAndar 894505489 (Saint Patrick, 177 m², 3 suítes, R$ 1,95 mi) é outra
  unidade, decoração clássica. Entrou na página em 26/09 com os dois links.
- **Entraram em 26/09/2026, achados por ele:** Medley (Chaves na Mão 31183234, Rua Cayowaá, 2200,
  2015, 130 m², 2 suítes, vazio mas com travertino instalado) e Ilha de Creta (Ingrácia, Rua
  Croata, 622, 2009, 115 m², 2 suítes). Nenhum dos dois tem outro anúncio achado. O Ilha de Creta
  tem mais 4 unidades à venda, todas outras pelas fotos (ver `detalhes` do card).
- **Entraram em 26/09/2026:** West Side (QuintoAndar 895563249, 1987) e Tribeca Personal Club
  (Villalobos AP4101, Rua Vespasiano, 445, 2008, 2 quartos/120 m², achado por ele; divisa com o
  Bairro Siciliano). A Villalobos (Kenlo, sufixo -VILQ) tem o nome do prédio no campo
  `"building"` do HTML. VivaReal 2913290114 (Rodrigo Lobato, 111, 120 m², R$ 1,97 mi) é outra
  unidade, vazia e nova.
  Outro anúncio do AP4101 não achado em 26/09: o QuintoAndar não tem venda no Tribeca (só um
  aluguel de 120 m²/3 quartos, 895470530), a Pilar não tem nada a 400 m, e os VivaReal de 120 m²
  da Rua Vespasiano (2902643937, 2888169392 = 2888169623 = 2888168819, 2902652212, 2908352625)
  são outras unidades pelas fotos. A planta original do Tribeca é de 3 quartos; o AP4101 deve ter
  sido convertido para 2.
- **Rodada de 26/09/2026 (manhã).** Ativos: os 19 no ar, sem mudança de preço (Pilar
  NRE2512 marca R$ 2,40 mi, o card R$ 2,398 mi pela Maramores). Pilar do dia: ZI295985 =
  CCI839 descartado (mesmos 130 m², R$ 1,69 mi, cond. 2.449); LEF30211 e LEF16862 (2 quartos,
  R$ 18-19 mil/m², caros); GR2670, LEF8290 (antigos por dentro); ZI294865 mostrado.
  QuintoAndar (8 bairros, 3 e 2 quartos): 44 inéditos. Mostrados: 895178621 (Terraças Alto
  da Lapa, 2010; mesmo prédio e planta de 142 m² da linha "Rua Matias Roxo, 100" descartada
  por sair do ar em 19/09, mas outra unidade pelas fotos: aquela era 7º andar com parede de
  pedra, esta é 16º-19º com paredes escuras; rua excluída da busca em 28/09), 895563249 (West Side, 1987; duplex de 172 m², 8º a 11º, mobiliado; outro anúncio não achado em 26/09: Pilar sem nada a menos de 600 m, nenhum dos 6 VivaReal de 167-174 m² da rua bate pelas fotos), 895448721 (Mar das Caraíbas, 1997),
  895635190 (Terrazzo, 2010), 895560323 (Noble Hills, 2006), 893295712 (Azaleia, 1995),
  895062508 (Santa Martin, 1994), 895467216 (Fidalga, 1999), 895744947 (Maresias, 1996);
  2 quartos: 894705105/894878773/894979476 (360 Graus, 2013), 895576748 (Horizon, 2021),
  895129605 (Upcon Blue, 2016), 895212704 (Essencis, 2015), 895619368 (Mota Pais),
  894606873 (Homem de Melo), 895325547 (Paulistânia, ano não achado). 895697434 (Le Havre,
  153 m², R$ 2,38 mi) é provavelmente a linha Le Havre da página. 895411856 (Domna, 120 m²,
  R$ 1,785 mi) é provavelmente o ECLAT162 que ele mandou ignorar. MaxHaus 895364948 cortado.
  Os demais inéditos ficaram pelas fotos.
  **VivaReal (tarde de 26/09, 8 bairros, `quartos=2,3,4&areaMinima=115&precoMinimo=1550000&precoMaximo=2400000&ordem=MOST_RECENT`):**
  178 anúncios; triados os 2914xxxxxx inéditos e sem gêmeo no QuintoAndar. Mostrados: 2914354365
  (Vila Leopoldina, 158 m², 4 quartos, R$ 2,4 mi, endereço oculto, ano não achado), 2914478641
  (Residencial Kayowá, Rua Cayowaá, 854, 1990, 129 m², R$ 1,74 mi), 2914070442 (Terrazzo, Piracuama,
  377, 2010, 130 m², R$ 1,88 mi; outra unidade que a 895635190). 2914122983 (Av. Mofarrej, 1130) é
  MaxHaus: cortado. Os demais 2914 ficaram pelas fotos (acabamento antigo). Os 2913xxxxxx da lista
  não foram revistos (quase todos já passaram em 23-25/09 ou espelham o QuintoAndar).
  **Masfer:** AP84850 (Maison Mont Parnasse), AP85570 (Torre Tim Maia, contrapiso), AP85653
  (Maresias), AP85782 (Gaudi), AP85940, AP85956 (Caiubi "Chocolatão"): todos vazios, piso antigo
  ou cru; nenhum mostrado.
- **QuintoAndar 895574028** (Baccarelli's House, Rua Húngara, 126, Vila Ipojuca, **1991**;
  154 m², 4 quartos/2 suítes, 3 vagas, 12º a 15º, R$ 2,0 mi, cond. R$ 1.900 + IPTU R$ 990,
  mobiliado, reformado com painéis de madeira): eu tinha cortado na triagem de 24/09 sem
  mostrar (prédio antigo). Ele achou sozinho em 26/09 e pediu outro anúncio: **VivaReal
  2628592669** é a mesma unidade pelas fotos (R$ 2,3 mi, 15 fotos, "3 suítes"). O VivaReal
  2692010553 (R$ 1,45 mi) é outra unidade do prédio, acabamento antigo. Entrou na página em
  26/09 como "a revisar", com os dois links.
- **Exploração em Campinas (26/09/2026), só curiosidade, nada entrou na página:** QuintoAndar
  (novos-ou-reformados, 3+ quartos) em Cambuí, Nova Campinas, Taquaral e Guanabara, mesmos
  critérios de preço e metragem; a Pilar tem só 1 anúncio na cidade. ~70 na faixa. Os de
  200-570 m² por R$ 1,6-2 mi são prédios dos anos 1980-90. Destaques mostrados: 895429981 e
  895683362 (Rua Cel. Francisco Andrade Coutinho, 126 m², provavelmente Yard Cambuí 2025),
  895128371 (Alto Cambuí, ~2021), 895579445 (Sartoria Taquaral, 2021), 895677948 (Splendor
  Patriani, Taquaral); vazios novos: 895299836 (Yard, 2025), 895376468 (Aura, 2025),
  Vestra Cambuí (7 unidades 895306xxx, preço de incorporadora). R$/m² dos novos parecido com
  o de SP (R$ 14-17 mil); o que cai é o condomínio.
  Ele respondeu que R$/m² igual ao de SP não interessa, queria **R$/m² menor**. Segunda
  passada nos maiores (140-230 m², acabamento atual): 895234298 (garden, Jardim Brasil,
  228 m², R$ 2,1 mi, ~R$ 9,2 mil/m²), 895603119 (Cambuí, 230 m², reforma de arquiteto,
  R$ 2,4 mi), 895313154 e 895236004 (Helbor Privilege Liceu, 155-157 m², R$ 1,62-1,69 mi),
  895472710 (Harmonie, Nova Campinas, lançado 2021, 206 m², R$ 2,3 mi), 894905534 e 895666387
  (Helbor Arthouse Double Sky, 2017, 189 m², R$ 2,3 mi). Os de 300-450 m² a R$ 4-5 mil/m²
  são todos de acabamento antigo.
- **Exploração em Jundiaí (26/09/2026), só curiosidade:** QuintoAndar, cidade inteira
  (295 anúncios de 3+ quartos novos ou reformados; piso de preço baixado para R$ 1 mi para
  ver a faixa). R$/m² bem menor: R$ 5-10 mil nos grandes. Destaques mostrados: 893096911
  (Naturale Sport Acqua Life, Jd. Flórida, 240 m², R$ 2,1 mi, ano não achado), 895154029
  (Maison D'Or, Centro, 220 m², R$ 2,2 mi, prédio ~1998), 894926511 (cobertura duplex, Res.
  Anhanguera, 246 m², R$ 2,24 mi), 895200010 (Anhangabaú, 220 m², R$ 2,04 mi; mensal do
  anúncio errado), 895469262 (Campos Elísios, 2010, 159 m², R$ 1,63 mi); baratos com cara de
  reformado: 894645256 (Centro, 205 m², R$ 1,15 mi), 894097490 e 893984282 (coberturas
  duplex vazias, 190-194 m², R$ 1,2-1,4 mi).
  **Decisão (26/09/2026): não gostou das opções de Campinas e Jundiaí, a busca segue só em
  SP.** Não trazer outras cidades de novo sem ele pedir.
- **QuintoAndar 895304182** (Scena Alto da Lapa, Rua Mário Whately, 383; 122 m², 3 suítes,
  2 vagas, 4º a 7º andar, R$ 1,755 mi, cond. R$ 1.500 + IPTU R$ 1.000; no ar desde 25/09): ele pediu
  outro anúncio porque as fotos confundem (só ~9 das 44 são da unidade: sala com tapete
  colorido, cozinha de marcenaria azul, quarto com cabeceira ripada, banheiro de madeira; o resto
  é área comum). Nenhum outro anúncio encontrado em 25/09: não é Pilar PR7569, AEI2602/LEF45174
  nem ZI288828 (vazio, branco), nem os VivaReal de 122 m² da rua (2575744605, 2879598521,
  2870987312, 2873712076, 2884495420, 2881220782, 2884795810). Entrou na página em 25/09 só com o link do QuintoAndar
  ("depois eu avalio"). O VivaReal 2884495420 (Scheid Prime, R$ 1,855 mi, 13 fotos) ficou
  sem conferência completa: ele perguntou se é o mesmo, a checagem foi interrompida.
- **Mostrados em 25/09 na revisão do mensal, sem resposta:** Pilar ZI288930, CCI839 (na página desde 25/09;
  Rua Coronel Melo Oliveira, 1998),
  MO2775 (= QuintoAndar 895548362, Arua, Rua Cajaíba, 335; na página desde 25/09 com os dois links), ZI292401 (= QuintoAndar 895581949, Botticelli,
  mesma unidade pelas fotos; virou `link2` do card), LEF41956, FOX27238, ZI282648;
  QuintoAndar 895432515 (Jerivás; = Pilar H2U253, mesmas fotos, R$ 1,95 mi no QuintoAndar e
  R$ 2,05 mi na Pilar; entrou na página em 25/09 com os dois links), 895368369 (Reserva Caminhos da Lapa), 895700504
  (Lumiere), 895581949 (Botticelli, Rua Apinajés, 640, 2008) e 895563348 (Residenziale Amalfi, Rua Princesa Leopoldina, 595, 2004), os dois na página desde 25/09, 895152224
  (Isabella de Aragon), 895684113, 894927461 (Design Perdizes), 895635043; VivaReal
  2913942356. O QuintoAndar 895659214 (Madero, R$ 2,39 mi, 151 m²) é provavelmente o
  CVIA1774 da lista: confirmar pelas fotos e virar `link2`.
- **Mostrados em 25/09/2026, sem resposta:** QuintoAndar 893560573 e 895675514 (Pateo
  Barra, Rua Norma Pieruccini Giannotti, 665, Barra Funda, 2016); 894946170,
  895461052, 895492002, 895525962, 895623821 e 895699692 (Caminhos da Lapa Jerivás,
  Rua Fortunato Ferraz, 250, ~2020 pela Loft); VivaReal 2914129567 (Riservato, 143 m²,
  R$ 2,05 mi, terceira unidade do prédio) e 2914170335 (Rua Barão do Bananal, 123 m²,
  3 vagas, R$ 2,16 mi: outra unidade que não a Barão 305 da lista, pelas fotos); Pilar
  ZI293158 (Perdizes, Cardoso de Almeida provável, 157 m²), SEP21192 (Via Condoti,
  Rua Tonelero, 149 m², 3 suítes, R$ 1,79 mi), QU987 (Benedito Pinheiros, 2020,
  divisa com Jardins) e, com 1 vaga, ZI293979 (Rua Cayowaá) e NRE1460 = ZI287183
  (Rua Apiacás, 387, mesma unidade em dois códigos).
- **Via Condoti no QuintoAndar (894729340) = Tonelero 239 (Maramores AP2442)**,
  confirmado pelas fotos em 25/09 e ligado como `link2`.
- **Anúncios repetidos já resolvidos (24–25/09), para não mostrar de novo:** Mark
  (QuintoAndar 894545710) = Pilar CCMG047, descartado ("tamanho dos quartos"), virou
  `link2`. Atelier Aquarela (QuintoAndar 895567050) = Pilar AXS827, ativo (`id:
  axs827-133`). Riservato 147 m² (Rua Camândulas, 112; Rossi, 2009): VivaReal
  2913927469 = QuintoAndar 895006981 = VivaReal 2877473184 = Pilar VK178 = VivaReal
  2914129567 (este último mandado por engano como "terceira unidade" em 25/09) (R$ 2,13 mi,
  cond R$ 1.900 + IPTU ~R$ 800), confirmado pelas fotos. Riservato 143 m² do 4º–7º
  andar (QuintoAndar 895627218) é outra unidade, sem outro anúncio encontrado.
- **Resposta de 25/09:** entraram duas unidades do Caminhos da Lapa Jerivás
  (QuintoAndar 895623821 = Pilar LEF45175, e 894946170). O 895525962 (3 suítes, 3 vagas,
  R$ 2,149 mi, 24º–27º andar, só 5 fotos) não tem outro anúncio: conferido em 25/09 contra
  os 6 do Jerivás na Pilar (LEF45175, H2U253, H2U254, AEI4884, AXS1082 = QuintoAndar
  895699692, AEI3735) e a página do condomínio no VivaReal. Ele é diferente do
  895492002, também do 24º–27º (piso de madeira contra porcelanato).
- **Visitas agendadas:** Tonelero 239 (Via Condoti, Maramores AP2442) em 25/09/2026 às
  17h e Presidente Antônio Cândido (Palazzo Dell Arte) em 26/09/2026 às 12h40. Status
  `agendado` publicado na versão `2026-09-25-2`. Depois da visita, esperar o link `#s=`
  com o que ele corrigiu.
- **Casa das Caldeiras saiu do ar em 25/09** (QuintoAndar suspenso); descartada no
  estado publicado, versão `2026-09-25-1`. Ativos: 21 (entraram as duas do Jerivás e o Edifício Paula, Rua Apiacás, 387: Pilar NRE1460 = ZI287183, prédio de 1974, adicionado a pedido dele com o ano sinalizado).
- **Regiões da busca da Pilar:** o link que ele mandou tinha Alto de Pinheiros e
  Sumarezinho e não tinha Alto da Lapa nem Vila Ipojuca. Perguntado em 25/09.

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
- Notas dos cards do Pátio das Artes AP2388 e "até 3º andar" removidas (29/10, pedido dele; 2026-10-29-1).
