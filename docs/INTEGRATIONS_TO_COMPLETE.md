# Intégrations à brancher (non simulées comme réelles)

Ce frontend n’est **pas** un système d’information ministériel. Les points suivants restent ouverts. Tant qu’ils ne sont pas branchés, l’interface **documente l’absence** et n’invente pas l’acte.

## Cartographie des cérémonies

- **État** : schéma SVG des villes de référence (`DEMO_PLACES` dans `js/demo-store.js`) + liste cliquable.
- **Manque** : service de géocodage, fond de carte (OSM, IGN, etc.), photos des salles.
- **Règle** : ne pas coller une image statique en la faisant passer pour une carte.

## Visa, signature, cachet

- **État** : zone d’accueil (`cf-visa-slot`), dépôt d’image PNG côté profil, visionneuse.
- **Manque** : modèles officiels, numérotation, scellement opposable, horodatage qualifié.
- **Règle** : un clic « Viser » / « Cacheter » n’est pas un cachet de la République.

## Délégations et diplômes

- **État** : brouillon agent (`delegations-draft`) + génération interne Chef (`gen-del` / `gen-dip`).
- **Manque** : modèle officiel, papier à en-tête, signature du Ministre.
- **Règle** : ne pas figer un canevas comme s’il était réglementaire.

## Paiement

- **État** : ordre de recette interne, quittance téléversée.
- **Manque** : lien Trésor / paiement en ligne.
- **Règle** : l’ordre n’est pas un paiement. Rappel affiché chez le Chef.

## Courrier et GED

- **État** : enregistrement / transmission locaux, visionneuse d’aperçu.
- **Manque** : GED, horodatage, conservation légale, envoi postal réel.

## Authentification

- **État** : comptes de présentation à la connexion, session locale.
- **Manque** : SSO / annuaire, récupération de mot de passe réelle (`DN_AUTH_ENDPOINT` absent).

## Contrôle d’accès

- `ipMay` masque ou refuse dans le navigateur. **Ce n’est pas un contrôle serveur.**
