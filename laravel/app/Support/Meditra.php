<?php

namespace App\Support;

use Illuminate\Support\Facades\Route;

/**
 * Accès en lecture à la configuration MEDITRA générée.
 *
 * Cette classe ne contient AUCUNE règle métier : elle lit config/meditra.php
 * (lui-même généré depuis js/site-config.js) et fournit les aides dont les
 * vues et les contrôleurs ont besoin.
 */
class Meditra
{
    /** Toutes les familles fonctionnelles. */
    public static function families(): array
    {
        return config('meditra.families', []);
    }

    /** Une famille ou null. */
    public static function family(?string $family): ?array
    {
        return self::families()[$family] ?? null;
    }

    /** Métadonnées d'une page (label, title, description, route, path). */
    public static function page(?string $family, ?string $page): ?array
    {
        return self::family($family)['pages'][$page] ?? null;
    }

    /** Rôle technique → famille fonctionnelle. */
    public static function familyOfRole(?string $role): ?string
    {
        return $role ? config("meditra.roles.$role") : null;
    }

    /** Le rôle peut-il ouvrir cette page de cette famille ? (garde de démonstration) */
    public static function can(?string $role, ?string $family, ?string $page): bool
    {
        if (! $role || ! $family || ! $page) {
            return false;
        }
        if (self::familyOfRole($role) !== $family) {
            return false;
        }

        return isset(self::family($family)['pages'][$page]);
    }

    /** Menu d'une famille, tel que calculé pour le site multipage. */
    public static function navigation(?string $family): array
    {
        return self::family($family)['navigation'] ?? [];
    }

    /** Rôle représentatif d'une famille (mode démonstration uniquement). */
    public static function demoRoleFor(?string $family): ?string
    {
        return self::family($family)['roles'][0] ?? null;
    }

    /** Rôles proposés par le jeu de démonstration. */
    public static function demoRoles(): array
    {
        return config('meditra.demo_roles', []);
    }

    /**
     * URL de toutes les pages, telles que connues de Laravel.
     * Sert à alimenter window.MEDITRA.urls côté navigateur.
     */
    public static function urls(): array
    {
        $urls = [];
        foreach (self::families() as $family => $conf) {
            foreach ($conf['pages'] as $page => $meta) {
                if (Route::has($meta['route'])) {
                    $urls[$family][$page] = route($meta['route']);
                }
            }
        }

        return $urls;
    }

    /**
     * Configuration transmise au navigateur (window.MEDITRA).
     *
     * @param  object|null  $user  compte authentifié (Auth::user())
     */
    public static function clientConfig(?object $user = null, ?string $demoRole = null): array
    {
        return [
            'base' => rtrim(url('/'), '/'),
            'urls' => self::urls(),
            'public' => [
                'home' => route('home'),
                'login' => route('login'),
                'register' => route('register'),
                'logout' => route('logout'),
            ],
            'user' => $user ? [
                'prenom' => $user->prenom ?? '',
                'nom' => $user->nom ?? '',
                'email' => $user->email ?? '',
                'role' => $user->role ?? null,
            ] : null,
            // La démonstration n'est proposée qu'à un visiteur non authentifié.
            'demo' => (bool) config('meditra.demo') && $user === null,
            'demo_role' => $user === null && config('meditra.demo') ? $demoRole : null,
            'demo_profile' => config('meditra.demo') && Route::has('demo.profile')
                ? route('demo.profile')
                : null,
        ];
    }

    /**
     * Cible d'une ancienne URL /app/{role}/{page}.
     * Reprend les règles de js/data.js::parseWorkspacePath().
     */
    public static function legacyTarget(string $role, ?string $page = null): ?array
    {
        $aliases = ['secretariat' => 'secretariat_ministre', 'service' => 'service_chef'];
        $role = $aliases[$role] ?? $role;
        $family = self::familyOfRole($role);
        if (! $family) {
            return null;
        }
        $target = $page && isset(self::family($family)['pages'][$page]) ? $page : 'overview';

        return ['family' => $family, 'page' => $target];
    }
}
