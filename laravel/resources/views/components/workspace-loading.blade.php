{{--
    Repère de chargement rendu par Blade : il reste visible si JavaScript
    est indisponible et il est remplacé par le contenu métier hydraté
    (js/site/workspace-page.js) dès que les scripts sont actifs.
--}}
<div class="mp-loading" role="status">Chargement de la page…</div>

<noscript>
    <section class="card mt">
        <h2 class="card-title">Contenu métier simulé</h2>
        <p class="card-sub">
            Les dossiers, courriers et décisions affichés sur cette page proviennent du jeu de
            démonstration et sont chargés par JavaScript. Aucun contrôleur ne fournit encore de
            données : voir <code>INTEGRATION_BACKEND.md</code>.
        </p>
    </section>
</noscript>
