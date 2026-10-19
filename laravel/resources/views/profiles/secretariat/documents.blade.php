{{--
    Secrétariat · Courriers
    URL : /profil/secretariat/documents   Route : workspace.secretariat.documents
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Courriers — Secrétariat | MEDITRA')
@section('description', 'Courriers, transmissions et pièces officielles échangées.')
@section('page-attrs', 'data-site-family="secretariat" data-site-page="documents"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Secrétariat',
        'title' => 'Courriers',
        'subtitle' => 'Courriers, transmissions et pièces officielles échangées.',
    ])

    @include('components.workspace-loading')
@endsection
