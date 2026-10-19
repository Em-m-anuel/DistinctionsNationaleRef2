{{--
    Service des Distinctions · Instruction
    URL : /profil/service/instruction   Route : workspace.service.instruction
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Instruction — Service des Distinctions | MEDITRA')
@section('description', 'File d’instruction et contrôle des pièces déposées.')
@section('page-attrs', 'data-site-family="service" data-site-page="instruction"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Service des Distinctions',
        'title' => 'Instruction',
        'subtitle' => 'File d’instruction et contrôle des pièces déposées.',
    ])

    @include('components.workspace-loading')
@endsection
