{{--
    Service des Distinctions · Courriers
    URL : /profil/service/documents   Route : workspace.service.documents
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Courriers — Service des Distinctions | MEDITRA')
@section('description', 'Courriers, transmissions et pièces officielles échangées.')
@section('page-attrs', 'data-site-family="service" data-site-page="documents"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Courriers',
        'subtitle' => 'Courriers, transmissions et pièces officielles échangées.',
    ])

    @include('components.workspace-loading')
@endsection
