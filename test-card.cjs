// Execute com: node test-card.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements = {};
const storage = {};
const context = vm.createContext({
  document: {
    getElementById: id => elements[id] ||= { innerHTML: '', addEventListener() {} },
    addEventListener() {},
  },
  localStorage: Object.defineProperties(storage, {
    getItem: { value: key => storage[key] ?? null },
    setItem: { value: (key, value) => { storage[key] = value; } },
    removeItem: { value: key => { delete storage[key]; } },
  }),
  location: { hash: '' },
});
vm.runInContext(script, context);
vm.runInContext(`
  save('fav:aei3348-130', true);
  save('nota:aei3348-130', 'Teste de persistência');
`, context);
vm.runInContext(`(() => {
  const a = D.apts.find(a => a.id === 'aei3348-130');
  globalThis.result = {
    a, card: cardHTML(a), table: tabelaHTML([a]),
    count: D.apts.length, ids: D.apts.map(a => a.id),
    active: filtrar().length,
  };
})()`, context);
const { a, card, table, count, ids, active } = context.result;
assert.equal(new Set(ids).size, count);
assert.equal(a.endereco, 'Rua Belchior de Azevedo, 156');
assert.equal(a.predio, 'Podium Vila Leopoldina');
assert.equal(a.valor, 2500000);
assert.equal(a.add, '2026-09-02');
for (const link of [a.link, a.link2, a.link3]) {
  assert.equal(new URL(link).protocol, 'https:');
  assert.ok(card.includes(`href="${link}"`));
  assert.ok(table.includes(`href="${link}"`));
}
assert.ok(card.includes(a.detalhes));
assert.ok(card.includes('fav on'));
assert.ok(card.includes('Teste de persistência'));
assert.equal((elements.lista.innerHTML.match(/class="card st-/g) || []).length, active);
console.log('OK: renderização, três links, detalhes, IDs únicos e marcações preservadas.');
