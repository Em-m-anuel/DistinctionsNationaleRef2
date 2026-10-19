<nav class="page-crumbs container" aria-label="Fil d’Ariane">
    <ol>
        <li><a href="{{ route('home') }}">Accueil</a></li>
        <li><a href="{{ route('workspace.' . $family . '.overview') }}">{{ $familyLabel }}</a></li>
        @if ($page !== 'overview')
            <li aria-current="page">{{ $pageLabel }}</li>
        @endif
    </ol>
</nav>
