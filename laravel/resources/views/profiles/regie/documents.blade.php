{{--
    Régie des Médailles · Courriers
    URL : /profil/regie/documents   Route : workspace.regie.documents
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Courriers — Régie des Médailles | MEDITRA')
@section('description', 'Courriers, transmissions et pièces officielles échangées.')
@section('page-attrs', 'data-site-family="regie" data-site-page="documents"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Régie des Médailles',
        'title' => 'Courriers',
        'subtitle' => 'Courriers, transmissions et pièces officielles échangées.',
    ])

    @include('components.workspace-loading')
@endsection
