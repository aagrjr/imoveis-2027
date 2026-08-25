# AGENTS

## Purpose
Single-page web app (pt-BR) para comparar apartamentos numa busca:
lista, filtra, ordena e compara os imóveis a visitar.

## Editando os dados à mão
Cada apartamento é **uma linha** do array `apts`. Ao reescrever uma linha por
script, recoloque a vírgula final: sem ela o `const D` vira erro de sintaxe e a
página inteira fica em branco. Depois de mexer, valide parseando cada linha.

## Files
- `index.html` — a aplicação inteira: dados, CSS e JS. **É o único arquivo que importa.**
- `README.md`

Não há build step, dependências, bundler ou fonte de dados externa.
Se for tentado a adicionar qualquer um dos quatro, não adicione.

## Source of truth
Os dados vivem no `const D = { amenidades, apts }` dentro do `index.html`,
**uma linha por apartamento**, para que adicionar um imóvel seja copiar uma linha.
Preserve esse formato ao editar — não reformate o bloco em JSON indentado.

Campos: `bairro, endereco, privado, cobertura, andar, m2, qts, vgs, link, foto,
cond, iptu, valor, itens[]`. `foto` é opcional. `cond` e `iptu` são **mensais**; `itens` só aceita
strings presentes em `amenidades`. `Churrasqueira` é a do apartamento e
`Churrasq. prédio` a da área comum — nunca colapsar as duas. `m2v` (R$/m²), `mensal` e `n` (nº de itens)
são derivados na carga — nunca gravados nos dados.

## Comportamentos a preservar
1. Estado por imóvel em `localStorage`, prefixo `imoveis-2027:` — chaves `fav:`, `status:`, `nota:`.
   O id vem de `endereco + m2` slugificado; mudar essa regra perde as anotações do usuário.
2. O botão `#backup` serializa esse estado em `#s=<base64 do JSON>`; a página importa
   o hash na carga e o limpa com `replaceState`. Manter as duas pontas em sincronia.
3. `D.estado` / `D.estadoVersao` são o estado publicado no repo. Se a versão do
   arquivo diferir da guardada em `imoveis-2027:_versao`, a página limpa o
   `localStorage` do prefixo e adota `D.estado`. Ordem importa: essa adoção roda
   **antes** da importação do `#s=`, para que um link aberto à mão sempre vença.
   Ao publicar estado novo, **sempre** mude a `estadoVersao` — sem isso nenhum
   aparelho adota o que foi commitado.
4. Capa via `<img class="card-foto">` com `loading="lazy"`,
   `referrerpolicy="no-referrer"` e `onerror="this.remove()"` — a imagem some
   sozinha se o anúncio sair do ar, sem quebrar o card.
5. Chips de item são clicáveis e gravam `itens:<id>` — a lista **efetiva**, não um diff.
   Use sempre `itensDe(a)` (override ou `a.itens`) para exibir, contar e ordenar;
   `a.n` é só o valor do anúncio e não vale como contagem.
6. ⭐ favoritar e ✕ descartar direto no card; descartados ficam ocultos até o chip
   "mostrar descartados", e então exibem ⟲ para recuperar.
7. Alternância cards ⇄ tabela, filtros por bairro/favoritos/descartados, e as 6 ordenações.
8. Ordenação: `st.ordem` escolhe a métrica em `CHAVE` e `st.dir` (±1) o sentido,
   aplicado como `(k(a) - k(b)) * st.dir`. As funções em `CHAVE` devolvem sempre o
   valor cru — nada de negar dentro delas. Padrão: `mensal` crescente, e o
   `selected` do `<option>` precisa bater com `st.ordem`.
9. R$/m² colorido por quartil (`q1`/`q3` sobre o conjunto todo).

## Guardrails
1. Manter arquivo único, dependency-free e em pt-BR.
2. Preferir edições localizadas; não reescrever o CSS em bloco.
3. O repo é público. Nada de dados pessoais/financeiros além do que já consta
   nos anúncios públicos; favoritos, status e anotações ficam só no `localStorage`
   e nunca são versionados.
4. Manter o aviso do README sobre a natureza dos dados (amostra de anúncios
   públicos, sem representar orçamento ou negociação de ninguém).
5. Fotos são **hotlink** para o servidor do portal. Nunca baixar e versionar
   imagem de anúncio no repo — são de terceiros.

## Validação
1. Abrir `index.html` sem erros no console.
2. Contagem de cards == nº de linhas em `apts`; tabela idem.
3. Favorito, status e anotação persistem após reload.
4. Abrir a página com um `#s=` gerado pelo botão restaura o estado e limpa o hash.
5. Publicar `estado` novo com `estadoVersao` nova: um navegador com estado antigo
   adota o do repo no primeiro load, e edições posteriores dele voltam a persistir.
