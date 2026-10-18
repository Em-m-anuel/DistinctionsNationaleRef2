# Système visuel — espaces connectés

Référence : page d’accueil publique et authentification (`css/theme.css`).
Les espaces internes **réutilisent** cette identité. Ils n’introduisent pas une palette beige ni un fond gris uniforme.

## Principes

- Fond général **clair** : `#fcfcfa` + grain papier (`assets/paper-grain.svg`).
- Surfaces principales **blanches** (`#fff`) ; secondaires `#f9f8f4` / `#f4f7fa`.
- Titres bleu nuit `#142d52` ; accents drapeau `#009b62` / `#d6a72c` / `#315c91`.
- Liseré tricolore **déjà prévu** : `.auth-topline` (haut de page) et `.auth-triple` (eyebrow).
- Hero interne : `linear-gradient(116deg,#fff,#f9f8f4)` comme `.portal-hero`. Compact hors accueil.
- Animations d’entrée (`gab-rise`, `ws-appear`, hover) **utiles**.
- `prefers-reduced-motion: reduce` : pas d’animation.

## Coquille

| Élément | Classes / comportement |
| --- | --- |
| Page | `portal-page cf-page ws-page` + `data-ws-content` |
| Header | `portal-top ws-header sticky top-0 z-50` — blanc 97 % |
| Navigation | `portal-tabs ws-tabs` — menus `portal-nav-drop` |
| Hero | `class="ws-hero ws-appear"` — compact hors `overview` |
| Contenu | `portal-main` / `ip-content` |
| Retour haut | `home-back-top` |
| Confirmation | `cf-confirm-bar` (Annuler / Confirmer) |
| Feedback | `cf-toast` |

## Composants métier

- **Notifications** : `cf-notices` / `cf-notice-item` (non lu / lu, icône, titre, message, référence, date, lien dossier).
- **Circuit** : `cf-circuit`.
- **Bureau** : liste / lecture / actes (`cf-bureau`).
- **Visa** : `cf-visa-slot` — emplacement, pas un cachet réel.
- **Calendrier** : `ws-calendar` / `ws-calendar-grid` ; `is-today` ; statuts proposées / confirmées / tenues.

## Interdit

- Aplat beige ou crème sur toute la page
- Sidebar `wsSidebar` / `portalSidebar`
- Mentions Démo / fictif **dans** les profils
- Image statique présentée comme une carte
- Compétences inventées pour remplir un écran
