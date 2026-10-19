{{--
    Service des Distinctions · Compléments et relances
    URL : /profil/service/complements   Route : workspace.service.complements
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Compléments et relances — Service des Distinctions | MEDITRA')
@section('description', 'Pièces complémentaires, relances et réponses attendues.')
@section('page-attrs', 'data-site-family="service" data-site-page="complements"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Compléments et relances',
        'subtitle' => 'Pièces complémentaires, relances et réponses attendues.',
    ])

    @include('components.workspace-loading')
@endsection
