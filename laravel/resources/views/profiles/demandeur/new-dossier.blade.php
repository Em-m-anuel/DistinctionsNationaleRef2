{{--
    Espace demandeur · Nouveau dossier
    URL : /profil/demandeur/new-dossier   Route : workspace.demandeur.new-dossier
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Nouveau dossier — Espace demandeur | MEDITRA')
@section('description', 'Dépôt d’une nouvelle demande de distinction et constitution des pièces.')
@section('page-attrs', 'data-site-family="demandeur" data-site-page="new-dossier"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Espace demandeur',
        'title' => 'Nouveau dossier',
        'subtitle' => 'Dépôt d’une nouvelle demande de distinction et constitution des pièces.',
    ])

    @include('components.workspace-loading')
@endsection
