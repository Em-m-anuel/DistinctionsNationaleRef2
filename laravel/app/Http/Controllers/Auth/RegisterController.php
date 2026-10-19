<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Inscription.
 *
 * La vue et la validation existent ; la création du compte dépend du modèle
 * utilisateur et de la règle d'attribution des rôles propres au projet
 * (voir INTEGRATION_BACKEND.md §4). Aucun modèle n'est inventé ici et aucun
 * compte n'est créé silencieusement.
 */
class RegisterController extends Controller
{
    public function create(): View
    {
        return view('pages.auth.register', ['scriptSet' => 'public']);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nom' => ['required', 'string', 'max:120'],
            'prenom' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        return back()
            ->withInput($request->only('nom', 'prenom', 'email'))
            ->withErrors([
                'email' => "L'inscription n'est pas encore raccordée au backend : aucun compte n'a été créé. "
                    .'Voir INTEGRATION_BACKEND.md §4 pour brancher le modèle utilisateur et les rôles.',
            ]);
    }
}
