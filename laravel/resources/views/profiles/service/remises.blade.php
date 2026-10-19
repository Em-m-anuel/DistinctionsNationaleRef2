{{--
    Service des Distinctions · Remises des médailles
    URL : /profil/service/remises   Route : workspace.service.remises
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Remises des médailles — Service des Distinctions | MEDITRA')
@section('description', 'Remises des médailles et suivi des mouvements de stock.')
@section('page-attrs', 'data-site-family="service" data-site-page="remises"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Remises des médailles',
        'subtitle' => 'Remises des médailles et suivi des mouvements de stock.',
    ])

    @include('components.workspace-loading')
@endsection
