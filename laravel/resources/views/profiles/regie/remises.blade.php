{{--
    Régie des Médailles · Remises des médailles
    URL : /profil/regie/remises   Route : workspace.regie.remises
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Remises des médailles — Régie des Médailles | MEDITRA')
@section('description', 'Remises des médailles et suivi des mouvements de stock.')
@section('page-attrs', 'data-site-family="regie" data-site-page="remises"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Régie des Médailles',
        'title' => 'Remises des médailles',
        'subtitle' => 'Remises des médailles et suivi des mouvements de stock.',
    ])

    @include('components.workspace-loading')
@endsection
