{{--
    Secrétariat · Profil et paramètres
    URL : /profil/secretariat/profile   Route : workspace.secretariat.profile
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Profil et paramètres — Secrétariat | MEDITRA')
@section('description', 'Profil, coordonnées, signature et paramètres du compte.')
@section('page-attrs', 'data-site-family="secretariat" data-site-page="profile"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Secrétariat',
        'title' => 'Profil et paramètres',
        'subtitle' => 'Profil, coordonnées, signature et paramètres du compte.',
    ])

    @include('components.workspace-loading')
@endsection
