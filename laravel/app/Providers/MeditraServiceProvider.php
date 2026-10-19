<?php

namespace App\Providers;

use App\Support\Meditra;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

/**
 * Fournit à toutes les vues la configuration navigateur (window.MEDITRA)
 * et le rôle de démonstration éventuel.
 *
 * À enregistrer dans bootstrap/providers.php :
 *     App\Providers\MeditraServiceProvider::class,
 */
class MeditraServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        View::composer('*', function ($view) {
            $user = auth()->user();
            $demoRole = null;

            if (! $user && config('meditra.demo')) {
                $demoRole = session('meditra.demo_role');
            }

            $view->with('meditraConfig', Meditra::clientConfig($user, $demoRole));
        });
    }
}
