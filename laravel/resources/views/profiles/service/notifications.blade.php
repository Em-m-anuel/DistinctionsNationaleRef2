{{--
    Service des Distinctions · Notifications
    URL : /profil/service/notifications   Route : workspace.service.notifications
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Notifications — Service des Distinctions | MEDITRA')
@section('description', 'Alertes, échéances et messages reçus sur votre espace.')
@section('page-attrs', 'data-site-family="service" data-site-page="notifications"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Notifications',
        'subtitle' => 'Alertes, échéances et messages reçus sur votre espace.',
    ])

    @include('components.workspace-loading')
@endsection
