# Calendrier des cérémonies

> Composant calendrier mensuel pour la planification des cérémonies de remise de distinctions nationales.

## 1. Vue d'ensemble

Le calendrier est une vue mensuelle des cérémonies, accessible depuis la page `Cérémonies` des rôles autorisés (entreprise, personne, ministre, DGT, DR, service chef, service agent, service inspecteur, secrétaire).

### Accès
- **URL internes** : `#/app/<role>/ceremonies` (rôles workspace)
- **URL Demandeur** : `#/app/demandeur/ceremony-calendar` (vue calendrier) et `#/app/demandeur/ceremonies` (listes + stats)
- **Composant JS internes** : `wsCalendar(role, options)` dans `js/views/workspace.js`
- **Composant JS Demandeur** : `renderMonthCalendar(events, options)` dans `js/views/portal-extras.js` — même grille 7 colonnes, alimentée par `DemoStore.ceremonies` via `toCalendarEvent`
- **Données internes** : `wsCalendarSeed()` retourne 8 cérémonies fictives pour 2026.
- **Données Demandeur** : cérémonies de l’organisation connectée uniquement (entreprise ou ministère).

## 2. Structure visuelle

- **Toolbar** : navigation `<` mois précédent, label `Octobre 2026`, `>` mois suivant, bouton "Aujourd'hui".
- **Grille** : 7 colonnes (Lun → Dim), 5 à 6 lignes selon le mois.
- **Cellules** : numéro de jour, jusqu'à 3 pastilles de cérémonies visibles, puis indicateur `+N` si plus.
- **Pastille** : bordure colorée par médaille (Bronze `#c39600`, Argent `#6b8cb5`, Or `#d6a72c`, pending gris).

### États de cellule
- `.ws-calendar-cell` — cellule standard.
- `.is-other` — jour d'un autre mois (transparence).
- `.is-today` — jour courant (bordure verte, halo).
- `.is-selected` — jour sélectionné (bordure bleue).

## 3. Comportement

- **Navigation** : `wsState.calendarOffset` (entier relatif au mois courant, 0 = mois actuel).
- **Aujourd'hui** : bouton qui réinitialise `calendarOffset` à 0.
- **Clic sur pastille** : ouvre un modal de détail (`wsEventDetail(id)`).
- **Détail modal** : date (jour + mois complet), heure, lieu, statut, récipiendaires, campagne, médaille, organisation.
- **Modal CTA** : "Voir la liste" renvoie vers la page `Cérémonies`.

## 4. Données nécessaires

Chaque cérémonie doit fournir :

| Champ | Type | Description |
|---|---|---|
| `id` | string | Identifiant unique (ex. `CAL-2026-004`) |
| `date` | string (ISO) | Date de la cérémonie (`2026-04-04`) |
| `time` | string | Heure de début (`10:00`) |
| `place` | string | Lieu complet |
| `title` | string | Titre public |
| `medal` | "Bronze"\|"Argent"\|"Or" | Type de médaille |
| `campaign` | string | Campagne (`2026`) |
| `status` | string | `Confirmée`, `Planifiée`, `À confirmer` |
| `recipients` | number | Nombre de récipiendaires |
| `organisation` | string | Organisation concernée |

## 5. Permissions

| Profil | Lecture | Détail modal |
|---|:-:|:-:|
| Demandeur / Personne | ✅ | ✅ |
| Secrétariat | ✅ | ✅ |
| Ministre / DGT / DR | ✅ | ✅ |
| Service Agent | ✅ | ✅ |
| Service Inspecteur | ✅ | ✅ |
| Service Chef | ✅ | ✅ (peut modifier) |
| Régisseur | ✅ | ✅ |
| Administrateur | ❌ (pas dans la nav admin) | ❌ |

## 6. Responsive

- **> 900px** : cellules `min-height: 84px`, pastilles lisibles.
- **≤ 900px** : cellules `min-height: 64px`, pastilles plus petites.
- **≤ 560px** : grille scrollable horizontalement, `min-width: 70px` par cellule.
- **Mobile menu** : les tabs disparaissent (`display: none`), un menu déroulant `ws-mobile-menu` apparaît.

## 7. Tests

Tests dans `tests/smoke.cjs` :
- `le calendrier mensuel des cérémonies est généré` : vérifie la présence de `ws-calendar`, `ws-calendar-grid`, ≥ 35 cellules, ≥ 1 cérémonie.

## 8. Limites

- Pas de vue semaine / jour (volontairement, pour rester compact).
- Pas d'édition inline (la modification se fait via la page `Cérémonies` ou via un service backend futur).
- Pas de drag & drop.
- Pas de synchronisation calendrier externe.
- **Carte de demande** : aucun Leaflet / géocodage. Bandeau « Mode démonstration — lieux prédéfinis ». Liste `DEMO_PLACES` uniquement.
- Image du lieu : illustration neutre, jamais présentée comme une photographie du site.
- Dates proposées vs confirmées distinguées. Participants : à venir = invités/confirmés ; passé = « Présent » seulement si enregistré.

## 9. Évolution future

- Synchronisation avec un service backend (Laravel).
- Vue timeline pour les 12 prochains mois.
- Filtres par campagne, statut, médaille, lieu.
- Notification automatique pour les récipiendaires 7 jours avant.
