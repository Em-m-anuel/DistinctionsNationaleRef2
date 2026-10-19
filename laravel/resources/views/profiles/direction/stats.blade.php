{{--
    Direction · Statistiques
    URL : /profil/direction/stats   Route : workspace.direction.stats
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Statistiques — Direction | MEDITRA')
@section('description', 'Statistiques et indicateurs d’activité du dispositif.')
@section('page-attrs', 'data-site-family="direction" data-site-page="stats"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Direction',
        'title' => 'Statistiques',
        'subtitle' => 'Statistiques et indicateurs d’activité du dispositif.',
    ])

    @include('components.workspace-loading')
@endsection
