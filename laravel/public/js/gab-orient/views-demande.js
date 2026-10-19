/* ==========================================================================
   GAB-ORIENT — Demandeur et bénéficiaires
   Vues : « Nouveau dossier » (dépôt en quatre étapes), « Bénéficiaires et
   récipiendaires », « DTS et pièces justificatives », « Mes distinctions ».
   ========================================================================== */
(function (GO) {
  'use strict';
  const { $, $$, esc, icon, D, fmtDate, relDay, plural, ageDays, norm } = GO;
  const ui = GO.ui;

  // Actions proposées par étape (aucune règle d’éligibilité n’est inventée :
  // l’écart entre l’ancienneté et l’échelon demandé est signalé, la décision
  // reste à l’instruction).
  function medalAdvice(years) {
    if (years === null || years < 0) return { tone: 'slate', text: 'Renseignez la date d’entrée pour calculer l’ancienneté.' };
    const m = GO.medal(D.medalForYears(years));
    return { tone: 'blue', text: `Repère d’échelon affiché : ${m.short} (${m.minYears}${m.maxYears ? '–' + m.maxYears : '+'} ans d’ancienneté). L’instruction vérifie les conditions réelles.` };
  }

  /* ======================= NOUVEAU DOSSIER ======================= */
  const COUNTRIES = [
    ['GA', 'Gabon'], ['CM', 'Cameroun'], ['CG', 'Congo'], ['CD', 'République démocratique du Congo'],
    ['GQ', 'Guinée équatoriale'], ['ST', 'Sao Tomé-et-Principe'], ['TD', 'Tchad'], ['CF', 'République centrafricaine'],
    ['AO', 'Angola'], ['NG', 'Nigéria'], ['BJ', 'Bénin'], ['TG', 'Togo'], ['GH', 'Ghana'], ['CI', 'Côte d’Ivoire'],
    ['SN', 'Sénégal'], ['ML', 'Mali'], ['BF', 'Burkina Faso'], ['NE', 'Niger'], ['GN', 'Guinée'], ['MR', 'Mauritanie'],
    ['MA', 'Maroc'], ['DZ', 'Algérie'], ['TN', 'Tunisie'], ['LY', 'Libye'], ['EG', 'Égypte'], ['SD', 'Soudan'],
    ['ET', 'Éthiopie'], ['KE', 'Kenya'], ['UG', 'Ouganda'], ['TZ', 'Tanzanie'], ['RW', 'Rwanda'], ['BI', 'Burundi'],
    ['ZA', 'Afrique du Sud'], ['NA', 'Namibie'], ['BW', 'Botswana'], ['ZW', 'Zimbabwe'], ['MZ', 'Mozambique'],
    ['MG', 'Madagascar'], ['MU', 'Maurice'], ['SC', 'Seychelles'], ['FR', 'France'], ['BE', 'Belgique'],
    ['CH', 'Suisse'], ['DE', 'Allemagne'], ['ES', 'Espagne'], ['IT', 'Italie'], ['PT', 'Portugal'],
    ['GB', 'Royaume-Uni'], ['US', 'États-Unis'], ['CA', 'Canada'], ['BR', 'Brésil'], ['CN', 'Chine'],
    ['JP', 'Japon'], ['IN', 'Inde'], ['TR', 'Turquie'], ['LB', 'Liban'], ['MA', 'Maroc']
  ].filter((c, i, a) => a.findIndex(x => x[0] === c[0]) === i).sort((a, b) => a[0] === 'GA' ? -1 : b[0] === 'GA' ? 1 : a[1].localeCompare(b[1], 'fr'));
  function flagEmoji(cc) {
    const u = String(cc || '').toUpperCase();
    if (u.length !== 2) return '';
    return String.fromCodePoint(127397 + u.charCodeAt(0), 127397 + u.charCodeAt(1));
  }
  function countryByCode(cc) { return COUNTRIES.find(c => c[0] === cc) || COUNTRIES[0]; }
  function natFromCountry(cc) {
    const name = countryByCode(cc)[1];
    if (cc === 'GA') return 'Gabonaise';
    return name;
  }
  function STEPS_OF(kind) {
    if (kind === 'relance' || kind === 'recours') {
      return [
        ['Type de demande', 'Relance ou recours et dossier d’origine'],
        ['Destinataire', 'Autorité et courrier'],
        ['Pièces', 'Courrier et documents facultatifs'],
        ['Récapitulatif', 'Vérification et envoi']
      ];
    }
    return [
      ['Type et demandeur', 'Nature de la demande, organisme et autorité'],
      ['Récipiendaires', 'Personnes proposées'],
      ['Pièces et DTS', 'Courrier, DTS et justificatifs'],
      ['Récapitulatif', 'Vérification et envoi']
    ];
  }
  function PIECES_OF(kind) {
    if (kind === 'relance' || kind === 'recours') {
      return [
        ['demande', kind === 'recours' ? 'Courrier de recours' : 'Courrier de relance', 'Signé par le responsable de l’organisme', true],
        ['autres', 'Autres documents', 'Pièces facultatives', false]
      ];
    }
    return [
      ['demande', 'Courrier de demande', 'Signé par le responsable de l’organisme', true],
      ['liste', 'Liste nominative des récipiendaires', 'Noms, fonctions et dates d’entrée', true],
      ['dts', 'DTS (déclaration de travail et de salaire)', 'Référence de la DTS : le fichier peut être complétée après le dépôt', false],
      ['autres', 'Autres pièces', 'Tout document utile à l’instruction', false]
    ];
  }
  const SECTORS = ['Administration publique', 'Banque et assurance', 'Énergie', 'Forêt et bois', 'Industrie', 'Mines', 'Santé', 'Télécommunications', 'Transport et logistique', 'Autre'];
  const blankR = () => ({ nom: '', prenom: '', fonction: '', entree: '', medal: '', sexe: '', nationalite: 'Gabonaise', countryCode: 'GA', situation: 'Vivant', dateDeces: '', certDeces: null, certMedical: null, workPermit: null });
  function deathWarn(dateStr) {
    if (typeof deathOlderThanTwoYears === 'function') return deathOlderThanTwoYears(dateStr);
    const d = dateStr ? new Date(String(dateStr).includes('/') ? String(dateStr).split('/').reverse().join('-') : dateStr) : null;
    if (!d || isNaN(d.getTime())) return false;
    const limit = new Date(); limit.setFullYear(limit.getFullYear() - 2);
    return d.getTime() < limit.getTime();
  }
  let F = null;

  function freshForm() {
    const o = GO.scopeOrg();
    const isMin = GO.role().id === 'demandeur_ministere' || (o && o.type === 'Ministère');
    return {
      step: 0, max: 0, dir: 1, done: null, errors: {}, knownOrg: o ? o.id : null, recipPage: 1,
      data: {
        kind: 'nouvelle', relatedRef: '',
        org: o ? o.name : '', type: o ? o.type : '', sector: o ? o.sector : '', city: o ? o.city : '',
        contact: o ? o.contact : '', contactRole: o ? o.contactRole : '', email: o ? o.email : '', phone: o ? o.phone : '',
        authority: 'dr', channel: isMin ? 'Voie hiérarchique — ministère' : 'Dépôt du demandeur', ministry: isMin,
        recipients: [blankR()], files: { demande: null, liste: null, dts: null, autres: null }, certify: false
      }
    };
  }

  function renderForm(main) {
    if (!GO.can('create')) {
      main.innerHTML = `${ui.head({ eyebrow: 'Dossiers', title: 'Nouveau dossier' })}
        <section class="card">${GO.empty('lock', 'Création non autorisée', 'Votre profil ne peut pas créer de dossier de demande.')}</section>`;
      return;
    }
    if (!F || F.done || F.role !== GO.S.role) { F = freshForm(); F.role = GO.S.role; }
    main.innerHTML = `
      ${ui.head({ eyebrow: 'Dossiers', title: 'Nouveau dossier de distinction',
        sub: 'Choisissez d’abord le type de demande. Les champs s’adaptent : nouvelle demande, relance ou recours. Les saisies sont conservées d’une étape à l’autre.',
        actions: `<a class="btn btn-secondary" href="#/dossiers">Annuler</a>` })}
      <div class="form-layout">
        <section class="card reveal" style="--i:1" aria-labelledby="wz-title">
          <div class="wizard-steps" id="wz-steps" role="list" aria-label="Progression du formulaire"></div>
          <div class="wz-progress" aria-hidden="true"><i id="wz-bar" style="width:0"></i></div>
          <form id="wz-form" novalidate><div class="wz-body" id="wz-body"></div>
            <div class="wz-foot" id="wz-foot"></div></form>
        </section>
        <aside class="card help-card reveal" style="--i:2" aria-labelledby="help-t">
          <div class="card-head"><h2 class="card-title" id="help-t">${icon('info')}Aide</h2></div>
          <div class="card-body" id="wz-help"></div>
        </aside>
      </div>`;
    const form = $('#wz-form', main);
    form.addEventListener('input', onInput);
    form.addEventListener('change', onInput);
    form.addEventListener('focusin', e => {
      if (e.target.matches('[data-rk="natQuery"]')) updateCountrySuggestions(e.target, true);
    });
    form.addEventListener('keydown', onCountryKeydown);
    form.addEventListener('submit', e => { e.preventDefault(); next(); });
    form.addEventListener('click', onClick);
    $('#wz-steps', main).addEventListener('click', e => { const b = e.target.closest('[data-step]'); if (b && +b.dataset.step <= F.max && !F.done) go(+b.dataset.step); });
    drawStep(true);
  }

  function drawStep(first) {
    const STEPS = STEPS_OF(F.data.kind);
    const steps = $('#wz-steps');
    steps.innerHTML = STEPS.map(([t, s], i) => {
      const cls = F.done ? 'is-done' : i < F.step ? 'is-done' : i === F.step ? 'is-current' : '';
      return `<button type="button" class="wz-step ${cls}" role="listitem" data-step="${i}" data-reachable="${i <= F.max && !F.done}" ${i > F.max || F.done ? 'tabindex="-1" aria-disabled="true"' : ''} ${i === F.step && !F.done ? 'aria-current="step"' : ''}>
        <span class="wz-num">${cls === 'is-done' ? icon('check') : i + 1}</span><span class="wz-txt"><b>${t}</b><span>${s}</span></span></button>`;
    }).join('');
    $('#wz-bar').style.width = (F.done ? 100 : ((F.step + 1) / STEPS.length) * 100) + '%';
    const body = $('#wz-body');
    if (F.done) { body.innerHTML = successHTML(); $('#wz-foot').hidden = true; $('#wz-help').innerHTML = '<p class="muted" style="font-size:13px">Le dossier est désormais suivi depuis la liste des dossiers.</p>'; return; }
    $('#wz-foot').hidden = false;
    const panels = (F.data.kind === 'relance' || F.data.kind === 'recours')
      ? [stepDemandeur, stepLinked, stepDocs, stepRecap]
      : [stepDemandeur, stepRecips, stepDocs, stepRecap];
    body.innerHTML = `<div class="wz-panel ${F.dir < 0 ? 'back' : ''}">${panels[F.step]()}</div>`;
    $('#wz-foot').innerHTML = `<button type="button" class="btn btn-secondary" data-nav="prev" ${F.step === 0 ? 'disabled' : ''}>${icon('chevron-left')}Précédent</button>
      <span class="muted" style="font-size:12.5px;align-self:center">Étape ${F.step + 1} sur ${STEPS.length}</span>
      ${F.step < 3 ? `<button type="submit" class="btn btn-primary">Suivant${icon('chevron-right')}</button>` : `<button type="submit" class="btn btn-primary" id="wz-submit">${icon('send')}Soumettre le dossier</button>`}`;
    $('#wz-help').innerHTML = helpFor(F.step);
    Object.entries(F.errors).forEach(([k, m]) => showErr(k, m));
    if (!first) { const h = $('.wz-panel h2', body); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } $('#wz-form').closest('.card').scrollIntoView({ behavior: GO.reduced() ? 'auto' : 'smooth', block: 'start' }); }
  }

  const field = (id, label, ctl, req = true, cls = '', hint = '') => `<div class="field ${cls}" data-f="${id}"><label class="label" for="${id}">${label}${req ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>${ctl}${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
  const inp = (id, val, attrs = '') => `<input class="input" id="${id}" name="${id}" value="${esc(val)}" ${attrs}>`;

  function ownDossiers() {
    return GO.myDossiers().slice().sort((a, b) => b.depot.localeCompare(a.depot));
  }
  function stepDemandeur() {
    const x = F.data, locked = !!GO.scopeOrg();
    const mine = ownDossiers();
    const isFollow = x.kind === 'relance' || x.kind === 'recours';
    return `<h2 id="wz-title">${isFollow ? 'Type de demande et dossier d’origine' : 'Type de demande et informations du demandeur'}</h2>
      <p>Le premier choix est le <strong>type de demande</strong>. Les champs suivants s’adaptent. Les champs marqués <span class="req" style="color:var(--red-600)">*</span> sont obligatoires.</p>
      <fieldset class="wz-section"><legend>Nature de la demande</legend>
      <div class="form-grid">
        ${field('f-kind', 'Type de demande', `<select class="select" id="f-kind" required>
          <option value="nouvelle"${x.kind === 'nouvelle' ? ' selected' : ''}>Nouvelle demande</option>
          <option value="relance"${x.kind === 'relance' ? ' selected' : ''}>Relance</option>
          <option value="recours"${x.kind === 'recours' ? ' selected' : ''}>Recours</option>
        </select>`, true, 'span-2', 'Une relance ou un recours se rattache à un dossier déjà déposé. La liste des récipiendaires n’est pas recréée.')}
      </div></fieldset>
      ${isFollow ? `<fieldset class="wz-section"><legend>Dossier d’origine</legend>
        <div class="form-grid">
          ${field('f-relatedRef', 'Dossier concerné', `<select class="select" id="f-relatedRef" required>
            <option value="">Sélectionner un dossier…</option>
            ${mine.map(d => `<option value="${esc(d.ref)}" ${d.ref === x.relatedRef ? 'selected' : ''}>${esc(d.ref)} — ${esc(D.statuses[d.status] ? D.statuses[d.status].label : d.status)} · ${d.recipients.length} récip.</option>`).join('')}
          </select>`, true, 'span-2', mine.length ? 'La liste des récipiendaires du dossier d’origine est conservée.' : 'Aucun dossier n’est encore rattaché à votre compte.')}
          ${field('f-authority', 'Destinataire', `<select class="select" id="f-authority" required>${D.authorities.map(a => `<option value="${a.id}" ${a.id === x.authority ? 'selected' : ''}>${esc(a.label)}</option>`).join('')}</select>`, true, 'span-2', x.kind === 'recours' ? 'Autorité saisie du recours.' : 'Autorité destinataire de la relance.')}
        </div></fieldset>` : ''}
      ${!isFollow ? `<fieldset class="wz-section"><legend>Organisme demandeur</legend>
      <div class="form-grid">
        ${field('f-org', 'Raison sociale de l’organisme', inp('f-org', x.org, `list="org-list" autocomplete="organization" required ${locked ? 'readonly' : ''}`), true, 'span-2', locked ? 'Organisme rattaché à votre compte.' : 'Saisissez le nom complet ; un organisme déjà connu est proposé automatiquement.')}
        <datalist id="org-list">${D.organisations.map(o => `<option value="${esc(o.name)}">`).join('')}</datalist>
        ${field('f-type', 'Type d’organisme', `<select class="select" id="f-type" required><option value="">Sélectionner…</option>${['Entreprise', 'Ministère', 'Établissement public', 'Collectivité'].map(t => `<option ${t === x.type ? 'selected' : ''}>${t}</option>`).join('')}</select>`)}
        ${field('f-sector', 'Secteur d’activité', `<select class="select" id="f-sector" required><option value="">Sélectionner…</option>${SECTORS.map(t => `<option ${t === x.sector ? 'selected' : ''}>${t}</option>`).join('')}</select>`)}
        ${field('f-city', 'Ville', inp('f-city', x.city, 'autocomplete="address-level2" required'))}
        ${field('f-authority', 'Autorité destinataire', `<select class="select" id="f-authority" required>${D.authorities.map(a => `<option value="${a.id}" ${a.id === x.authority ? 'selected' : ''}>${esc(a.label)}</option>`).join('')}</select>`, true, 'span-2', 'Le secrétariat enregistre le dossier, confirme sa conformité, puis le transmet au Directeur régional.')}
        ${field('f-contact', 'Nom de l’interlocuteur', inp('f-contact', x.contact, 'autocomplete="name" required'))}
        ${field('f-contactRole', 'Fonction de l’interlocuteur', inp('f-contactRole', x.contactRole, 'autocomplete="organization-title"'), false)}
        ${field('f-email', 'Adresse électronique', inp('f-email', x.email, 'type="email" autocomplete="email" required'))}
        ${field('f-phone', 'Téléphone', inp('f-phone', x.phone, 'type="tel" autocomplete="tel" required placeholder="+241 …"'), true, '', 'Indicatif international accepté.')}
      </div></fieldset>` : ''}
      ${x.ministry && !isFollow ? `<div class="alert alert-info mt">${icon('info')}<div><strong>Voie hiérarchique ministérielle.</strong> Votre demande est enregistrée au registre du secrétariat, qui la transmet au Directeur régional après confirmation de conformité.</div></div>` : ''}`;
  }

  function stepLinked() {
    const x = F.data;
    const d = GO.getDossier(x.relatedRef);
    if (!d) return `<h2 id="wz-title">Dossier d’origine</h2><p>Sélectionnez d’abord un dossier à l’étape précédente.</p>`;
    return `<h2 id="wz-title">${x.kind === 'recours' ? 'Recours' : 'Relance'} — dossier ${esc(d.ref)}</h2>
      <p>Les récipiendaires déjà enregistrés sont repris. Vous n’avez pas à recréer la liste.</p>
      ${ui.dl([
        ['Référence', `<span class="ref">${esc(d.ref)}</span>`],
        ['Statut', esc(D.statuses[d.status] ? D.statuses[d.status].label : d.status)],
        ['Récipiendaires', String(d.recipients.length)],
        ['Destinataire', esc(GO.authority(x.authority).label)]
      ])}
      <div class="mini-table mt"><table><thead><tr><th>Nom</th><th>Fonction</th><th>Médaille</th></tr></thead><tbody>
        ${d.recipients.map(r => `<tr><td><strong>${esc(r.nom)}</strong> ${esc(r.prenom)}</td><td>${esc(r.fonction)}</td><td>${esc(GO.medal(r.medal).short)}</td></tr>`).join('')}
      </tbody></table></div>`;
  }
  const RECIP_PAGE = 5;
  function recipPageSlice() {
    const rs = F.data.recipients;
    const pages = Math.max(1, Math.ceil(rs.length / RECIP_PAGE));
    if (!F.recipPage || F.recipPage < 1) F.recipPage = 1;
    if (F.recipPage > pages) F.recipPage = pages;
    const start = (F.recipPage - 1) * RECIP_PAGE;
    return { rs, start, pageItems: rs.map((r, i) => ({ r, i })).slice(start, start + RECIP_PAGE), pages };
  }
  function stepRecips() {
    const { rs, pageItems, pages } = recipPageSlice();
    return `<h2 id="wz-title">Récipiendaires proposés</h2>
      <p>Renseignez chaque personne. L’ancienneté est calculée à partir de la date d’entrée. Vous pouvez importer un fichier Excel ou CSV ; les validations du formulaire s’appliquent ensuite à toutes les lignes, y compris hors page.</p>
      <div class="wz-import" role="group" aria-label="Import des récipiendaires">
        <button type="button" class="btn btn-secondary btn-sm" data-dl-xlsx>${icon('file', 'ic-sm')}Télécharger le modèle</button>
        <label class="btn btn-secondary btn-sm" for="f-xlsx">Importer Excel / CSV</label>
        <input type="file" id="f-xlsx" accept=".csv,.txt,.xlsx,application/vnd.ms-excel,text/csv" hidden>
      </div>
      <div id="xlsx-preview"></div>
      <p class="hint" style="margin-top:8px" aria-live="polite" id="r-count">${plural(rs.length, 'récipiendaire', 'récipiendaires')} sur ce dossier</p>
      <div id="recips">${pageItems.map(({ r, i }) => recipCard(r, i, rs.length)).join('')}</div>
      <div class="go-pager" id="recip-pager">
        <span>Page ${F.recipPage} / ${pages}</span>
        <button type="button" class="btn btn-ghost btn-xs" data-recip-page="prev" ${F.recipPage <= 1 ? 'disabled' : ''}>Précédent</button>
        <button type="button" class="btn btn-ghost btn-xs" data-recip-page="next" ${F.recipPage >= pages ? 'disabled' : ''}>Suivant</button>
      </div>
      <button type="button" class="btn btn-secondary mt" data-add-r>${icon('plus')}Ajouter un récipiendaire</button>`;
  }
  function countryMatches(query) {
    const q = norm(query.trim());
    if (!q) return COUNTRIES.slice(0, 8);
    return COUNTRIES
      .map(c => ({ country: c, rank: norm(c[1]) === q || norm(c[0]) === q ? 0 : norm(c[1]).startsWith(q) || norm(c[0]).startsWith(q) ? 1 : norm(c[0] + ' ' + c[1]).includes(q) ? 2 : 3 }))
      .filter(x => x.rank < 3)
      .sort((a, b) => a.rank - b.rank || a.country[1].localeCompare(b.country[1], 'fr'))
      .slice(0, 8)
      .map(x => x.country);
  }
  function updateCountrySuggestions(input, open) {
    const list = input.parentNode.parentNode.querySelector('.nat-suggest');
    if (!list) return;
    const matches = countryMatches(input.value);
    const query = norm(input.value.trim());
    const exact = COUNTRIES.find(c => norm(c[0]) === query || norm(c[1]) === query);
    const flag = input.parentNode.querySelector('[data-country-flag]');
    const status = input.parentNode.parentNode.querySelector('[data-country-status]');
    if (flag) flag.textContent = exact ? flagEmoji(exact[0]) : input.value.trim() ? '🌐' : '🌐';
    if (status) status.textContent = exact
      ? `${flagEmoji(exact[0])} ${exact[1]} — sélectionnez cette suggestion pour confirmer le pays.`
      : matches.length ? 'Suggestions de pays mises à jour selon votre saisie.'
        : 'Aucun pays correspondant. Essayez un autre nom.';
    list.innerHTML = matches.map(c => `<li><button type="button" role="option" aria-selected="false" class="nat-opt" data-cc="${c[0]}" data-ri="${input.dataset.ri}">${flagEmoji(c[0])} ${esc(c[1])}</button></li>`).join('')
      || '<li class="muted nat-no-results">Aucun pays ne correspond.</li>';
    list.hidden = !open;
    input.setAttribute('aria-expanded', String(!!open));
  }
  function onCountryKeydown(e) {
    const input = e.target.closest('[data-rk="natQuery"]');
    if (!input) return;
    const list = input.parentNode.parentNode.querySelector('.nat-suggest');
    if (e.key === 'ArrowDown') {
      const first = list && list.querySelector('.nat-opt');
      if (first) { e.preventDefault(); first.focus(); }
    } else if (e.key === 'Escape' && list && !list.hidden) {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
    } else if (e.key === 'Enter' && list && !list.hidden) {
      const exact = COUNTRIES.find(c => norm(c[0]) === norm(input.value.trim()) || norm(c[1]) === norm(input.value.trim()));
      const option = exact ? list.querySelector(`[data-cc="${exact[0]}"]`) : list.querySelector('.nat-opt');
      if (option) { e.preventDefault(); option.click(); }
    }
  }
  function countryField(i, r) {
    const q = r.natQuery != null ? r.natQuery : (countryByCode(r.countryCode || 'GA')[1]);
    const matched = COUNTRIES.find(c => norm(c[0]) === norm(q.trim()) || norm(c[1]) === norm(q.trim()));
    const flag = matched ? flagEmoji(matched[0]) : r.countryCode ? flagEmoji(r.countryCode) : '🌐';
    const hits = countryMatches(q);
    return `<div class="field" data-f="r${i}-country"><label class="label" for="r${i}-country">Pays / Nationalité <span class="req" aria-hidden="true">*</span></label>
      <span class="country-control"><span class="country-flag" data-country-flag aria-hidden="true">${flag}</span><input class="input" id="r${i}-country" data-rk="natQuery" data-ri="${i}" value="${esc(q)}" autocomplete="off" aria-autocomplete="list" aria-controls="r${i}-country-options" aria-expanded="false" placeholder="Saisir un pays…"></span>
      <ul class="nat-suggest" id="r${i}-country-options" role="listbox" hidden>${hits.map(c => `<li role="option"><button type="button" class="nat-opt" data-cc="${c[0]}" data-ri="${i}">${flagEmoji(c[0])} ${esc(c[1])}</button></li>`).join('') || '<li class="muted">Aucun pays ne correspond.</li>'}</ul>
      <span class="hint country-status" data-country-status>${r.countryCode ? `${flagEmoji(r.countryCode)} ${esc(countryByCode(r.countryCode)[1])} · ${esc(r.nationalite || natFromCountry(r.countryCode))}` : 'Choisissez un pays dans la liste. Une saisie libre n’est pas enregistrée.'}</span>
      ${r.countryCode && r.countryCode !== 'GA' ? `<div class="field mt" data-f="r${i}-workPermit"><label class="label">Autorisation d’emploi (fichier) <span class="req" style="color:var(--red-600)">*</span></label>
        <input type="file" id="r${i}-workPermit" data-rfile="workPermit" data-ri="${i}" accept="${D.config.upload.accept.join(',')}">
        ${r.workPermit ? `<span class="hint">${esc(r.workPermit.name)}</span>` : '<span class="hint">Obligatoire pour une nationalité autre que gabonaise.</span>'}</div>` : ''}
    </div>`;
  }
  function recipCard(r, i, n) {
    const s = GO.seniority(r.entree), adv = medalAdvice(s);
    return `<fieldset class="recip-card" data-r="${i}" style="border:1px solid var(--line)"><legend class="sr-only">Récipiendaire ${i + 1}</legend>
      <div class="recip-head"><strong><span class="idx">${i + 1}</span>${r.nom || r.prenom ? esc(`${r.prenom} ${r.nom}`.trim()) : 'Nouveau récipiendaire'}</strong>
        ${n > 1 ? `<button type="button" class="btn btn-ghost btn-xs" data-del-r="${i}" aria-label="Retirer le récipiendaire ${i + 1}">${icon('trash', 'ic-sm')}Retirer</button>` : ''}</div>
      <div class="recip-grid">
        ${field(`r${i}-nom`, 'Nom', inp(`r${i}-nom`, r.nom, `data-rk="nom" data-ri="${i}" autocomplete="family-name"`))}
        ${field(`r${i}-prenom`, 'Prénom', inp(`r${i}-prenom`, r.prenom, `data-rk="prenom" data-ri="${i}" autocomplete="given-name"`))}
        ${field(`r${i}-sexe`, 'Sexe', `<select class="select" id="r${i}-sexe" data-rk="sexe" data-ri="${i}"><option value="">Sélectionner…</option><option value="Masculin"${r.sexe === 'Masculin' ? ' selected' : ''}>Masculin</option><option value="Féminin"${r.sexe === 'Féminin' ? ' selected' : ''}>Féminin</option></select>`)}
        ${field(`r${i}-fonction`, 'Fonction', inp(`r${i}-fonction`, r.fonction, `data-rk="fonction" data-ri="${i}"`))}
        ${field(`r${i}-entree`, 'Date d’entrée dans l’organisme', inp(`r${i}-entree`, r.entree, `type="date" max="${GO.REF_ISO}" data-rk="entree" data-ri="${i}"`), true, '', `<span class="seniority" id="r${i}-sen">${s !== null && s >= 0 ? `Ancienneté : ${s} an${s > 1 ? 's' : ''}` : ''}</span>`)}
        ${field(`r${i}-medal`, 'Médaille proposée', `<select class="select" id="r${i}-medal" data-rk="medal" data-ri="${i}"><option value="">Sélectionner…</option>${D.medals.map(m => `<option value="${m.id}" ${m.id === r.medal ? 'selected' : ''}>${esc(m.label)}</option>`).join('')}</select>`, true, '', `<span class="hint" id="r${i}-adv">${esc(adv.text)}</span>`)}
        ${countryField(i, r)}
        ${field(`r${i}-situation`, 'Situation', `<select class="select" id="r${i}-situation" data-rk="situation" data-ri="${i}"><option ${r.situation === 'Vivant' || !r.situation ? 'selected' : ''}>Vivant</option><option ${r.situation === 'Décédé' ? 'selected' : ''}>Décédé</option><option ${r.situation === 'Mutilé' ? 'selected' : ''}>Mutilé</option></select>`)}
        ${r.situation === 'Décédé' ? field(`r${i}-dateDeces`, 'Date de décès', inp(`r${i}-dateDeces`, r.dateDeces, `data-rk="dateDeces" data-ri="${i}" placeholder="jj/mm/aaaa"`), false, 'span-2', deathWarn(r.dateDeces) ? 'Le décès déclaré date de plus de deux ans. Cette information est signalée ; elle n’empêche pas de poursuivre la demande.' : 'Information transmise à l’instruction, sans blocage automatique.') : ''}
        ${r.situation === 'Décédé' ? `<div class="field span-2" data-f="r${i}-certDeces"><label class="label" for="r${i}-certDeces">Certificat de décès (PDF, JPEG ou PNG) <span class="req" style="color:var(--red-600)">*</span></label>
          <input type="file" id="r${i}-certDeces" data-rfile="certDeces" data-ri="${i}" accept="${D.config.upload.accept.join(',')}">
          ${r.certDeces ? `<span class="hint">${esc(r.certDeces.name)} · ${(r.certDeces.size / 1024).toFixed(0)} Ko</span>` : '<span class="hint">Document obligatoire pour une situation « Décédé ».</span>'}</div>` : ''}
        ${r.situation === 'Mutilé' ? `<div class="field span-2" data-f="r${i}-certMedical"><label class="label" for="r${i}-certMedical">Certificat médical (PDF, JPEG ou PNG) <span class="req" style="color:var(--red-600)">*</span></label>
          <input type="file" id="r${i}-certMedical" data-rfile="certMedical" data-ri="${i}" accept="${D.config.upload.accept.join(',')}">
          ${r.certMedical ? `<span class="hint">${esc(r.certMedical.name)}</span>` : '<span class="hint">Document obligatoire pour une situation « Mutilé ».</span>'}</div>` : ''}
      </div></fieldset>`;
  }
  function stepDocs() {
    const up = D.config.upload;
    const pieces = PIECES_OF(F.data.kind);
    const isNew = F.data.kind === 'nouvelle';
    return `<h2 id="wz-title">${isNew ? 'Pièces justificatives et DTS' : 'Courrier et pièces'}</h2>
      <p>Joignez les pièces numérisées (${up.acceptLabel}, ${up.maxMb} Mo maximum par fichier). ${isNew ? 'Le courrier de demande est obligatoire. La DTS peut être complétée après le dépôt.' : 'Le courrier de ' + F.data.kind + ' est obligatoire. Un nouveau DTS n’est pas exigé.'}</p>
      <div class="mt">${pieces.map(([k, t, s, req]) => { const f = F.data.files[k]; return `
        <div class="dropzone ${f ? 'is-filled' : ''}" data-f="f-${k}" data-drop="${k}">
          <span class="dz-ico">${icon(f ? 'check' : 'upload')}</span>
          <div class="dz-main"><strong>${t}${req ? ' <span class="req" style="color:var(--red-600)" aria-hidden="true">*</span>' : ' <span class="muted" style="font-weight:400">(facultatif)</span>'}</strong>
            <span>${f ? `${esc(f.name)} · ${(f.size / 1024).toFixed(0)} Ko` : esc(s)}</span></div>
          <div style="display:flex;gap:6px">${f ? `<button type="button" class="btn btn-ghost btn-xs" data-rm-f="${k}" aria-label="Retirer le fichier ${esc(t)}">${icon('trash', 'ic-sm')}Retirer</button>` : ''}
            <label class="btn btn-secondary btn-sm" for="f-${k}">${f ? 'Remplacer' : 'Choisir un fichier'}</label>
            <input type="file" id="f-${k}" data-file="${k}" accept="${up.accept.join(',')}" ${req ? 'aria-required="true"' : ''} aria-label="${esc(t)}"></div>
        </div>`; }).join('')}</div>`;
  }
  function stepRecap() {
    const x = F.data;
    const block = (title, step, html) => `<section class="summary-block"><header><h3>${title}</h3><button type="button" class="btn btn-ghost btn-xs" data-goto="${step}">${icon('edit', 'ic-sm')}Modifier</button></header>${html}</section>`;
    const a = GO.authority(x.authority);
    const kindLabel = x.kind === 'relance' ? 'Relance' : x.kind === 'recours' ? 'Recours' : 'Nouvelle demande';
    const recips = (x.kind === 'relance' || x.kind === 'recours') && x.relatedRef && GO.getDossier(x.relatedRef)
      ? GO.getDossier(x.relatedRef).recipients : x.recipients;
    const missing = PIECES_OF(x.kind).filter(([k, , , req]) => req && !x.files[k]);
    return `<h2 id="wz-title">Récapitulatif</h2><p>Vérifiez les informations avant l’envoi.</p>
      ${block('Demande', 0, `<dl class="dl-grid">
        <div><dt>Type</dt><dd>${esc(kindLabel)}</dd></div>
        ${x.relatedRef ? `<div><dt>Dossier d’origine</dt><dd class="ref">${esc(x.relatedRef)}</dd></div>` : ''}
        <div><dt>Organisme</dt><dd>${esc(x.org)}</dd></div>
        <div><dt>Autorité destinataire</dt><dd>${esc(a.label)}</dd></div>
        <div><dt>Voie de dépôt</dt><dd>${esc(x.channel)}</dd></div></dl>`)}
      ${block(`Récipiendaires (${recips.length})`, 1, `<div style="padding:0"><table class="data-table"><thead><tr><th>Nom</th><th>Sexe</th><th>Fonction</th><th>Ancienneté</th><th>Médaille</th><th>Situation</th></tr></thead><tbody>
        ${recips.map(r => `<tr><td><strong>${esc((r.nom || '').toUpperCase())}</strong> ${esc(r.prenom || '')}</td><td>${esc(r.sexe || '—')}</td><td>${esc(r.fonction || '')}</td><td class="tnum">${r.entree ? GO.seniority(r.entree) + ' ans' : '—'}</td><td>${esc(GO.medal(r.medal).short)}</td><td>${esc(r.situation || '—')}</td></tr>`).join('')}</tbody></table></div>`)}
      ${block('Pièces jointes', 2, `<ul class="list-plain">${PIECES_OF(x.kind).filter(([k]) => x.files[k]).map(([k, t]) => `<li><span>${icon('paperclip', 'ic-sm')} ${esc(t)}</span><span class="muted" style="font-size:12px">${esc(x.files[k].name)}</span></li>`).join('') || '<li><span class="muted">Aucune pièce jointe</span></li>'}</ul>
        ${missing.length ? `<div class="alert alert-error mt">${icon('alert-circle')}<div>Pièces obligatoires manquantes : ${missing.map(p => esc(p[1])).join(', ')}.</div></div>` : ''}`)}
      <div class="alert alert-info mt">${icon('info')}<div>Après l’envoi, le dossier est enregistré au secrétariat. La transmission au Directeur régional n’intervient qu’après confirmation de conformité par le secrétariat.</div></div>
      <div class="field mt" data-f="f-certify"><label class="check"><input type="checkbox" id="f-certify" ${x.certify ? 'checked' : ''}> <span>Je certifie l’exactitude des informations transmises et la conformité des pièces jointes. <span class="req" style="color:var(--red-600)">*</span></span></label></div>`;
  }
  function helpFor(step) {
    const items = [
      ['Choisissez d’abord le type : nouvelle demande, relance ou recours.', 'Une relance ou un recours se rattache à un dossier existant.', 'Le secrétariat transmet ensuite au Directeur régional après confirmation de conformité.'],
      ['Ajoutez autant de récipiendaires que nécessaire, ou importez un fichier.', 'La date d’entrée permet de calculer l’ancienneté affichée.', 'Les conditions d’attribution sont vérifiées pendant l’instruction : aucun échelon n’est attribué automatiquement.'],
      ['Le courrier est obligatoire. La DTS peut être complétée après le dépôt.', `Formats acceptés : ${D.config.upload.acceptLabel}.`, 'Une relance ou un recours n’exige pas un nouveau DTS.'],
      ['Chaque section peut être modifiée avant l’envoi.', 'Après l’envoi, le dossier apparaît au statut « Reçu — à traiter ».', 'Vous serez notifié à chaque étape de l’instruction.']
    ][step];
    return `<ul>${items.map(t => `<li>${icon('check')}<span>${esc(t)}</span></li>`).join('')}</ul>`;
  }
  function successHTML() {
    const d = GO.getDossier(F.done);
    return `<div class="success-panel" role="status"><div class="success-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17 19 7"/></svg></div>
      <h2 style="font-size:20px">Dossier enregistré</h2>
      <p class="muted" style="max-width:52ch;font-size:14px">Le dossier <span class="ref">${F.done}</span> a été transmis et enregistré au registre du secrétariat de <strong>${esc(d ? GO.authority(d.authority).label : '')}</strong>. Il apparaît au statut « Reçu — à traiter ».</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px"><a class="btn btn-primary" href="#/dossiers/${F.done}">${icon('folder')}Ouvrir le dossier</a><button class="btn btn-secondary" type="button" data-again>${icon('plus')}Créer un autre dossier</button></div></div>`;
  }

  function onInput(e) {
    const t = e.target, x = F.data;
    if (t.dataset.rfile && e.type === 'change') {
      const r = x.recipients[+t.dataset.ri];
      const f = t.files && t.files[0];
      if (!f || !r) return;
      const up = D.config.upload;
      const err = !up.accept.includes(f.type) ? `Format non accepté.` : f.size > up.maxMb * 1048576 ? `Fichier trop volumineux.` : '';
      if (err) { F.errors['r' + t.dataset.ri + '-' + t.dataset.rfile] = err; drawStep(true); return; }
      const reader = new FileReader();
      reader.onload = function () {
        r[t.dataset.rfile] = { name: f.name, size: f.size, type: f.type, dataUrl: reader.result };
        drawStep(true);
      };
      reader.readAsDataURL(f);
      return;
    }
    if (t.id === 'f-xlsx' && e.type === 'change') { importRecipientsFile(t.files[0]); t.value = ''; return; }
    if (t.dataset.rk) {
      const r = x.recipients[+t.dataset.ri]; r[t.dataset.rk] = t.value;
      if (t.dataset.rk === 'situation') { drawStep(true); return; }
      if (t.dataset.rk === 'natQuery') {
        r.countryCode = '';
        r.nationalite = '';
        updateCountrySuggestions(t, !!t.value.trim());
        return;
      }
      if (t.dataset.rk === 'entree') {
        const s = GO.seniority(t.value), adv = medalAdvice(s);
        const sen = $(`#r${t.dataset.ri}-sen`, document);
        if (sen) sen.textContent = s !== null && s >= 0 && t.value ? `Ancienneté : ${s} an${s > 1 ? 's' : ''}` : '';
        const a = $(`#r${t.dataset.ri}-adv`, document);
        if (a) a.textContent = adv.text;
      }
      if (t.dataset.rk === 'nom' || t.dataset.rk === 'prenom') { const h = t.closest('.recip-card').querySelector('.recip-head strong'); h.lastChild.textContent = `${r.prenom} ${r.nom}`.trim() || 'Nouveau récipiendaire'; }
    } else if (t.dataset.file && e.type === 'change') { setFile(t.dataset.file, t.files[0]); return; }
    else if (t.id === 'f-certify') x.certify = t.checked;
    else if (t.id && t.id.startsWith('f-')) {
      const k = t.id.slice(2); x[k] = t.value;
      if (k === 'org' && e.type === 'change') {
        const o = D.organisations.find(o => o.name.toLowerCase() === t.value.trim().toLowerCase());
        if (o && F.knownOrg !== o.id) {
          F.knownOrg = o.id;
          Object.assign(x, { type: o.type, sector: SECTORS.includes(o.sector) ? o.sector : 'Autre', city: o.city, contact: o.contact, contactRole: o.contactRole, email: o.email, phone: o.phone });
          setTimeout(() => { drawStep(true); const n = $('#f-type'); if (n) n.focus(); }, 0);
          GO.toast('info', 'Organisme reconnu', 'Les coordonnées connues ont été reprises. Vérifiez-les.');
        }
      }
      if (k === 'kind') { F.step = 0; F.max = 0; drawStep(true); return; }
      if (k === 'relatedRef') {
        const d = GO.getDossier(x.relatedRef);
        if (d) x.authority = d.authority || x.authority;
      }
      if (k === 'authority') { const a = GO.authority(x.authority); GO.toast('info', 'Autorité destinataire', `Dossier destiné à ${a.label}.`); }
    }
    if (F.errors[t.id]) { const m = validateField(t.id); if (!m) { delete F.errors[t.id]; showErr(t.id, ''); } }
  }
  function setFile(k, f) {
    const up = D.config.upload;
    if (!f) return;
    const err = !up.accept.includes(f.type) ? `Format non accepté. Formats possibles : ${up.acceptLabel}.` : f.size > up.maxMb * 1048576 ? `Le fichier dépasse la taille maximale de ${up.maxMb} Mo.` : '';
    if (err) { F.errors['f-' + k] = err; drawStep(true); return; }
    const reader = new FileReader();
    reader.onload = function () {
      F.data.files[k] = { name: f.name, size: f.size, type: f.type, dataUrl: reader.result };
      delete F.errors['f-' + k];
      drawStep(true);
      GO.toast('success', 'Fichier ajouté', esc(f.name));
    };
    reader.onerror = function () { F.errors['f-' + k] = 'Lecture du fichier impossible.'; drawStep(true); };
    reader.readAsDataURL(f);
  }
  function onClick(e) {
    const t = e.target;
    if (t.closest('[data-nav="prev"]')) return go(F.step - 1);
    const cc = t.closest('[data-cc]');
    if (cc) {
      const r = F.data.recipients[+cc.dataset.ri];
      if (r) {
        r.countryCode = cc.dataset.cc;
        r.nationalite = natFromCountry(r.countryCode);
        r.natQuery = countryByCode(r.countryCode)[1];
        const countryInput = $(`#r${cc.dataset.ri}-country`);
        const options = countryInput.parentNode.parentNode.querySelector('.nat-suggest');
        if (options) options.hidden = true;
        if (r.countryCode === 'GA') r.workPermit = null;
        drawStep(true);
      }
      return;
    }
    if (t.closest('[data-dl-xlsx]')) { downloadRecipTemplate(); return; }
    const rp = t.closest('[data-recip-page]');
    if (rp) {
      const pages = Math.max(1, Math.ceil(F.data.recipients.length / RECIP_PAGE));
      if (rp.dataset.recipPage === 'prev') F.recipPage = Math.max(1, (F.recipPage || 1) - 1);
      if (rp.dataset.recipPage === 'next') F.recipPage = Math.min(pages, (F.recipPage || 1) + 1);
      refreshRecips();
      return;
    }
    if (t.closest('[data-apply-xlsx]')) {
      const rows = F._importPending || [];
      if (F.data.recipients.length === 1 && !F.data.recipients[0].nom && !F.data.recipients[0].prenom) F.data.recipients = [];
      rows.forEach(r => F.data.recipients.push(Object.assign(blankR(), r)));
      F._importPending = null;
      F.recipPage = 1;
      drawStep(true);
      GO.toast('success', 'Import intégré', `${rows.length} récipiendaire(s) ajouté(s). Vérifiez les champs avant l’envoi.`);
      return;
    }
    if (t.closest('[data-cancel-xlsx]')) {
      F._importPending = null;
      const box = $('#xlsx-preview'); if (box) box.innerHTML = '';
      return;
    }
    if (t.closest('[data-add-r]')) {
      F.data.recipients.push(blankR());
      F.recipPage = Math.ceil(F.data.recipients.length / RECIP_PAGE);
      refreshRecips();
      const last = F.data.recipients.length - 1;
      const el = $(`#r${last}-nom`); if (el) el.focus();
      return;
    }
    const del = t.closest('[data-del-r]');
    if (del) {
      const i = +del.dataset.delR, card = del.closest('.recip-card');
      card.classList.add('is-removing');
      setTimeout(() => { F.data.recipients.splice(i, 1); Object.keys(F.errors).filter(k => k.startsWith('r')).forEach(k => delete F.errors[k]); refreshRecips(); GO.toast('info', 'Récipiendaire retiré'); }, GO.reduced() ? 0 : 240);
      return;
    }
    const rm = t.closest('[data-rm-f]'); if (rm) { F.data.files[rm.dataset.rmF] = null; drawStep(true); return; }
    const g = t.closest('[data-goto]'); if (g) return go(+g.dataset.goto);
    if (t.closest('[data-again]')) { F = freshForm(); F.role = GO.S.role; drawStep(true); }
  }
  function refreshRecips() {
    const host = $('#recips');
    if (!host) { drawStep(true); return; }
    const { rs, pageItems, pages } = recipPageSlice();
    host.innerHTML = pageItems.map(({ r, i }) => recipCard(r, i, rs.length)).join('');
    const cnt = $('#r-count'); if (cnt) cnt.textContent = `${plural(rs.length, 'récipiendaire', 'récipiendaires')} sur ce dossier`;
    const pg = $('#recip-pager');
    if (pg) pg.innerHTML = `<span>Page ${F.recipPage} / ${pages}</span>
      <button type="button" class="btn btn-ghost btn-xs" data-recip-page="prev" ${F.recipPage <= 1 ? 'disabled' : ''}>Précédent</button>
      <button type="button" class="btn btn-ghost btn-xs" data-recip-page="next" ${F.recipPage >= pages ? 'disabled' : ''}>Suivant</button>`;
  }

  function downloadRecipTemplate() {
    const csv = '\uFEFFNom;Prenom;Sexe;Fonction;Date entree (AAAA-MM-JJ);Medaille (bronze|argent|or);Pays (code ISO);Situation (Vivant|Decede|Mutile)\nMba;Lea;Feminin;Comptable;2010-02-01;bronze;GA;Vivant\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'modele-recipiendaires-meditra.csv';
    document.body.appendChild(a); a.click(); a.remove();
    GO.toast('info', 'Modèle téléchargé', 'Ouvrez le fichier CSV dans Excel, complétez les colonnes, puis importez-le.');
  }
  function parseCsv(text) {
    const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) return [];
    const sep = lines[0].indexOf(';') >= 0 ? ';' : ',';
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const c = lines[i].split(sep).map(s => s.trim().replace(/^"|"$/g, ''));
      if (!c[0] && !c[1]) continue;
      const medalRaw = String(c[5] || '').toLowerCase();
      const medal = medalRaw.indexOf('or') >= 0 ? 'or' : medalRaw.indexOf('arg') >= 0 ? 'argent' : medalRaw ? 'bronze' : '';
      const cc = String(c[6] || 'GA').toUpperCase().slice(0, 2);
      let sit = c[7] || 'Vivant';
      if (/d[eé]c[eè]d/i.test(sit)) sit = 'Décédé';
      else if (/mutil/i.test(sit)) sit = 'Mutilé';
      else sit = 'Vivant';
      let sexe = c[2] || '';
      if (/^f/i.test(sexe)) sexe = 'Féminin';
      else if (/^m/i.test(sexe)) sexe = 'Masculin';
      rows.push({
        nom: c[0], prenom: c[1], sexe, fonction: c[3], entree: c[4], medal,
        countryCode: COUNTRIES.some(x => x[0] === cc) ? cc : '',
        nationalite: COUNTRIES.some(x => x[0] === cc) ? natFromCountry(cc) : '',
        natQuery: COUNTRIES.some(x => x[0] === cc) ? countryByCode(cc)[1] : c[6],
        situation: sit, dateDeces: '', certDeces: null, certMedical: null, workPermit: null
      });
    }
    return rows;
  }
  function importRecipientsFile(file) {
    if (!file) return;
    const name = String(file.name || '').toLowerCase();
    if (name.endsWith('.xlsx') || file.type.indexOf('spreadsheet') >= 0) {
      GO.toast('error', 'Format Excel binaire', 'Enregistrez le classeur au format CSV (séparateur point-virgule) puis réimportez. Le modèle téléchargeable s’ouvre dans Excel.');
      return;
    }
    const reader = new FileReader();
    reader.onload = function () {
      const rows = parseCsv(String(reader.result || ''));
      const box = $('#xlsx-preview');
      if (!rows.length) {
        if (box) box.innerHTML = '<div class="alert alert-error">Aucune ligne exploitable. Vérifiez les colonnes du modèle.</div>';
        return;
      }
      const names = new Set();
      const dups = [];
      rows.forEach(r => {
        const k = norm(r.nom + '|' + r.prenom);
        if (k && names.has(k)) dups.push(r.prenom + ' ' + r.nom);
        names.add(k);
      });
      F._importPending = rows;
      if (box) box.innerHTML = `<div class="alert alert-info"><div><strong>${rows.length} ligne(s) lues</strong>${dups.length ? `<p>${dups.length} doublon(s) détecté(s) : ${esc(dups.slice(0, 3).join(', '))}</p>` : ''}
        <p>Les lignes valides seront ajoutées au formulaire. Les validations (sexe, pays, dates) restent à confirmer avant l’envoi.</p>
        <button type="button" class="btn btn-primary btn-sm" data-apply-xlsx>Intégrer les lignes</button>
        <button type="button" class="btn btn-ghost btn-sm" data-cancel-xlsx>Annuler l’import</button></div></div>`;
    };
    reader.readAsText(file, 'utf-8');
  }

  document.addEventListener('dragover', e => { const z = e.target.closest && e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.add('is-over'); } });
  document.addEventListener('dragleave', e => { const z = e.target.closest && e.target.closest('[data-drop]'); if (z) z.classList.remove('is-over'); });
  document.addEventListener('drop', e => { const z = e.target.closest && e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.remove('is-over'); setFile(z.dataset.drop, e.dataTransfer.files[0]); } });

  function validateField(id) {
    const x = F.data, v = k => String(x[k] || '').trim();
    const rm = /^r(\d+)-(\w+)$/.exec(id);
    if (rm) {
      const r = x.recipients[+rm[1]]; if (!r) return '';
      const val = String(r[rm[2]] || '').trim();
      if (rm[2] === 'entree') { if (!val) return 'Indiquez la date d’entrée.'; if (val >= GO.REF_ISO) return 'La date d’entrée doit être antérieure à aujourd’hui.'; if (val < '1950-01-01') return 'Vérifiez l’année saisie.'; return ''; }
      if (rm[2] === 'medal') return val ? '' : 'Choisissez la médaille proposée.';
      if (rm[2] === 'sexe') return val ? '' : 'Indiquez le sexe.';
      if (rm[2] === 'country' || rm[2] === 'natQuery') return r.countryCode ? '' : 'Sélectionnez un pays dans la liste.';
      if (rm[2] === 'certDeces') return r.situation === 'Décédé' && !r.certDeces ? 'Joignez le certificat de décès.' : '';
      if (rm[2] === 'certMedical') return r.situation === 'Mutilé' && !r.certMedical ? 'Joignez le certificat médical.' : '';
      if (rm[2] === 'workPermit') return r.countryCode && r.countryCode !== 'GA' && !r.workPermit ? 'Joignez l’autorisation d’emploi.' : '';
      return val.length >= 2 ? '' : { nom: 'Indiquez le nom.', prenom: 'Indiquez le prénom.', fonction: 'Indiquez la fonction.' }[rm[2]];
    }
    switch (id) {
      case 'f-kind': return v('kind') ? '' : 'Choisissez le type de demande.';
      case 'f-relatedRef': return (x.kind === 'relance' || x.kind === 'recours') && !v('relatedRef') ? 'Sélectionnez le dossier d’origine.' : '';
      case 'f-org': return v('org').length >= 2 ? '' : 'Indiquez la raison sociale de l’organisme.';
      case 'f-type': return v('type') ? '' : 'Sélectionnez le type d’organisme.';
      case 'f-sector': return v('sector') ? '' : 'Sélectionnez le secteur d’activité.';
      case 'f-city': return v('city').length >= 2 ? '' : 'Indiquez la ville.';
      case 'f-authority': return v('authority') ? '' : 'Sélectionnez l’autorité destinataire.';
      case 'f-contact': return v('contact').length >= 2 ? '' : 'Indiquez le nom de l’interlocuteur.';
      case 'f-email': return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email')) ? '' : 'Saisissez une adresse électronique valide (exemple : nom@organisme.ga).';
      case 'f-phone': return (v('phone').replace(/\D/g, '').length >= 8 && /^[+\d\s().-]+$/.test(v('phone'))) ? '' : 'Saisissez un numéro de téléphone valide (8 chiffres minimum).';
      case 'f-certify': return x.certify ? '' : 'Cette attestation est nécessaire pour soumettre le dossier.';
    }
    const fm = /^f-(demande|liste|dts)$/.exec(id);
    if (fm) {
      const need = PIECES_OF(x.kind).find(p => p[0] === fm[1] && p[3]);
      if (need) return x.files[fm[1]] ? '' : 'Cette pièce est obligatoire.';
    }
    return '';
  }
  function fieldsOf(step) {
    const follow = F.data.kind === 'relance' || F.data.kind === 'recours';
    if (step === 0) {
      const base = ['f-kind', 'f-authority'];
      if (follow) return base.concat(['f-relatedRef']);
      return base.concat(['f-org', 'f-type', 'f-sector', 'f-city', 'f-contact', 'f-email', 'f-phone']);
    }
    if (step === 1) {
      if (follow) return [];
      return F.data.recipients.flatMap((_, i) => {
        const r = F.data.recipients[i];
        const keys = ['nom', 'prenom', 'sexe', 'fonction', 'entree', 'medal', 'country'];
        if (r.situation === 'Décédé') keys.push('certDeces');
        if (r.situation === 'Mutilé') keys.push('certMedical');
        if (r.countryCode && r.countryCode !== 'GA') keys.push('workPermit');
        return keys.map(k => `r${i}-${k}`);
      });
    }
    if (step === 2) return PIECES_OF(F.data.kind).filter(p => p[3]).map(p => 'f-' + p[0]);
    return ['f-certify'];
  }
  function showErr(id, msg) {
    const f = $(`[data-f="${id}"]`); if (!f) return;
    if (f.classList.contains('dropzone')) {
      f.classList.toggle('has-error', !!msg);
      $$('.error-msg', f).forEach(n => n.remove());
      if (msg) $('.dz-main', f).insertAdjacentHTML('beforeend', `<p class="error-msg" id="${id}-err">${icon('alert-circle')}${esc(msg)}</p>`);
      const i = $('input[type=file]', f);
      if (i) { if (msg) { i.setAttribute('aria-invalid', 'true'); i.setAttribute('aria-describedby', id + '-err'); } else { i.removeAttribute('aria-invalid'); i.removeAttribute('aria-describedby'); } }
      return;
    }
    GO.fieldError(f, msg);
  }
  function validateStep() {
    const errs = {};
    fieldsOf(F.step).forEach(id => { const m = validateField(id); if (m) errs[id] = m; });
    Object.keys(F.errors).forEach(k => { if (fieldsOf(F.step).includes(k) && !errs[k]) showErr(k, ''); });
    F.errors = errs;
    $$('.form-errors').forEach(n => n.remove());
    const keys = Object.keys(errs);
    const firstR = keys.map(k => /^r(\d+)/.exec(k)).filter(Boolean)[0];
    if (firstR) {
      F.recipPage = Math.floor(+firstR[1] / RECIP_PAGE) + 1;
      if (F.step === 1) refreshRecips();
    }
    keys.forEach(k => showErr(k, errs[k]));
    if (keys.length) {
      const labelOf = id => { const l = $(`label[for="${id}"]`) || $(`[data-f="${id}"] strong`); return l ? l.textContent.replace('*', '').trim() : id; };
      const box = document.createElement('div');
      box.className = 'alert alert-error form-errors'; box.tabIndex = -1; box.setAttribute('role', 'alert');
      box.innerHTML = `${icon('alert-circle')}<div><strong>${plural(keys.length, 'champ à corriger', 'champs à corriger')}</strong><ul style="margin-top:4px;display:grid;gap:2px">${keys.slice(0, 6).map(k => `<li><a href="#${k}" data-jump="${k}">${esc(labelOf(k))}</a> — ${esc(errs[k])}</li>`).join('')}${keys.length > 6 ? `<li>et ${keys.length - 6} autre(s)…</li>` : ''}</ul></div>`;
      $('.wz-panel').prepend(box);
      box.addEventListener('click', e => { const a = e.target.closest('[data-jump]'); if (a) { e.preventDefault(); const el = document.getElementById(a.dataset.jump); if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); } } });
      box.focus();
      return false;
    }
    return true;
  }
  function go(step) { if (step < 0 || step > 3) return; F.dir = step >= F.step ? 1 : -1; F.step = step; F.errors = {}; drawStep(); }
  async function next() {
    if (!GO.can('create')) {
      GO.toast('error', 'Action non autorisée', 'Votre profil ne peut pas créer de dossier de demande.');
      return;
    }
    if (!validateStep()) return;
    if (F.step < 3) { F.max = Math.max(F.max, F.step + 1); return go(F.step + 1); }
    const x = F.data;
    const recips = (x.kind === 'relance' || x.kind === 'recours') && x.relatedRef && GO.getDossier(x.relatedRef)
      ? GO.getDossier(x.relatedRef).recipients : x.recipients;
    const missing = PIECES_OF(x.kind).filter(([k, , , req]) => req && !x.files[k]);
    if (missing.length) { GO.toast('error', 'Pièces manquantes', missing.map(p => p[1]).join(', ')); return; }
    const kindLabel = x.kind === 'relance' ? 'relance' : x.kind === 'recours' ? 'recours' : 'nouvelle demande';
    const ok = await GO.confirmDialog({ title: 'Confirmer l’envoi ?', tone: 'green', icon: 'send', confirm: 'Confirmer l’envoi',
      cancel: 'Annuler',
      message: `<p><strong>${esc(kindLabel)}</strong> — ${esc(x.org)} — <strong>${plural(recips.length, 'récipiendaire', 'récipiendaires')}</strong>.</p>
        <p>Pièces obligatoires présentes : ${PIECES_OF(x.kind).filter(p => p[3] && x.files[p[0]]).map(p => esc(p[1])).join(', ') || '—' }.</p>
        <p>Le dossier sera enregistré au secrétariat. Vous ne pourrez plus le modifier ; un complément pourra vous être demandé.</p>` });
    if (!ok) return;
    const b = $('#wz-submit');
    b.disabled = true; b.innerHTML = '<span class="spinner"></span>Envoi en cours…';
    await GO.wait(1100);
    const ref = createDossier();
    F.done = ref;
    drawStep();
    GO.toast('success', 'Dossier transmis', `${ref} est enregistré au statut « Reçu — à traiter ».`);
  }
  function createDossier() {
    const S = GO.S, x = F.data;
    let o = D.organisations.find(o => o.name.toLowerCase() === x.org.trim().toLowerCase());
    if (!o) {
      o = { id: 'o' + Date.now().toString(36), name: x.org.trim(), short: x.org.trim().split(/\s+/).slice(0, 3).join(' '), type: x.type, sector: x.sector, city: x.city, contact: x.contact, contactRole: x.contactRole, email: x.email, phone: x.phone };
      S.orgs = S.orgs || []; S.orgs.push(o); D.organisations.push(o);
    }
    const n = Math.max(...S.dossiers.map(d => +d.ref.split('-')[2])) + 1;
    const ref = 'DNG-2026-' + GO.pad(n).padStart(3, '0');
    const s = GO.stamp();
    const follow = x.kind === 'relance' || x.kind === 'recours';
    const source = follow && x.relatedRef ? GO.getDossier(x.relatedRef) : null;
    const recips = (source ? source.recipients : x.recipients).map((r, i) => ({
      id: `${ref}-R${i + 1}`, nom: (r.nom || '').trim(), prenom: (r.prenom || '').trim(), fonction: (r.fonction || '').trim(),
      entree: r.entree, medal: r.medal, sexe: r.sexe || '', nationalite: r.nationalite || 'Gabonaise',
      countryCode: r.countryCode || '', situation: r.situation || 'Vivant', dateDeces: r.dateDeces || '',
      review: '', complement: null
    }));
    const dossier = {
      ref, org: o.id, depot: GO.REF_ISO, status: 'recu', agent: null, authority: x.authority, channel: x.channel, complementSince: null,
      kind: x.kind || 'nouvelle', relatedRef: x.relatedRef || '',
      recipients: recips,
      history: [{ date: s.date, time: s.time, actor: o.name, kind: 'depot', label: (follow ? (x.kind + ' déposé') : 'Demande déposée en ligne'), ref: x.relatedRef || null }],
      observations: []
    };
    S.dossiers.push(dossier);
    if (typeof cfDeposit === 'function') {
      try {
        cfDeposit({
          destination: x.authority === 'min' ? 'ministre' : x.authority,
          kind: x.kind, relatedRef: x.relatedRef,
          pieces: PIECES_OF(x.kind).filter(p => x.files[p[0]]).map(p => p[1]),
          files: PIECES_OF(x.kind).filter(p => x.files[p[0]]).map(p => Object.assign({ kind: p[0], title: p[1] }, x.files[p[0]])),
          recipients: recips.map(r => ({
            nom: r.nom, prenom: r.prenom, poste: r.fonction, start: r.entree, metal: (GO.medal(r.medal) || {}).short || r.medal,
            sexe: r.sexe, nationalite: r.nationalite, countryCode: r.countryCode, situation: r.situation, dateDeces: r.dateDeces
          }))
        });
      } catch (err) { if (typeof console !== 'undefined' && console.warn) console.warn('cfDeposit', err); }
    }
    if (typeof addDossierRecord === 'function') {
      try {
        addDossierRecord('enterprise', {
          destination: x.authority === 'ministre' ? 'ministre' : x.authority,
          letter: x.files.demande,
          dts: x.files.dts,
          extras: [x.files.liste, x.files.autres].filter(Boolean),
          recipients: recips.map(r => ({
            prenom: r.prenom, nom: r.nom, name: (r.prenom + ' ' + r.nom).trim(),
            start: r.entree, medal: (GO.medal(r.medal) || {}).short || r.medal,
            nationalite: r.nationalite, dateDeces: r.dateDeces, situationPhysique: r.situation, sexe: r.sexe
          }))
        });
      } catch (err) { if (typeof console !== 'undefined' && console.warn) console.warn('addDossierRecord', err); }
    }
    if (x.files.dts) {
      recips.forEach((r) => {
        S.dts.push({ id: GO.nextRef('DTS-2026-', S.dts, 1), dossier: ref, recipient: r.id, employer: o.name, position: r.fonction, start: r.entree, reference: x.files.dts.name, state: 'saisi', filed: GO.REF_ISO });
      });
    }
    PIECES_OF(x.kind).forEach(([k, t]) => {
      const f = x.files[k];
      if (!f) return;
      GO.newDoc({ dossier: ref, kind: k === 'demande' ? 'demande' : (k === 'liste' ? 'liste' : (k === 'dts' ? 'dts' : 'upload')), type: k === 'demande' ? 'entrant' : 'piece', title: t, date: GO.REF_ISO, from: o.name, state: 'depose', file: f, pages: 2 });
    });
    recips.forEach((r, i) => {
      const src = follow ? null : x.recipients[i];
      if (!src) return;
      [['certDeces', 'Certificat de décès'], ['certMedical', 'Certificat médical'], ['workPermit', 'Autorisation d’emploi']].forEach(([k, title]) => {
        if (src[k]) GO.newDoc({ dossier: ref, kind: 'upload', type: 'piece', title: title + ' — ' + r.prenom + ' ' + r.nom, date: GO.REF_ISO, from: o.name, state: 'depose', file: src[k], pages: 1 });
      });
    });
    // Registre du secrétariat de l'autorité destinataire
    GO.registryAdd(null, dossier);
    GO.notify({ type: 'depot', aud: 'authority:' + x.authority, ref, title: 'Nouveau dossier à enregistrer', msg: `${o.name} — ${plural(x.recipients.length, 'récipiendaire', 'récipiendaires')} (voie : ${x.channel}).` });
    GO.notify({ type: 'depot', aud: 'service', ref, title: 'Nouveau dossier reçu', msg: `${o.name} propose ${plural(x.recipients.length, 'récipiendaire', 'récipiendaires')}.` });
    if (GO.scopeOrg() && GO.scopeOrg().id === o.id) GO.notify({ type: 'depot', aud: 'org:' + o.id, ref, title: 'Votre dossier a été transmis', msg: `Enregistré au registre du secrétariat de ${GO.authority(x.authority).short}.` });
    GO.commit();
    return ref;
  }
  GO.views.nouveau = { render: renderForm, state: () => F };

  /* ======================= BÉNÉFICIAIRES ET RÉCIPIENDAIRES ======================= */
  const BF = { q: '', medal: 'all', status: 'all', dts: 'all', page: 1, size: 10 };
  function allRecipients() {
    const out = [];
    GO.myDossiers().forEach(d => d.recipients.forEach(r => {
      const t = GO.S.dts.find(x => x.recipient === r.id);
      const rem = GO.remiseOf(d.ref);
      const disc = GO.S.distinctions.find(x => x.person === r.id && x.dossier === d.ref);
      out.push({ r, d, dts: t, remise: rem && (rem.recipients || []).includes(r.id) ? rem : null, disc });
    }));
    return out;
  }
  function renderBeneficiaires(main, r) {
    const q0 = r.params.get('q'); if (q0) BF.q = q0;
    const rows = allRecipients();
    main.innerHTML = `
      ${ui.head({ eyebrow: 'Suivi', title: 'Bénéficiaires et récipiendaires',
        sub: 'Personnes proposées ou distinguées, ancienneté déclarée, pièces au dossier et suites du circuit.',
        actions: GO.can('create') ? `<a class="btn btn-primary" href="#/nouveau">${icon('plus')}Nouveau dossier</a>` : '' })}
      <section class="card reveal" style="--i:1">
        ${ui.toolbar({ search: { id: 'bf-q', label: 'Rechercher', placeholder: 'Nom, fonction, organisme, dossier…', value: BF.q },
          selects: [
            { id: 'bf-status', label: 'Statut du dossier', value: BF.status, options: [{ value: 'all', label: 'Tous les statuts' }, ...D.statusOrder.map(s => ({ value: s, label: D.statuses[s].label }))] },
            { id: 'bf-medal', label: 'Médaille', value: BF.medal, options: [{ value: 'all', label: 'Toutes les médailles' }, ...D.medals.map(m => ({ value: m.id, label: m.short }))] },
            { id: 'bf-dts', label: 'DTS', value: BF.dts, options: [{ value: 'all', label: 'Toutes les DTS' }, { value: 'verifie', label: 'Vérifiée' }, { value: 'saisi', label: 'Saisie, non vérifiée' }, { value: 'anomalie', label: 'Anomalie' }, { value: 'none', label: 'Non saisie' }] }
          ] })}
        ${ui.filterBar('', '<span id="bf-count" aria-live="polite"></span>')}
        <div class="table-wrap" id="bf-wrap"><table class="data-table responsive" id="bf-table">
          <caption class="sr-only">Récipiendaires et bénéficiaires</caption>
          <thead><tr><th scope="col">Nom et prénom</th><th scope="col">Organisme</th><th scope="col">Fonction</th><th scope="col">Ancienneté</th><th scope="col">Médaille</th><th scope="col">Dossier</th><th scope="col">DTS</th><th scope="col">Remise</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
          <tbody></tbody></table><div id="bf-empty"></div><div id="bf-pager"></div></div>
      </section>`;
    const draw = () => {
      const q = norm(BF.q.trim());
      const list = rows.filter(({ r, d, dts }) => {
        const o = GO.org(d.org);
        const okQ = !q || norm(`${r.nom} ${r.prenom} ${r.fonction} ${o.name} ${o.short} ${d.ref}`).includes(q);
        const okS = BF.status === 'all' || d.status === BF.status;
        const okM = BF.medal === 'all' || r.medal === BF.medal;
        const st = dts ? dts.state : 'none';
        const okD = BF.dts === 'all' || (BF.dts === 'verifie' ? st === 'verifie' : BF.dts === 'none' ? st === 'none' : st === BF.dts);
        return okQ && okS && okM && okD;
      });
      $('#bf-count').innerHTML = `<strong>${list.length}</strong> ${list.length > 1 ? 'personnes affichées' : 'personne affichée'} sur ${rows.length}`;
      const pageRows = ui.slicePage(list, BF);
      $('#bf-table tbody').innerHTML = pageRows.map(({ r, d, dts, remise }, i) => {
        const o = GO.org(d.org), e = GO.eligibility(r);
        return `<tr class="is-clickable row-in" style="--i:${i}" data-ref="${d.ref}">
          <td class="td-head" data-label="Nom et prénom"><strong style="color:var(--navy-900)">${esc(r.nom.toUpperCase())}</strong> ${esc(r.prenom)}</td>
          <td data-label="Organisme"><div class="cell-org"><strong>${esc(o.short)}</strong><span>${esc(o.city)}</span></div></td>
          <td data-label="Fonction">${esc(r.fonction)}</td>
          <td data-label="Ancienneté" class="tnum nowrap">${e.years} ans${!e.ok ? ' ' + GO.badge('écart', 'yellow') : ''}</td>
          <td data-label="Médaille" class="nowrap">${esc(GO.medal(r.medal).short)}</td>
          <td data-label="Dossier"><span class="ref">${esc(d.ref)}</span><br>${GO.statusBadge(d.status)}</td>
          <td data-label="DTS" class="nowrap">${dts ? GO.dictBadge(D.dtsStates, dts.state) : GO.badge('non saisie', 'slate')}</td>
          <td data-label="Remise" class="nowrap">${remise ? GO.dictBadge(D.remiseStates, remise.state) : '<span class="muted">—</span>'}</td>
          <td class="cell-actions"><button type="button" class="btn btn-secondary btn-sm" data-open="${d.ref}">Ouvrir</button></td>
        </tr>`;
      }).join('');
      $('#bf-table').hidden = !list.length;
      $('#bf-empty').innerHTML = list.length ? '' : GO.empty('users', 'Aucun bénéficiaire ne correspond', 'Modifiez la recherche ou les filtres pour élargir les résultats.');
      const bpg = $('#bf-pager'); if (bpg) bpg.innerHTML = list.length ? ui.pager(BF) : '';
    };
    $('#bf-q', main).addEventListener('input', GO.debounce(e => { BF.q = e.target.value; BF.page = 1; draw(); }, 150));
    $('#bf-status', main).addEventListener('change', e => { BF.status = e.target.value; BF.page = 1; draw(); });
    $('#bf-medal', main).addEventListener('change', e => { BF.medal = e.target.value; BF.page = 1; draw(); });
    $('#bf-dts', main).addEventListener('change', e => { BF.dts = e.target.value; BF.page = 1; draw(); });
    ui.bindPager($('#bf-pager', main) || main, BF, draw);
    $('#bf-table', main).addEventListener('click', e => {
      const tr = e.target.closest('tr[data-ref]'); if (!tr) return;
      (GO.openDossier || function (r) { location.hash = '#/dossiers/' + r; })(tr.dataset.ref);
    });
    draw();
  }
  GO.views.beneficiaires = { render: renderBeneficiaires };

  /* ======================= DTS ET PIÈCES JUSTIFICATIVES ======================= */
  const PF = { q: '', state: 'all', dossier: 'all' };
  function renderPieces(main, r) {
    const service = GO.isFamily('service', 'inspection');
    const pers = GO.role().scope && GO.role().scope.kind === 'person';
    const dtsList = GO.myDts().slice().sort((a, b) => (b.filed || '').localeCompare(a.filed || ''));
    const docs = GO.myDocs().filter(x => x.type === 'piece' || x.kind === 'upload' || x.kind === 'liste' || x.kind === 'attestations' || x.state === 'illisible').sort((a, b) => b.date.localeCompare(a.date));
    const dossiers = [...new Set(GO.myDossiers().map(d => d.ref))].sort();
    main.innerHTML = `
      ${ui.head({ eyebrow: 'Instruction', title: pers ? 'Mes documents' : 'DTS et pièces justificatives',
        sub: pers ? 'Déclarations de travail et de salaire et pièces versées aux dossiers vous concernant.' : service ? 'Déclarations de travail et de salaire à vérifier et pièces jointes des dossiers dont vous avez la charge.' : 'Déclarations de travail et de salaire et pièces jointes de vos dossiers.',
        actions: GO.can('answer') ? `<button class="btn btn-primary" type="button" id="pc-add">${icon('plus')}Déposer une pièce</button>` : '' })}
      <section class="card reveal" style="--i:1">
        ${ui.toolbar({ search: { id: 'pc-q', label: 'Rechercher', placeholder: 'Nom, référence de DTS, organisme…', value: PF.q },
          selects: [
            { id: 'pc-state', label: 'État', value: PF.state, options: [{ value: 'all', label: 'Tous les états' }, ...Object.entries(D.dtsStates).map(([k, v]) => ({ value: k, label: v.label }))] },
            { id: 'pc-dossier', label: 'Dossier', value: PF.dossier, options: [{ value: 'all', label: 'Tous les dossiers' }, ...dossiers.map(d => ({ value: d, label: d }))] }
          ] })}
        ${ui.filterBar('', '<span id="pc-count" aria-live="polite"></span>')}
        <div class="table-wrap"><table class="data-table responsive" id="pc-table">
          <caption class="sr-only">Déclarations de travail et de salaire</caption>
          <thead><tr><th scope="col">Récipiendaire</th><th scope="col">Dossier</th><th scope="col">Référence de la DTS</th><th scope="col">Date d’entrée</th><th scope="col">Déposée le</th><th scope="col">État</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
          <tbody></tbody></table><div id="pc-empty"></div></div>
      </section>
      <section class="card reveal mt" style="--i:2" aria-labelledby="pc-docs-t">
        <div class="card-head"><div><h2 class="card-title" id="pc-docs-t">${icon('paperclip')}Pièces justificatives</h2>
          <p class="card-sub">${plural(docs.length, 'pièce versée', 'pièces versées')} aux dossiers</p></div></div>
        <div id="pc-docs">${docs.length ? docs.map(x => { const d = GO.getDossier(x.dossier); return `<div class="doc-mini"><span class="doc-ico t-${x.type}">${icon('paperclip')}</span>
          <div><strong>${esc(x.title)}</strong><span>${esc(x.dossier)} · ${esc(GO.org(d.org).short)} · ${fmtDate(x.date, 'short')} · ${esc(x.from)}</span><div style="margin-top:4px">${GO.docBadge(x.state)}</div></div>
          <div style="display:flex;gap:6px">${GO.role().views.includes('courriers') ? `<a class="btn btn-secondary btn-xs" href="#/courriers/${x.id}">${icon('eye', 'ic-sm')}Consulter</a>` : ''}
            ${service && x.state === 'illisible' ? `<button class="btn btn-secondary btn-xs" type="button" data-renum="${x.id}">${icon('refresh', 'ic-sm')}Renumériser</button>` : ''}</div></div>`; }).join('')
          : GO.empty('paperclip', 'Aucune pièce', 'Les pièces versées aux dossiers apparaîtront ici.')}</div>
      </section>`;
    const draw = () => {
      const q = norm(PF.q.trim());
      const list = dtsList.filter(t => {
        const d = GO.getDossier(t.dossier), rec = d.recipients.find(x => x.id === t.recipient) || {};
        const okQ = !q || norm(`${rec.nom || ''} ${rec.prenom || ''} ${t.reference} ${t.employer} ${t.dossier}`).includes(q);
        return okQ && (PF.state === 'all' || t.state === PF.state) && (PF.dossier === 'all' || t.dossier === PF.dossier);
      });
      $('#pc-count').innerHTML = `<strong>${list.length}</strong> ${list.length > 1 ? 'DTS affichées' : 'DTS affichée'}`;
      $('#pc-table tbody').innerHTML = list.map((t, i) => {
        const d = GO.getDossier(t.dossier), rec = d.recipients.find(x => x.id === t.recipient) || {};
        return `<tr class="row-in" style="--i:${i}">
          <td class="td-head" data-label="Récipiendaire"><strong style="color:var(--navy-900)">${esc((rec.nom || '').toUpperCase())}</strong> ${esc(rec.prenom || '')}<br><span class="muted" style="font-size:12px">${esc(t.employer)}</span></td>
          <td data-label="Dossier"><span class="ref">${esc(t.dossier)}</span></td>
          <td data-label="Référence" class="ref">${esc(t.reference || '—')}</td>
          <td data-label="Date d’entrée" class="tnum nowrap">${t.start ? fmtDate(t.start, 'short') : '—'}</td>
          <td data-label="Déposée le" class="tnum nowrap">${t.filed ? fmtDate(t.filed, 'short') : '—'}</td>
          <td data-label="État">${GO.dictBadge(D.dtsStates, t.state)}${t.verifiedBy ? `<br><span class="muted" style="font-size:11.5px">${esc(t.verifiedBy)} · ${fmtDate(t.verifiedOn, 'short')}</span>` : ''}${t.note ? `<br><span class="muted" style="font-size:11.5px">${esc(t.note)}</span>` : ''}</td>
          <td class="cell-actions">${service ? `<button class="btn btn-secondary btn-sm" type="button" data-verify="${t.id}">${icon('shield', 'ic-sm')}Vérifier</button>`
            : GO.external() ? `<button class="btn btn-secondary btn-sm" type="button" data-complete="${t.id}">${icon('edit', 'ic-sm')}Compléter</button>` : `<a class="btn btn-secondary btn-sm" href="#/dossiers/${t.dossier}">Ouvrir</a>`}</td>
        </tr>`;
      }).join('');
      $('#pc-table').hidden = !list.length;
      $('#pc-empty').innerHTML = list.length ? '' : GO.empty('search', 'Aucune DTS ne correspond', 'Modifiez la recherche ou l’état sélectionné.');
    };
    $('#pc-q', main).addEventListener('input', GO.debounce(e => { PF.q = e.target.value; draw(); }, 150));
    $('#pc-state', main).addEventListener('change', e => { PF.state = e.target.value; draw(); });
    $('#pc-dossier', main).addEventListener('change', e => { PF.dossier = e.target.value; draw(); });
    main.addEventListener('click', e => {
      const v = e.target.closest('[data-verify]');
      if (v) {
        const t = GO.S.dts.find(x => x.id === v.dataset.verify), d = GO.getDossier(t.dossier);
        GO.formModal({
          title: 'Vérification de la DTS', icon: 'shield', tone: 'blue',
          intro: `<p>Déclaration <strong>${esc(t.reference || t.id)}</strong> — ${esc(t.employer)}, ${esc(t.position)}, entrée le ${fmtDate(t.start)}.</p>`,
          fields: [
            { id: 'state', label: 'Conclusion du contrôle', type: 'select', options: [{ value: 'verifie', label: 'DTS vérifiée — ancienneté confirmée' }, { value: 'anomalie', label: 'Anomalie — correction demandée' }, { value: 'attendu', label: 'Pièce attendue du demandeur' }] },
            { id: 'note', label: 'Observation', type: 'textarea', rows: 2, required: true, validate: val => val.length >= 5 ? '' : 'Consignez le résultat du contrôle.' }
          ],
          submit: 'Enregistrer', iconSubmit: 'check',
          run: val => {
            t.state = val.state; t.note = val.note;
            if (val.state === 'verifie') { t.verifiedBy = GO.user().name; t.verifiedOn = GO.REF_ISO; }
            GO.addHistory(d, 'instruction', `DTS ${t.id} — ${D.dtsStates[val.state].label}`, GO.actorName(), { detail: val.note });
            GO.notify({ type: 'transmission', aud: 'org:' + d.org, ref: d.ref, title: `DTS ${D.dtsStates[val.state].label.toLowerCase()}`, msg: val.note });
            GO.commit(); GO.refreshDossier(d, false); renderPieces($('#view'), GO.current());
            GO.toast('success', 'DTS mise à jour', D.dtsStates[val.state].label);
          }
        });
        return;
      }
      const c = e.target.closest('[data-complete]');
      if (c) {
        const t = GO.S.dts.find(x => x.id === c.dataset.complete), d = GO.getDossier(t.dossier);
        GO.formModal({
          title: 'Compléter la déclaration de travail et de salaire', icon: 'edit', tone: 'blue',
          intro: `<p>Déclaration de <strong>${esc(t.employer)}</strong> pour ${esc(t.dossier)}.</p>`,
          fields: [
            { id: 'ref', label: 'Référence de la DTS', type: 'text', required: true, value: t.reference === '—' ? '' : t.reference, placeholder: 'Exemple : OE/DRH/DTS/2026-011' },
            { id: 'file', label: 'DTS numérisée', type: 'file', hint: 'Le fichier est conservé avec le dossier. La DTS peut être complétée après le dépôt.' }
          ],
          submit: 'Transmettre au service', iconSubmit: 'send',
          run: val => {
            t.reference = val.ref; t.state = 'saisi'; t.filed = GO.REF_ISO;
            GO.newDoc({ dossier: t.dossier, kind: 'dts', type: 'piece', title: 'DTS — ' + val.ref, date: GO.REF_ISO, from: GO.org(d.org).name, state: 'depose', file: val.file || null });
            GO.addHistory(d, 'depot', 'DTS complétée par le demandeur', undefined, { detail: val.ref });
            GO.notify({ type: 'depot', aud: 'service', ref: d.ref, title: 'DTS complétée', msg: `${GO.org(d.org).short} — ${val.ref}.` });
            GO.commit(); GO.refreshDossier(d, false); renderPieces($('#view'), GO.current());
            GO.toast('success', 'DTS transmise', val.ref);
          }
        });
        return;
      }
      const rn = e.target.closest('[data-renum]');
      if (rn) {
        const doc = GO.getDoc(rn.dataset.renum), d = GO.getDossier(doc.dossier);
        GO.confirmDialog({ title: 'Demander une nouvelle numérisation ?', tone: 'yellow', icon: 'refresh', confirm: 'Envoyer la demande',
          message: `<p>${esc(GO.org(d.org).name)} sera invité à transmettre de nouveau « ${esc(doc.title)} » dans un format lisible.</p>` }).then(ok => {
          if (!ok) return;
          doc.state = 'renum';
          GO.addHistory(d, 'courrier', 'Nouvelle numérisation demandée : ' + doc.title);
          GO.notify({ type: 'complement', aud: 'org:' + d.org, ref: d.ref, title: 'Document à renvoyer', msg: `Le fichier « ${doc.title} » est illisible. Merci de le transmettre de nouveau.` });
          GO.commit(); renderPieces($('#view'), GO.current());
          GO.toast('success', 'Demande envoyée', esc(GO.org(d.org).name));
        });
      }
    });
    const add = $('#pc-add', main);
    if (add) add.addEventListener('click', () => {
      const first = GO.myDossiers()[0];
      GO.formModal({
        title: 'Déposer une pièce justificative', icon: 'upload', tone: 'blue',
        fields: [
          { id: 'dossier', label: 'Dossier', type: 'select', options: GO.myDossiers().map(d => ({ value: d.ref, label: `${d.ref} — ${GO.org(d.org).short}` })) },
          { id: 'title', label: 'Intitulé de la pièce', type: 'text', required: true, placeholder: 'Exemple : Attestation d’ancienneté — R2', validate: v => v.length >= 4 ? '' : 'Indiquez un intitulé.' },
          { id: 'file', label: 'Fichier', type: 'text', required: true, placeholder: 'attestation-anciennete.pdf', hint: `${D.config.upload.acceptLabel} · ${D.config.upload.maxMb} Mo maximum (fichier simulé).` }
        ],
        submit: 'Déposer', iconSubmit: 'upload',
        run: v => {
          const d = GO.getDossier(v.dossier);
          GO.newDoc({ dossier: d.ref, kind: 'upload', type: 'piece', title: v.title, date: GO.REF_ISO, from: GO.org(d.org).name, state: 'depose', file: { name: v.file, size: 248000, type: 'application/pdf' } });
          GO.addHistory(d, 'depot', 'Pièce déposée : ' + v.title);
          GO.notify({ type: 'depot', aud: 'service', ref: d.ref, title: 'Pièce reçue', msg: v.title });
          GO.commit(); GO.refreshDossier(d, false); renderPieces($('#view'), GO.current());
          GO.toast('success', 'Pièce déposée', v.title);
        }
      });
      void first;
    });
    draw();
  }
  GO.views.pieces = { render: renderPieces };

  /* ======================= MES DISTINCTIONS (RÉCIPIENDAIRE) ======================= */
  function renderDistinctions(main) {
    const p = GO.S.person;
    const ids = p ? p.ids : [];
    const list = GO.S.distinctions.filter(x => ids.includes(x.person));
    const nextCer = GO.myCers().filter(c => c.date >= GO.REF_ISO && c.state !== 'termine');
    main.innerHTML = `
      ${ui.head({ eyebrow: 'Bénéficiaire', title: 'Mes distinctions',
        sub: p ? `Relevé des distinctions attribuées à ${esc(p.prenom)} ${esc(p.nom)} — ${esc(p.fonction)}.` : 'Relevé de vos distinctions.',
        actions: GO.can('retrait') ? `<button class="btn btn-secondary" type="button" id="dz-retrait">${icon('medal')}Demander un retrait sans cérémonie</button>` : '' })}
      <section class="card reveal mt" style="--i:1">${ui.kpis([
        { label: 'Distinctions attribuées', count: list.length, note: 'depuis 2015' },
        { label: 'Remises effectuées', count: list.filter(x => x.state === 'remise').length, note: 'médaille et diplôme reçus' },
        { label: 'En attente de remise', count: list.filter(x => x.state === 'attribue').length, note: 'après validation de la cérémonie' },
        { label: 'Cérémonies à venir', count: nextCer.length, note: 'vous concernant' }
      ])}</section>
      <div class="grid grid-2 mt">
        <section class="card reveal" style="--i:2" aria-labelledby="dz-t">
          <div class="card-head"><div><h2 class="card-title" id="dz-t">${icon('medal')}Relevé des distinctions</h2><p class="card-sub">Références, dossiers et modalités de remise</p></div></div>
          ${list.length ? `<div class="table-wrap"><table class="data-table responsive"><thead><tr><th scope="col">Distinction</th><th scope="col">Année</th><th scope="col">Dossier</th><th scope="col">Cérémonie</th><th scope="col">État</th></tr></thead><tbody>
            ${list.map(x => `<tr><td data-label="Distinction"><strong style="color:var(--navy-900)">${esc(GO.medal(x.medal).short)}</strong><br><span class="ref">${esc(x.id)}</span></td>
              <td data-label="Année" class="tnum">${x.year}</td>
              <td data-label="Dossier">${GO.role().views.includes('dossiers') ? GO.refChip(x.dossier) : `<span class="ref">${esc(x.dossier)}</span>`}</td>
              <td data-label="Cérémonie">${x.ceremony ? `<span class="ref">${esc(x.ceremony)}</span><br><span class="muted" style="font-size:12px">${esc(x.venue || '')}</span>` : '<span class="muted">—</span>'}</td>
              <td data-label="État">${x.state === 'remise' ? GO.badge('Remise effectuée', 'green') : GO.badge('Attribuée', 'blue')}<br><span class="muted" style="font-size:11.5px">${fmtDate(x.date, 'short')}</span></td></tr>`).join('')}
          </tbody></table></div>` : GO.empty('medal', 'Aucune distinction', 'Vos distinctions apparaîtront ici après la décision d’attribution.')}
        </section>
        <div class="stack">
          ${nextCer.length ? ui.card({ i: 3, icon: 'calendar', title: 'Cérémonies à venir', sub: 'Dates confirmées et propositions en cours', body: `<ul class="mini-agenda">${nextCer.map(c => { const dt = GO.parseISO(c.date); return `<li><span class="date-tile"><b>${dt.getDate()}</b><span>${GO.MONTHS_S[dt.getMonth()]}</span></span>
            <span><strong>${esc(c.id)} — ${esc(GO.venue(c.venue).name)}</strong><small>${esc(c.time.replace(':', ' h '))} · ${esc(GO.venue(c.venue).city)}</small></span>${GO.cerBadge(c.state)}</li>`; }).join('')}</ul>` })
          : ui.card({ i: 3, icon: 'calendar', title: 'Cérémonies à venir', body: GO.empty('calendar', 'Aucune cérémonie', 'Les cérémonies vous concernant apparaîtront ici après validation de la date.') })}
          ${ui.card({ i: 4, icon: 'bell', title: 'Notifications récentes', sub: 'Événements vous concernant',
            body: GO.myNotifs().length ? `<ul class="list-plain">${GO.myNotifs().slice(0, 4).map(n => `<li><span style="min-width:0"><strong style="display:block;font-size:13px;color:var(--navy-900)">${esc(n.title)}</strong>
              <span class="muted" style="font-size:12px">${esc(n.msg)}</span></span><span class="muted tnum" style="font-size:11.5px">${esc(relDay(n.date))}</span></li>`).join('')}</ul>`
              : GO.empty('bell', 'Aucune notification', 'Vous serez notifié à chaque étape vous concernant.') })}
          ${ui.card({ i: 5, icon: 'user', title: 'Mes affiliations', sub: 'Employeur déclaré au dossier',
            body: ui.dl([['Nom', `${esc(p.prenom)} ${esc(p.nom)}`], ['Fonction', esc(p.fonction)], ['Employeur', esc(GO.org(p.org).name)], ['Entrée dans l’organisme', fmtDate(p.entree)], ['Ancienneté', `${GO.seniority(p.entree)} ans`]]) })}
        </div>
      </div>`;
    const btn = $('#dz-retrait', main);
    if (btn) btn.addEventListener('click', () => {
      const d = GO.myDossiers().find(x => x.status === 'approuve' && !GO.withdrawalOf(x.ref) && GO.remiseOf(x.ref) === undefined);
      if (!d) { GO.toast('info', 'Aucun dossier éligible', 'Aucun dossier approuvé sans modalité de remise n’est rattaché à votre profil.'); return; }
      $('#view').dispatchEvent(new Event('noop'));
      (GO.openDossier || function (r) { location.hash = '#/dossiers/' + r; })(d.ref);
      setTimeout(() => { const b = $('.drawer [data-act="retrait_demande"]'); if (b) b.click(); else if (GO.dossierActions) GO.dossierActions.retrait_demande(d); }, 400);
    });
  }
  GO.views.distinctions = { render: renderDistinctions };
})(window.GO);
