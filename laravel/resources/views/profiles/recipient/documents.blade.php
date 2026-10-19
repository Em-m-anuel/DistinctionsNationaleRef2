{{--
    Espace récipiendaire · Courriers
    URL : /profil/recipiendaire/documents   Route : workspace.recipient.documents
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Courriers — Espace récipiendaire | MEDITRA')
@section('description', 'Courriers, transmissions et pièces officielles échangées.')
@section('page-attrs', 'data-site-family="recipient" data-site-page="documents"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Espace récipiendaire',
        'title' => 'Courriers',
        'subtitle' => 'Courriers, transmissions et pièces officielles échangées.',
    ])

    @include('components.workspace-loading')
@endsection
