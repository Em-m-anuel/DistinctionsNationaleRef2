{{--
    Régie des Médailles · Retraits sans cérémonie
    URL : /profil/regie/retraits   Route : workspace.regie.retraits
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Retraits sans cérémonie — Régie des Médailles | MEDITRA')
@section('description', 'Retraits sans cérémonie et remises exceptionnelles.')
@section('page-attrs', 'data-site-family="regie" data-site-page="retraits"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Régie des Médailles',
        'title' => 'Retraits sans cérémonie',
        'subtitle' => 'Retraits sans cérémonie et remises exceptionnelles.',
    ])

    @include('components.workspace-loading')
@endsection
