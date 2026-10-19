<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="@yield('description', config('meditra.description'))">
    <meta name="theme-color" content="#102A50">
    <title>@yield('title', config('meditra.title'))</title>
    <link rel="icon" href="{{ asset('assets/brand/meditra-favicon.svg') }}" type="image/svg+xml">
    <link rel="apple-touch-icon" href="{{ asset('assets/brand/meditra-favicon.svg') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,500;0,600;1,500&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet">
    @include('components.styles')
    @stack('head')

    {{-- Configuration lue par js/laravel/meditra-laravel.js --}}
    <script>
        window.MEDITRA = @json($meditraConfig ?? []);
        @if (! config('meditra.demo'))
        window.DN_PRESENTATION_MODE = false;
        @endif
    </script>
</head>
<body class="@yield('body-class')" data-site-kind="@yield('site-kind')" @yield('page-attrs')>
@include('components.sprite')
@yield('body')
@include('components.scripts', ['scriptSet' => $scriptSet ?? 'public'])
@include('components.boot-guard')
@stack('scripts')
</body>
</html>
