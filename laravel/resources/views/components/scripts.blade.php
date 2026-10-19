{{--
    Scripts, dans l'ordre de chargement d'origine. L'adaptateur
    js/laravel/meditra-laravel.js est inséré juste avant js/app.js :
    l'ordre des modules métier n'est pas modifié.
--}}
@foreach (config('meditra.scripts.' . ($scriptSet ?? 'public'), []) as $src)
    <script src="{{ asset($src) }}"></script>
@endforeach
