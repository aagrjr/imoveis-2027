# Contexto da busca

Documento de handoff: o que não dá pra deduzir lendo o código.
Atualizado em 2026-08-26.

## O que estamos procurando

Apartamento para compra em São Paulo, zona oeste. Perfil que emergiu da lista:

- **Bairros:** Vila Leopoldina, Alto da Lapa, Vila Romana, Perdizes, Vila Ipojuca
- **Faixa:** R$ 1,55 mi a R$ 2,2 mi
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
4. **Maramores bloqueia WebFetch (403).** Use o browser. A Pilar já bloqueou, mas em
   2026-08-26 respondeu normalmente — tente o fetch antes de partir pro browser.
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

## Estado em 2026-08-25

18 imóveis, todos com itens já revisados pelo usuário em visita ou releitura do anúncio.

- **6 favoritos:** Avenida Mercedes, CCMG083, ZI288619, CO0275, Rua Mota Pais, Rua Ponta Porã
- **1 descartado:** Carlos Weber
- **Nenhuma visita registrada** ainda (todos em "a visitar")

Observações em aberto:

- **Avenida Mercedes** tem o melhor R$/m² com estrutura (R$ 10.778) e quase o menor
  custo mensal, mas são 6 quartos em 180 m² — planta muito compartimentada.
- **Rua Ponta Porã** é o segundo melhor R$/m², mas é **1º andar**, o que nenhuma
  métrica da página captura.
- **AX396 e Froben 4º** lideram em itens (9) e **não** foram favoritados — pode ser
  decisão ou esquecimento.
- **Rua Inhatium** tem IPTU de R$ 112/mês no anúncio, incompatível com um imóvel de
  R$ 1,85 mi. Provável erro de cadastro, ainda não confirmado.
