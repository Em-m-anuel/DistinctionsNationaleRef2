{{--
    Service des Distinctions · Récipiendaires
    URL : /profil/service/recipients   Route : workspace.service.recipients
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Récipiendaires — Service des Distinctions | MEDITRA')
@section('description', 'Bénéficiaires et récipiendaires rattachés aux dossiers suivis.')
@section('page-attrs', 'data-site-family="service" data-site-page="recipients"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Récipiendaires',
        'subtitle' => 'Bénéficiaires et récipiendaires rattachés aux dossiers suivis.',
    ])

    @include('components.workspace-loading')
@endsection
