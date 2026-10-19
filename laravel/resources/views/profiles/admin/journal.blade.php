{{--
    Administration · Journal d'activité
    URL : /administration/journal   Route : workspace.admin.journal
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Journal d\'activité — Administration | MEDITRA')
@section('description', 'Journal d’activité et historique des actions réalisées.')
@section('page-attrs', 'data-site-family="admin" data-site-page="journal"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Administration',
        'title' => 'Journal d\'activité',
        'subtitle' => 'Journal d’activité et historique des actions réalisées.',
    ])

    @include('components.workspace-loading')
@endsection
