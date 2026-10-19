{{--
    Service des Distinctions · Recours
    URL : /profil/service/recours   Route : workspace.service.recours
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Recours — Service des Distinctions | MEDITRA')
@section('description', 'Recours et contestations, avec leur instruction et leurs suites.')
@section('page-attrs', 'data-site-family="service" data-site-page="recours"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Recours',
        'subtitle' => 'Recours et contestations, avec leur instruction et leurs suites.',
    ])

    @include('components.workspace-loading')
@endsection
