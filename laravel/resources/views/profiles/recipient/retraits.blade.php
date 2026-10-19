{{--
    Espace récipiendaire · Retraits sans cérémonie
    URL : /profil/recipiendaire/retraits   Route : workspace.recipient.retraits
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Retraits sans cérémonie — Espace récipiendaire | MEDITRA')
@section('description', 'Retraits sans cérémonie et remises exceptionnelles.')
@section('page-attrs', 'data-site-family="recipient" data-site-page="retraits"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Espace récipiendaire',
        'title' => 'Retraits sans cérémonie',
        'subtitle' => 'Retraits sans cérémonie et remises exceptionnelles.',
    ])

    @include('components.workspace-loading')
@endsection
