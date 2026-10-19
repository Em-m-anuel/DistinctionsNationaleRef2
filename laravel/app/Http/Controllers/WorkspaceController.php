<?php

namespace App\Http\Controllers;

use App\Support\Meditra;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Rend les 72 pages métier.
 *
 * Une seule action sert toutes les pages : le couple (famille, page) vient
 * des valeurs par défaut déclarées dans routes/web.php, le rôle vient de la
 * session Laravel. L'URL ne contient jamais le rôle.
 */
class WorkspaceController extends Controller
{
    public function show(Request $request, string $family, string $page): View|RedirectResponse
    {
        $conf = Meditra::family($family);
        $meta = Meditra::page($family, $page);

        if (! $conf || ! $meta) {
            throw new NotFoundHttpException();
        }

        $role = $this->resolveRole($request, $family);

        if ($role === null) {
            // Visiteur non authentifié : retour à la connexion avec la cible.
            return redirect()->guest(route('login', ['next' => $request->getRequestUri()]));
        }

        // Garde serveur : un rôle n'ouvre jamais la page d'une autre famille.
        abort_unless(Meditra::can($role, $family, $page), 403);

        return view("profiles.$family.$page", [
            'family' => $family,
            'page' => $page,
            'role' => $role,
            'familyLabel' => $conf['label'],
            'pageLabel' => $meta['label'],
            'navigation' => $conf['navigation'],
            'scriptSet' => 'workspace',
        ]);
    }

    /**
     * Rôle effectif.
     *
     * 1. compte authentifié (colonne `role` de la table users) ;
     * 2. session de démonstration (POST /demo/profil) ;
     * 3. repli de démonstration sur le rôle représentatif de la famille.
     *
     * Les points 2 et 3 sont désactivés dès que MEDITRA_DEMO=false.
     */
    private function resolveRole(Request $request, string $family): ?string
    {
        $user = $request->user();
        if ($user && ! empty($user->role)) {
            return $user->role;
        }

        if (! config('meditra.demo')) {
            return null;
        }

        $demo = $request->session()->get('meditra.demo_role');
        if ($demo && in_array($demo, Meditra::demoRoles(), true)) {
            return $demo;
        }

        return Meditra::demoRoleFor($family);
    }
}
