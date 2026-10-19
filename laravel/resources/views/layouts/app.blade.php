{{--
    Layout des pages métier (72 pages).
    En-tête, navigation par famille, fil d'Ariane, zone de contenu montée
    par js/site/workspace-page.js, panneaux et notifications.
--}}
@extends('layouts.base')

@section('body-class', 'mp-workspace')
@section('site-kind', 'workspace')

@section('body')
    <a class="mp-skip" href="#view">Aller au contenu</a>
    @include('components.noscript')
    <div class="go-workspace">
        <div class="progress-rail" aria-hidden="true"><i class="progress-fill"></i></div>

        @include('components.header')
        @include('components.breadcrumb')

        <div id="mp-confirm"></div>

        <main id="view" class="container go-host" tabindex="-1" data-go-view="" data-go-page="{{ $page }}">
            @yield('workspace')
        </main>

        @include('components.footer')
        <div id="mp-panel"></div>
        <div id="mp-viewer"></div>
        <div id="cf-toast"></div>
        @include('components.back-to-top')
    </div>

    @include('components.toasts')
    @include('components.overlays')
@endsection
