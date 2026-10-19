{{--
    Service des Distinctions · Dossiers
    URL : /profil/service/dossiers   Route : workspace.service.dossiers
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Dossiers — Service des Distinctions | MEDITRA')
@section('description', 'Suivi des dossiers de distinction, du dépôt à la clôture.')
@section('page-attrs', 'data-site-family="service" data-site-page="dossiers"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Dossiers',
        'subtitle' => 'Suivi des dossiers de distinction, du dépôt à la clôture.',
    ])

    @include('components.workspace-loading')
@endsection
