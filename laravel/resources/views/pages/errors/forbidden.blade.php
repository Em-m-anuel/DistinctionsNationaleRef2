{{-- Page 403 : rendue par Laravel (errors/403.blade.php peut aussi être utilisée). --}}
@extends('layouts.base')

@section('body-class', 'mp-home')
@section('site-kind', 'error')

@section('title', 'Accès non autorisé — MEDITRA')

@section('body')
    <main class="container mp-nf">
        <p class="page-eyebrow">Erreur 403</p>
        <h1>Accès non autorisé</h1>
        <p class="page-sub">Votre compte n’a pas accès à cet espace. Les droits sont vérifiés pour chaque page, côté serveur.</p>
        <p>
            <a class="btn btn-primary" href="{{ route('home') }}">Revenir à l’accueil</a>
            <a class="btn btn-secondary" href="{{ route('login') }}">Se connecter</a>
        </p>
        <h2 class="card-title">Espaces du portail</h2>
        <ul class="mp-nf-list">
            @foreach (config('meditra.families') as $family => $conf)
                <li><a href="{{ route('workspace.' . $family . '.overview') }}">{{ $conf['label'] }}</a></li>
            @endforeach
        </ul>
    </main>
@endsection
