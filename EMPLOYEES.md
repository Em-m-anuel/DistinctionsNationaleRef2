# Employés — fonctionnalités implémentées

Espace **Demandeur** (entreprise et ministère). Données : magasin unique `DemoStore` (`js/demo-store.js`).

## Navigation

Le menu **Employés** est un déroulant (même comportement que **Dossiers**) :

1. Liste des employés — `#/app/demandeur/employees`
2. Enregistrer un employé — `#/app/demandeur/employee-new`
3. Statistiques des employés — `#/app/demandeur/employee-stats`

Clavier : Entrée / Espace ouvre le menu, Échap le ferme. Utilisable au clavier et sur mobile.

## Liste

Colonnes : avatar, nom et prénom, sexe, nationalité, poste, date d’embauche, ancienneté calculée (au 14/10/2026), statut d’affiliation, nombre de distinctions (et en cours), dernière activité.

La situation physique n’apparaît dans le tableau que si elle n’est pas « Bien portant ». Aucune pièce médicale n’est listée ici.

Filtres : recherche nom/prénom, affiliation, nationalité, ancienneté. Tri des colonnes. Pagination (6 lignes).

Distinction visuelle : actifs, invitations en attente (fond crème), anciennes affiliations (atténuées).

Fiche individuelle : affiliations, distinctions, pièces médicales **uniquement dans cette fiche**. Modification autorisée sauf historique d’une affiliation terminée (lecture seule, pas de modification rétroactive).

Actions : confirmer une invitation (simulation), clôturer une affiliation active.

## Enregistrement

Formulaire unique `personFormHtml` — **le même** que pour un récipiendaire dans le wizard « Nouveau dossier ».

Champs : nom, prénom, sexe, nationalité, poste, date d’embauche, puis conditionnels (autorisation d’emploi, naturalisation, situation physique, mutilation, décès).

Validation, contrôle des doublons, confirmation avant enregistrement, confirmation d’abandon si le formulaire est modifié.

L’enregistrement **ne crée pas** de demande de distinction. L’affiliation est `EN_ATTENTE` jusqu’à confirmation simulée par l’employé. Notification de démonstration.

## Statistiques

Calculées depuis les fiches de la structure : total, actifs, en attente, anciens, sexe, nationalité, ancienneté, poste, employés distingués, employés dans une demande en cours. Un clic sur un indicateur ouvre la liste filtrée.

## Profil employé (espace Personne)

Le compte `demo.personne@example.test` (Alain Moussavou) dispose d’un **profil employé** :

- **Mon profil** — identité, poste, ancienneté de l’affiliation active, avatar (pas de photo réelle), formulaire unique `personFormHtml`.
- **Mes employeurs** — affiliations actives, invitations en attente (confirmer / décliner), anciennes affiliations en lecture seule.
- **Actions** — les invitations d’affiliation y apparaissent avec les mêmes boutons.

Une affiliation `EN_ATTENTE` n’est **pas** considérée comme confirmée tant que la personne ne l’accepte pas. La confirmation met à jour le magasin partagé (fiche structure + fiche personne).

Invitation de démonstration : Compagnie Minière de Moanda.

## Limites

- Données fictives, persistées localement (`localStorage` clé `dn.demo.store.v4`).
- Aucun envoi d’invitation réelle.
- Les pièces jointes sont simulées (nom de fichier local).
