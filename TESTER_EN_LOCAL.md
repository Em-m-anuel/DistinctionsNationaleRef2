# Tester le site sur votre PC

> Résumé : **décompressez l'archive, ouvrez un terminal dans le dossier qui
> contient `index.html`, lancez un petit serveur local, puis ouvrez
> `http://localhost:8000`.** Aucune installation de dépendance n'est
> nécessaire (pas de `npm install`, pas de compilation).

---

## 1. Ce qu'il faut

| Élément | Obligatoire ? | Remarque |
| --- | --- | --- |
| L'archive décompressée | oui | gardez la structure des dossiers (`css/`, `js/`, `profil/`…) |
| Un navigateur récent | oui | Chrome, Edge, Firefox ou Safari |
| **Node.js** (≥ 18) | recommandé | permet `node tools/serve.mjs` |
| ou **Python 3** | alternative | `python -m http.server` |
| Connexion Internet | facultatif | seulement pour les polices Google et la carte |

`npm install` **n'est pas nécessaire** : le site est du HTML/CSS/JS déjà prêt.
(`npm install` ne sert qu'à recompiler `css/app.css`.)

---

## 2. Deux règles à respecter absolument

1. **Ne double-cliquez pas sur `index.html`.**
   Ouvert en `file://`, le navigateur cherche `/css/app.css` à la racine du
   disque : la page s'affiche **sans style**, voire blanche. Il faut un
   serveur HTTP, même local.

2. **Servez le dossier qui contient `index.html`, pas son dossier parent.**
   Les liens du site sont absolus (`/css/…`, `/profil/…`). Si vous servez le
   dossier parent et ouvrez `http://localhost:8000/mon-dossier/`, tout le CSS
   et le JS renvoient une erreur 404 : page blanche. L'adresse correcte est
   `http://localhost:8000/`.

---

## 3. Lancer le serveur

### Windows (PowerShell ou cmd)

```powershell
cd C:\Users\vous\Downloads\le-dossier-decompresse
node tools\serve.mjs
```

Puis ouvrez **http://localhost:8000**

### macOS / Linux

```bash
cd ~/Downloads/le-dossier-decompresse
node tools/serve.mjs
```

Puis ouvrez **http://localhost:8000**

Le terminal affiche :

```text
MEDITRA — site multipage servi sur http://0.0.0.0:8000
Racine : /chemin/vers/le/dossier
```

Laissez la fenêtre ouverte pendant le test. `Ctrl+C` arrête le serveur.

### Si vous avez npm

```bash
npm run serve
```

### Sans Node.js, avec Python 3

```bash
python -m http.server 8000
# Windows, si « python » n'existe pas :
py -3 -m http.server 8000
```

Puis **http://localhost:8000** (tapez bien l'adresse avec la barre finale
`http://localhost:8000/`).

### Avec Visual Studio Code

Installez l'extension **Live Server**, clic droit sur `index.html` →
« Open with Live Server ». Vérifiez que l'adresse ouverte est bien la racine
du projet (`http://127.0.0.1:5500/`), pas un sous-dossier.

---

## 4. Se connecter (mode démonstration)

1. Ouvrez **http://localhost:8000/connexion/**
2. Cliquez sur **« Explorer la démonstration »**
3. Choisissez l'un des **14 profils fictifs** (entreprise, ministère,
   récipiendaire, secrétariats, ministre, DGT, DR, service, régie, admin).

Le mode démonstration ne s'active **que** sur `localhost`, `127.0.0.1`, un
aperçu Arena, ou une adresse de réseau privé (`192.168.x.x`, `10.x.x.x`,
`172.16–31.x.x`). Sur un nom de domaine quelconque, aucune connexion n'est
possible : le site attend un vrai service d'authentification
(`window.DN_AUTH_ENDPOINT`), absent de ce dépôt.

Mot de passe partagé de la démonstration : **`Demo123!`** (il n'est jamais
vérifié par un serveur, il n'a aucune valeur).

---

## 5. Tester sur un téléphone (même Wi-Fi)

Le serveur écoute déjà sur `0.0.0.0`. Depuis le téléphone, ouvrez :

```text
http://ADRESSE-IP-DU-PC:8000/
```

Pour trouver l'adresse du PC :

- Windows : `ipconfig` → « Adresse IPv4 » (ex. `192.168.1.20`)
- macOS : `ipconfig getifaddr en0`
- Linux : `hostname -I`

Si la page ne s'ouvre pas, le pare-feu du PC bloque le port 8000 : autorisez
Node.js (Windows demande généralement « Autoriser l'accès ») ou ouvrez
temporairement le port.

---

## 6. Ce qu'il faut vérifier

- [ ] La page d'accueil s'affiche **avec ses couleurs** (fond blanc, vert /
      jaune / bleu du drapeau) et ses illustrations.
- [ ] `/connexion/` → « Explorer la démonstration » → un profil s'ouvre.
- [ ] Chaque entrée du menu change d'URL (ex. `/profil/demandeur/dossiers/`)
      **sans passer par un `#`**.
- [ ] **F5** sur une page interne recharge la même page (pas de retour à
      l'accueil).
- [ ] Copier une URL interne dans un nouvel onglet : la page s'ouvre.
- [ ] Un dossier s'ouvre sur `?ref=…` : `/profil/direction/dossiers/?ref=DNG-2026-016`.
- [ ] Taper `/profil/demandeure/` (faute de frappe) → page 404 stylée.

---

## 7. Dépannage

| Symptôme | Cause probable | Solution |
| --- | --- | --- |
| Page blanche, texte sans style | `index.html` ouvert en `file://` | passer par `http://localhost:8000` |
| Page sans CSS mais avec du texte | dossier parent servi, ou sous-dossier dans l'URL | servir le dossier de `index.html`, ouvrir `/` |
| « Le site n'a pas pu charger ses fichiers » | scripts bloqués / mauvaise racine | vérifier l'URL et la console (F12) |
| `EADDRINUSE` / port occupé | un autre serveur tourne déjà | `node tools/serve.mjs --port 8080` puis `http://localhost:8080` |
| `node` non reconnu | Node.js absent | installer Node.js, ou utiliser Python |
| `python` non reconnu (Windows) | Python absent / aliasm | `py -3 -m http.server 8000` |
| Pas de bouton « Explorer la démonstration » | adresse non locale | utiliser `localhost` / `127.0.0.1` |
| Polices différentes, carte absente | pas d'Internet | normal : les polices de secours prennent le relais |
| Les actions ne sont pas enregistrées après F5 | pas de backend | attendu : la démonstration est en mémoire |

Pour voir les erreurs : **F12** → onglet « Console ».
Les erreurs `fonts.googleapis.com` ou `leaflet` hors ligne sont sans gravité.

---

## 8. Ce qui ne peut pas fonctionner sans backend

Ce dépôt est **uniquement le frontend**. Sont donc simulés ou indisponibles :

- la connexion réelle (aucun service d'authentification) ;
- l'inscription et l'OTP réels ;
- l'enregistrement durable des dossiers (tout est en mémoire / `localStorage`) ;
- les contrôles d'autorisation **côté serveur** : les pages vérifient les
  droits dans le navigateur, ce qui ne protège pas des données en production.

Ces points sont détaillés dans `MIGRATION_PLAN.md`.
