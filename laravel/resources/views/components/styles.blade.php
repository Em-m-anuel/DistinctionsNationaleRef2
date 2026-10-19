{{-- Feuilles de style, dans l'ordre historique du site multipage. --}}
@foreach (config('meditra.styles', []) as $href)
    <link rel="stylesheet" href="{{ asset($href) }}">
@endforeach
