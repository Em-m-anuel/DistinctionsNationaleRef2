# GAB-ORIENT — Référence de conception (application existante)

La **source canonique** du prototype est `design-reference/DESIGN_REFERENCE.md` (copie de [DistinctionsNationaleReference](https://github.com/Em-m-anuel/DistinctionsNationaleReference.git)).

Ce fichier décrit **comment lire cette référence depuis le dépôt FrontII**, sans substituer le prototype à l’application.

## 1. Où est la référence

```
design-reference/
  index.html
  DESIGN_REFERENCE.md          ← règles visuelles et comportementales du prototype
  assets/css/gab-orient.css
  assets/js/{core,data,charts,map,views-*}.js
```

Lancement : serveur statique dans `design-reference/` (ex. port 8010). Aucune compilation. Leaflet et Google Fonts sont **facultatifs** ; sans réseau, polices système + plan schématique.

## 2. Ce que le prototype n’est pas

- Pas un second frontend à brancher à la place de `#/app/<rôle>/<page>`.
- Pas une source de données métier (`GO_DATA.seed` ≠ `js/cf-store.js`).
- Pas un remplacement de l’authentification (`GO` change de profil en local).
- Pas une justification pour unifier tous les rôles en un seul tableau de bord.

## 3. Direction artistique à reproduire (résumé)

Voir le détail dans `design-reference/DESIGN_REFERENCE.md` §3–8.

| Règle | Prototype | Application actuelle (à rapprocher, pas à copier-coller) |
| --- | --- | --- |
| Fond | `#f3f5f9` + halos bleu/vert discrets | `#fcfcfa` + grain papier (`css/theme.css`, `css/cf.css`) |
| Surfaces | cartes `#fff`, secondaires `#f8fafc` / `#f1f4f8` | `.portal-paper` blanc, `.portal-feature` `#f9f8f4` |
| Encre | navy `#0c1f3a` | ink `#142d52` / `#102A50` |
| Accents | vert `#009e60`, jaune `#fcd116`, bleu `#3a75c4` | `#009b62` / `#d6a72c` / `#315c91` (mêmes familles) |
| Typo | Public Sans + Source Serif 4 (titres de page) | Inter + Sora + Lora |
| En-tête | 2 lignes sticky, barre tricolore de **défilement** | `portal-top` + `portal-tabs` + `.auth-topline` (fixe) |
| Densité | cartes denses, gouttière 20 px, conteneur 1320 px | à resserrer (heroes trop hauts, listes trop vides) |
| Interdit | aplat beige/crème, illustration décorative, % inventés | idem |

**Principe :** identité nationale par **touches** (emblème, barre de scroll, liseré, points de pied de page), pas par des aplats.

## 4. Comportements à viser

1. En-tête de page compact : surtitre (`.page-eyebrow`) + titre serif + sous-titre utile + actions à droite — **pas** un grand bandeau décoratif.
2. Toute action métier : confirmation → état de chargement → mutation → historique / notification → toast.
3. Une date **proposée** n’est jamais verte. Seule une validation explicite (référence + attestation) confirme.
4. Un visa interne n’est **pas** une signature électronique.
5. `prefers-reduced-motion` et préférence profil : durées → 1 ms.
6. Menus : clic extérieur + Échap + flèches.

Les tests existants de FrontII **interdisent** les fenêtres `portal-modal` / `ws-modal` comme flux principal. Les confirmations actuelles (`cf-confirm-bar`) restent valides tant qu’une migration vers `GO.modal` n’est pas décidée **composant par composant**.

## 5. Intégration progressive (après cette cartographie)

Ordre recommandé, **sans réécriture globale** :

1. Tokens / fond / en-tête / page-head (coquille commune).
2. Notifications (déjà partiellement alignées) → toolbar, onglets, états lu/non lu du prototype.
3. Liste dossiers (chips, tableau responsive, stepper).
4. Panneau détail dossier (sections, pas un paragraphe unique).
5. Courriers / visionneuse / zone visa.
6. Calendrier + `GOMap` (Leaflet **ou** schéma explicite).
7. Graphiques `GOCharts` sur les pages stats **du Chef / DR**, pas chez l’inspecteur.
8. Assistant multi-étapes (demandeur uniquement).

Permissions : continuer `ipMay` + magasin `cf-store`. Ne pas importer `GO.roles.can` comme contrôle d’accès.

Détail fichier par fichier : `COMPONENT_MAPPING.md`.
