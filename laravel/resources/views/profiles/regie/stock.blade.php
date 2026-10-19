{{--
    Régie des Médailles · Stock des médailles
    URL : /profil/regie/stock   Route : workspace.regie.stock
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Stock des médailles — Régie des Médailles | MEDITRA')
@section('description', 'Stock des médailles, diplômes et mouvements de la régie.')
@section('page-attrs', 'data-site-family="regie" data-site-page="stock"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Régie des Médailles',
        'title' => 'Stock des médailles',
        'subtitle' => 'Stock des médailles, diplômes et mouvements de la régie.',
    ])

    @include('components.workspace-loading')
@endsection
