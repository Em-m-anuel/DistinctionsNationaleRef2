{{--
    Secrétariat · Registre des courriers
    URL : /profil/secretariat/inbox   Route : workspace.secretariat.inbox
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Registre des courriers — Secrétariat | MEDITRA')
@section('description', 'Registre des courriers entrants et sortants du secrétariat.')
@section('page-attrs', 'data-site-family="secretariat" data-site-page="inbox"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Secrétariat',
        'title' => 'Registre des courriers',
        'subtitle' => 'Registre des courriers entrants et sortants du secrétariat.',
    ])

    @include('components.workspace-loading')
@endsection
