{{--
    Espace demandeur · Recours
    URL : /profil/demandeur/recours   Route : workspace.demandeur.recours
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Recours — Espace demandeur | MEDITRA')
@section('description', 'Recours et contestations, avec leur instruction et leurs suites.')
@section('page-attrs', 'data-site-family="demandeur" data-site-page="recours"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Espace demandeur',
        'title' => 'Recours',
        'subtitle' => 'Recours et contestations, avec leur instruction et leurs suites.',
    ])

    @include('components.workspace-loading')
@endsection
