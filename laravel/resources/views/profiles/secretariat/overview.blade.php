{{--
    Secrétariat · Vue d'ensemble
    URL : /profil/secretariat   Route : workspace.secretariat.overview
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Secrétariat — MEDITRA')
@section('description', 'Synthèse de votre activité, des échéances et des actions attendues.')
@section('page-attrs', 'data-site-family="secretariat" data-site-page="overview"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Secrétariat',
        'title' => 'Vue d\'ensemble',
        'subtitle' => 'Synthèse de votre activité, des échéances et des actions attendues.',
    ])

    @include('components.workspace-loading')
@endsection
