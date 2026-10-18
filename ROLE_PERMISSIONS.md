# Permissions par rôle

Garde `ipMay(rôle, action)` dans `js/views/internal-portal.js`. Une action absente de la table est **autorisée** (navigation, recherche, toasts). Une action présente n’est exécutée que si le rôle figure dans la liste.

Les boutons hors compétence sont masqués. Un appel forcé affiche un toast d’erreur, sans mutation métier.

## Tableau

| Action | Ministre | DGT | DR | Agent | Inspecteur | Chef | Régisseur | Admin | Secrétariat |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `approve` (1re instance) | | | oui | | | | | | |
| `cascade` (orientation) | oui | oui | | | | | | | |
| `reject` | oui | oui | oui | | | | | | |
| `recours-ok` / relance / cérémonie du niveau | oui | oui | oui | | | | | | |
| `transmit` / enregistrement courrier | | | | | | | | | oui |
| `start-study` / `rec-ok` / `rec-no` / `finish-instr` | | | | oui | | oui | | | |
| `flag-anomaly` | | | | oui | oui | | | | |
| `notify-list` | | | | | | oui | | | |
| `issue-order` / `go-order` | | | | | | oui | | | |
| `val-date` / `gen-del` / `gen-dip` / `nego-svc` | | | | | | oui | | | |
| `save-del-draft` | | | | oui | | oui | | | |
| `visa-doc` / `stamp-doc` / `sign-doc` | oui | oui | oui | | | oui | | | |
| `do-remise` / `qui-ok` | | | | | | | oui | | |
| `wd-ok` (retrait sans cérémonie) | | | | | oui | | oui | | |
| `toggle-user` | | | | | | | | oui | |

## Règles non négociables

- **Inspecteur** : contrôle et signalement. Aucune validation de médaille, aucun ordre, aucune notification de liste, aucune organisation de cérémonie.
- **Agent** : instruit le dossier et les récipiendaires, demande des compléments, **suit** relances et recours, prépare un **brouillon** de délégation. N’émet pas l’ordre, ne valide pas une date de cérémonie, ne statue pas, ne reconnaît pas un demandeur. Le dépôt d’un nouveau dossier reste le fait du **demandeur**.
- **Chef** : ordre de recette **distinct** du paiement (Trésor + quittance). Calendrier des cérémonies.
- **Régisseur** : une remise **après** quittance conforme ; pas de double comptage (`cfRemise` refuse une seconde sortie).
- **Admin** : comptes, cachets, journaux. Pas décideur métier.
- **Secrétariat** : enregistre et transmet. Ne statue pas.
- **DR** : seule autorité de première instance sur le dossier.
- **Ministre / DGT** : orientation vers le niveau inférieur, pas d’instruction à la place du Service.

## Règles floues (choix documentés)

1. **Assouplissement (ex. mutilation)** — le seuil d’ancienneté peut être assoupli lors de l’instruction (agent/chef) ou d’un recours d’autorité. L’inspecteur le constate, il ne l’accorde pas.
2. **DTS** — pièce attendue, **non bloquante** au dépôt (cahier déjà en vigueur).
3. **Décès de plus de deux ans** — information affichée, **pas de blocage automatique**.
4. **Localisation physique** — menu et page dédiés aux **secrétariats**. L’instruction du Service affiche l’emplacement comme donnée opérationnelle (déjà testé) ; le demandeur et la personne ne la voient jamais.
5. **Campagnes côté admin** — dates techniques de calendrier, pas une décision d’attribution.
9. **Visa / cachet** — emplacement d’accueil tant que les modèles officiels ne sont pas fournis (`INTEGRATIONS_TO_COMPLETE.md`).
10. **Carte des cérémonies** — schéma des villes connues ; pas d’API de géocodage.
6. **Retrait sans cérémonie** — l’inspecteur vérifie quittance et autorisation ; le régisseur décide la remise au guichet.
7. **Commandes régisseur** — page `orders` = bons d’approvisionnement, jamais les ordres de recette du Chef.
8. **Récipiendaire / FCFA** — l’espace personne n’affiche pas de montants.

Ce qui n’est pas dans ce fichier n’est **pas** une compétence inventée pour remplir un écran : la page est masquée ou refusée.
