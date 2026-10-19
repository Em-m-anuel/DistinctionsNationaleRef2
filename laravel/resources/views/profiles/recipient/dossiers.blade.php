{{--
    Espace récipiendaire · Dossiers
    URL : /profil/recipiendaire/dossiers   Route : workspace.recipient.dossiers
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Dossiers — Espace récipiendaire | MEDITRA')
@section('description', 'Suivi des dossiers de distinction, du dépôt à la clôture.')
@section('page-attrs', 'data-site-family="recipient" data-site-page="dossiers"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Espace récipiendaire',
        'title' => 'Dossiers',
        'subtitle' => 'Suivi des dossiers de distinction, du dépôt à la clôture.',
    ])

    @include('components.workspace-loading')
@endsection
