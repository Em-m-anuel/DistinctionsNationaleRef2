{{--
    Régie des Médailles · Profil et paramètres
    URL : /profil/regie/profile   Route : workspace.regie.profile
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Profil et paramètres — Régie des Médailles | MEDITRA')
@section('description', 'Profil, coordonnées, signature et paramètres du compte.')
@section('page-attrs', 'data-site-family="regie" data-site-page="profile"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Régie des Médailles',
        'title' => 'Profil et paramètres',
        'subtitle' => 'Profil, coordonnées, signature et paramètres du compte.',
    ])

    @include('components.workspace-loading')
@endsection
