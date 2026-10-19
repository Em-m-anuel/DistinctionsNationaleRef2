@extends('layouts.auth')

@section('title', 'Inscription — MEDITRA')
@section('description', 'Inscription au portail MEDITRA des Médailles et Distinctions du Travail.')

@section('body-class', 'mp-auth')

@section('auth-content')
    @include('components.auth-fallback', [
        'mode' => 'register',
        'title' => 'Créer un compte',
        'subtitle' => 'Un espace à votre mesure.',
        'action' => route('register.store'),
        'submit' => 'Créer mon compte',
    ])
@endsection
