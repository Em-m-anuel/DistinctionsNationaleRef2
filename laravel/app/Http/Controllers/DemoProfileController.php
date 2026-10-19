<?php

namespace App\Http\Controllers;

use App\Support\Meditra;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Sélection d'un profil du jeu de démonstration (MEDITRA_DEMO=true).
 *
 * Le choix est mémorisé dans la session Laravel pour que le rendu Blade et
 * les contrôleurs connaissent le même rôle que le navigateur. En production
 * (MEDITRA_DEMO=false), la route répond 404.
 */
class DemoProfileController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        abort_unless(config('meditra.demo'), 404);

        $data = $request->validate([
            'role' => ['required', 'string'],
        ]);

        abort_unless(in_array($data['role'], Meditra::demoRoles(), true), 422);

        $request->session()->put('meditra.demo_role', $data['role']);

        return response()->json([
            'ok' => true,
            'role' => $data['role'],
            'family' => Meditra::familyOfRole($data['role']),
        ]);
    }
}
