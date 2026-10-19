{{--
    Espace récipiendaire · Distinctions
    URL : /profil/recipiendaire/distinctions   Route : workspace.recipient.distinctions
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Distinctions — Espace récipiendaire | MEDITRA')
@section('description', 'Distinctions obtenues et parcours du récipiendaire.')
@section('page-attrs', 'data-site-family="recipient" data-site-page="distinctions"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Espace récipiendaire',
        'title' => 'Distinctions',
        'subtitle' => 'Distinctions obtenues et parcours du récipiendaire.',
    ])

    @include('components.workspace-loading')
@endsection
