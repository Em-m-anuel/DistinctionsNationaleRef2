{{--
    Direction · Dossiers
    URL : /profil/direction/dossiers   Route : workspace.direction.dossiers
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Dossiers — Direction | MEDITRA')
@section('description', 'Suivi des dossiers de distinction, du dépôt à la clôture.')
@section('page-attrs', 'data-site-family="direction" data-site-page="dossiers"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Direction',
        'title' => 'Dossiers',
        'subtitle' => 'Suivi des dossiers de distinction, du dépôt à la clôture.',
    ])

    @include('components.workspace-loading')
@endsection
