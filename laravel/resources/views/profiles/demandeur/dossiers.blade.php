{{--
    Espace demandeur · Dossiers
    URL : /profil/demandeur/dossiers   Route : workspace.demandeur.dossiers
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Dossiers — Espace demandeur | MEDITRA')
@section('description', 'Suivi des dossiers de distinction, du dépôt à la clôture.')
@section('page-attrs', 'data-site-family="demandeur" data-site-page="dossiers"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Espace demandeur',
        'title' => 'Dossiers',
        'subtitle' => 'Suivi des dossiers de distinction, du dépôt à la clôture.',
    ])

    @include('components.workspace-loading')
@endsection
