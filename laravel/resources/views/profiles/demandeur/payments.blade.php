{{--
    Espace demandeur · Ordres de recette
    URL : /profil/demandeur/payments   Route : workspace.demandeur.payments
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Ordres de recette — Espace demandeur | MEDITRA')
@section('description', 'Ordres de recette, quittances et suivi des encaissements.')
@section('page-attrs', 'data-site-family="demandeur" data-site-page="payments"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Espace demandeur',
        'title' => 'Ordres de recette',
        'subtitle' => 'Ordres de recette, quittances et suivi des encaissements.',
    ])

    @include('components.workspace-loading')
@endsection
