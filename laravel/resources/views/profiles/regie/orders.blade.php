{{--
    Régie des Médailles · Ordres de recette
    URL : /profil/regie/orders   Route : workspace.regie.orders
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Ordres de recette — Régie des Médailles | MEDITRA')
@section('description', 'Ordres de recette émis, encaissements et rapprochements.')
@section('page-attrs', 'data-site-family="regie" data-site-page="orders"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Régie des Médailles',
        'title' => 'Ordres de recette',
        'subtitle' => 'Ordres de recette émis, encaissements et rapprochements.',
    ])

    @include('components.workspace-loading')
@endsection
