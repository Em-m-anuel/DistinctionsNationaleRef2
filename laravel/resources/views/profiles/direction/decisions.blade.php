{{--
    Direction · Décisions initiales
    URL : /profil/direction/decisions   Route : workspace.direction.decisions
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Décisions initiales — Direction | MEDITRA')
@section('description', 'Décisions initiales, signatures et suites à donner.')
@section('page-attrs', 'data-site-family="direction" data-site-page="decisions"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Direction',
        'title' => 'Décisions initiales',
        'subtitle' => 'Décisions initiales, signatures et suites à donner.',
    ])

    @include('components.workspace-loading')
@endsection
