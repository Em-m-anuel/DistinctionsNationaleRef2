<section class="page-head mp-denied">
    <p class="page-eyebrow">Accès</p>
    <h1 class="page-title">{{ $title }}</h1>
    <p class="page-sub">{{ $lead }}</p>
    <div class="mp-denied-actions">
        <a class="btn btn-primary" href="{{ $home }}">Ouvrir mon espace</a>
        <a class="btn btn-secondary" href="{{ route('home') }}">Accueil public</a>
    </div>
</section>
<section class="card mt">
    <h2 class="card-title">Contrôle d’accès</h2>
    <p class="card-sub">
        Les données affichées restent limitées à votre organisme et à vos droits.
        Modifier l’URL ne donne accès à aucun dossier supplémentaire.
    </p>
</section>
