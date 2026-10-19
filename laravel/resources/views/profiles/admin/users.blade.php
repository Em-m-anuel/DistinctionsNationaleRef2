{{--
    Administration · Comptes
    URL : /administration/users   Route : workspace.admin.users
    Rôle : fourni par le contrôleur ($role). Aucune donnée métier n'est
    inventée ici : la zone #view est hydratée par js/cf-app.js tant qu'un
    contrôleur ne fournit pas de données (voir INTEGRATION_BACKEND.md).
--}}
@extends('layouts.app')

@section('title', 'Comptes — Administration | MEDITRA')
@section('description', 'Comptes, rôles, campagnes et journaux d’accès.')
@section('page-attrs', 'data-site-family="admin" data-site-page="users"')

@section('workspace')
    @include('components.page-head', [
        'eyebrow' => 'Administration',
        'title' => 'Comptes',
        'subtitle' => 'Comptes, rôles, campagnes et journaux d’accès.',
    ])

    @include('components.workspace-loading')
@endsection
