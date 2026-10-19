@extends('layouts.auth')

@section('title', 'Connexion — MEDITRA')
@section('description', 'Connexion au portail MEDITRA des Médailles et Distinctions du Travail.')

@section('auth-content')
    @include('components.auth-fallback', [
        'mode' => 'login',
        'title' => 'Connexion',
        'subtitle' => 'Accédez à votre espace MEDITRA.',
        'action' => route('login.store'),
        'submit' => 'Se connecter',
    ])
@endsection
