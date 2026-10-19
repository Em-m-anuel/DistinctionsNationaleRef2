{{-- Layout public : accueil. Le contenu est rendu par js/views/home.js. --}}
@extends('layouts.base')

@section('body-class', 'mp-home')
@section('site-kind', 'home')

@section('body')
    @include('components.noscript')
    <div id="app">
        @include('components.home-fallback')
    </div>
    @include('components.toasts')
    @include('components.overlays')
@endsection
