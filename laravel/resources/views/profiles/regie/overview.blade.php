{{--
    Régie des Médailles · Vue d'ensemble
    URL : /profil/regie   Route : workspace.regie.overview
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Régie des Médailles — MEDITRA')
@section('description', 'Synthèse de votre activité, des échéances et des actions attendues.')
@section('page-attrs', 'data-site-family="regie" data-site-page="overview"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Régie des Médailles',
        'title' => 'Vue d\'ensemble',
        'subtitle' => 'Synthèse de votre activité, des échéances et des actions attendues.',
    ])

    @include('components.workspace-loading')
@endsection
