{{--
    Service des Distinctions · Contrôles et anomalies
    URL : /profil/service/controle   Route : workspace.service.controle
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Contrôles et anomalies — Service des Distinctions | MEDITRA')
@section('description', 'Contrôles, anomalies et vérifications des récipiendaires.')
@section('page-attrs', 'data-site-family="service" data-site-page="controle"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Contrôles et anomalies',
        'subtitle' => 'Contrôles, anomalies et vérifications des récipiendaires.',
    ])

    @include('components.workspace-loading')
@endsection
