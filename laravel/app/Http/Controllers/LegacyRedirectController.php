<?php

namespace App\Http\Controllers;

use App\Support\Meditra;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Anciennes URL de la SPA : /app/{role}/{page}.
 *
 * Elles sont traduites vers les URL multipage (301), pour que les favoris
 * enregistrés avant la migration continuent de fonctionner.
 */
class LegacyRedirectController extends Controller
{
    public function __invoke(string $role, ?string $page = null): RedirectResponse
    {
        $target = Meditra::legacyTarget($role, $page);

        if (! $target) {
            throw new NotFoundHttpException();
        }

        return redirect()->route("workspace.{$target['family']}.{$target['page']}", 301);
    }
}
