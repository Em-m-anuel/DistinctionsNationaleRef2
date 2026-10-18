/* P0–P2 : wizard, secrétariat → DR, inspecteur, fichiers, pagination, login. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('Wizard : type de demande en tête, DTS non bloquante, courrier obligatoire', () => {
  const src = read('js/gab-orient/views-demande.js');
  assert.match(src, /Type de demande/);
  assert.match(src, /Nouvelle demande/);
  assert.match(src, /value=\"relance\"/);
  assert.match(src, /value=\"recours\"/);
  assert.match(src, /Courrier de demande/);
  assert.match(src, /peut être complétée après le dépôt/);
  assert.match(src, /Référence de la DTS/);
  assert.match(src, /function createDossier/);
  assert.match(src, /cfDeposit/);
  assert.match(src, /dataUrl/);
  assert.match(src, /parseCsv/);
});

test('Tableaux dossiers : pas de colonne Autorité, pagination branchée', () => {
  const src = read('js/gab-orient/views-dossiers.js');
  assert.doesNotMatch(src, /<th scope=\"col\">Autorité<\/th>/);
  assert.match(src, /Autorité destinataire/);
  assert.match(src, /ui\.slicePage\(list, DF\)/);
  assert.match(src, /type === 'file'/);
  assert.match(src, /inspect_cpl/);
  assert.match(src, /autres récipiendaires/);
});

test('Secrétariat transmet au Directeur régional après conformité', () => {
  const cour = read('js/gab-orient/views-courriers.js');
  assert.match(cour, /Transmettre au Directeur régional/);
  assert.doesNotMatch(cour, /Transmettre au service/);
  assert.match(cour, /conformité formelle/);
  assert.match(cour, /dataUrl/);
  const app = read('js/cf-app.js');
  assert.match(app, /Transmettre au Directeur régional/);
  const store = read('js/cf-store.js');
  assert.match(store, /mail\.level = \"dr\"/);
});

test('Pagination GO.ui et recettes sans colonne Échéance', () => {
  const core = read('js/gab-orient/core.js');
  assert.match(core, /pager\(state\)/);
  assert.match(core, /slicePage/);
  assert.match(core, /bindPager/);
  const regie = read('js/gab-orient/views-regie.js');
  assert.doesNotMatch(regie, /label: 'Échéance'/);
  assert.match(regie, /pageState: RF/);
  assert.match(regie, /paiement_verif/);
});

test('Cérémonie : heure et minutes ; login logo mobile masqué sur desktop', () => {
  const cer = read('js/gab-orient/views-ceremonies.js');
  assert.match(cer, /type=\"time\"/);
  const css = read('css/meditra.css');
  assert.match(css, /\.auth-mobile-brand \{ display: none; \}/);
});
