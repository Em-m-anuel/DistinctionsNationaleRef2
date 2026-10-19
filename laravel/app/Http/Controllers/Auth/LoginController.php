<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\Meditra;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Connexion.
 *
 * Le formulaire Blade fonctionne sans JavaScript (POST + CSRF). Quand les
 * scripts sont actifs, js/views/login.js remplace le panneau et propose en
 * plus l'OTP, le mot de passe oublié et la sélection de profil de
 * démonstration ; la soumission réelle reste cette route.
 */
class LoginController extends Controller
{
    public function create(Request $request): View|RedirectResponse
    {
        if ($request->user()) {
            $family = Meditra::familyOfRole($request->user()->role ?? '');

            return $family
                ? redirect()->route("workspace.$family.overview")
                : redirect()->route('home');
        }

        return view('pages.auth.login', ['scriptSet' => 'public']);
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => 'Identifiants incorrects.',
            ]);
        }

        $request->session()->regenerate();

        // Sur le site de démonstration, l'utilisateur peut avoir choisi un
        // profil de présentation : la connexion réelle reprend la main.
        $request->session()->forget('meditra.demo_role');

        return redirect()->intended($this->homeFor($request));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    /** Espace du rôle connecté, ou accueil si le rôle est inconnu. */
    private function homeFor(Request $request): string
    {
        $role = $request->user()->role ?? null;
        $family = Meditra::familyOfRole($role);

        if (! $family) {
            return route('home');
        }

        return route("workspace.$family.overview");
    }
}
