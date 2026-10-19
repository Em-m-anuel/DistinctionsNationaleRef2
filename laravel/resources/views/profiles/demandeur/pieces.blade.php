{{--
    Espace demandeur · DTS et pièces
    URL : /profil/demandeur/pieces   Route : workspace.demandeur.pieces
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'DTS et pièces — Espace demandeur | MEDITRA')
@section('description', 'DTS, diplômes et pièces justificatives des dossiers.')
@section('page-attrs', 'data-site-family="demandeur" data-site-page="pieces"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Espace demandeur',
        'title' => 'DTS et pièces',
        'subtitle' => 'DTS, diplômes et pièces justificatives des dossiers.',
    ])

    @include('components.workspace-loading')
@endsection
