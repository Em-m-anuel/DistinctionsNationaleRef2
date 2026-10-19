<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Accueil public.
     *
     * La mise en page complète (illustrations, animations, sections) est
     * rendue par public/js/views/home.js ; le layout fournit aussi un
     * contenu de secours rendu par Blade (components/home-fallback).
     */
    public function index(Request $request): View|RedirectResponse
    {
        return view('pages.home', ['scriptSet' => 'public']);
    }
}
