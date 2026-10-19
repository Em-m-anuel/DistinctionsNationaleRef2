{{-- Layout d'authentification : connexion et inscription. --}}
@extends('layouts.base')

@section('body-class', 'mp-auth')
@section('site-kind', 'auth')

@section('body')
    @include('components.noscript')
    <div id="app">
        @yield('auth-content')
    </div>
    @include('components.toasts')
    @include('components.overlays')
@endsection
