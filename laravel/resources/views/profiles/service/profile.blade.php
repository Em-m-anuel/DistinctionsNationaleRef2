{{--
    Service des Distinctions · Profil et paramètres
    URL : /profil/service/profile   Route : workspace.service.profile
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Profil et paramètres — Service des Distinctions | MEDITRA')
@section('description', 'Profil, coordonnées, signature et paramètres du compte.')
@section('page-attrs', 'data-site-family="service" data-site-page="profile"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Profil et paramètres',
        'subtitle' => 'Profil, coordonnées, signature et paramètres du compte.',
    ])

    @include('components.workspace-loading')
@endsection
