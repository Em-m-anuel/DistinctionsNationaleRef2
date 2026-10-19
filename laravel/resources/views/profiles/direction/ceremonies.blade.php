{{--
    Direction · Cérémonies
    URL : /profil/direction/ceremonies   Route : workspace.direction.ceremonies
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Cérémonies — Direction | MEDITRA')
@section('description', 'Planification et suivi des cérémonies de remise des médailles.')
@section('page-attrs', 'data-site-family="direction" data-site-page="ceremonies"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Direction',
        'title' => 'Cérémonies',
        'subtitle' => 'Planification et suivi des cérémonies de remise des médailles.',
    ])

    @include('components.workspace-loading')
@endsection
