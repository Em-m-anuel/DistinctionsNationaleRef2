{{--
    Service des Distinctions · Supervision
    URL : /profil/service/supervision   Route : workspace.service.supervision
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Supervision — Service des Distinctions | MEDITRA')
@section('description', 'Supervision des dossiers et de la charge de travail.')
@section('page-attrs', 'data-site-family="service" data-site-page="supervision"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Supervision',
        'subtitle' => 'Supervision des dossiers et de la charge de travail.',
    ])

    @include('components.workspace-loading')
@endsection
