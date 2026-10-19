{{--
    Contenu de secours de l'accueil, rendu par Blade.
    Il est remplacé par js/views/home.js dès l'activation des scripts
    (mise en page complète, illustrations et animations).
--}}
<div class="home-page">
    <main id="contenu">
        <section class="container" style="padding: 64px 0 40px">
            <p class="page-eyebrow">République Gabonaise</p>
            <h1 class="page-title">Médaille et Distinctions du Travail</h1>
            <p class="page-sub">
                Déposez et suivez une demande de distinction, de l’instruction à la cérémonie.
                Le portail réunit les demandeurs, les secrétariats, la Direction Générale du Travail,
                les Directions Régionales, le Service des Distinctions et la Régie des Médailles.
            </p>
            <div class="mp-denied-actions" style="margin-top: 22px">
                <a class="btn btn-primary" href="{{ route('login') }}">Se connecter</a>
                <a class="btn btn-secondary" href="{{ route('register') }}">Créer un compte</a>
            </div>
        </section>
        <section class="container" style="padding-bottom: 56px">
            <h2 class="card-title">Espaces du portail</h2>
            <ul class="mp-nf-list">
                @foreach (config('meditra.families') as $family => $conf)
                    <li><a href="{{ route('workspace.' . $family . '.overview') }}">{{ $conf['label'] }}</a></li>
                @endforeach
            </ul>
        </section>
    </main>
</div>
