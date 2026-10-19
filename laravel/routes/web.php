<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\DemoProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LegacyRedirectController;
use App\Http\Controllers\WorkspaceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes web — MEDITRA
|--------------------------------------------------------------------------
|
| GÉNÉRÉ par tools/build-laravel.mjs. Les 7 familles et les
| 72 pages métier reprennent exactement les URL du site multipage, sans
| barre finale (Laravel ignore la barre finale en correspondance).
|
| Correspondance complète : CORRESPONDANCE_URLS.md
|
*/

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/connexion', [LoginController::class, 'create'])->name('login');
Route::post('/connexion', [LoginController::class, 'store'])->name('login.store');
Route::post('/deconnexion', [LoginController::class, 'destroy'])->name('logout');

Route::get('/inscription', [RegisterController::class, 'create'])->name('register');
Route::post('/inscription', [RegisterController::class, 'store'])->name('register.store');

// Sélection d'un profil du jeu de démonstration (MEDITRA_DEMO=true uniquement).
Route::post('/demo/profil', DemoProfileController::class)->name('demo.profile');

// Anciennes URL de la SPA (#/app/<rôle>/<page>) et URL /app/... -> redirection.
Route::get('/app/{role}/{page?}', LegacyRedirectController::class)->name('legacy');

// Espace demandeur (demandeur)
Route::get('/profil/demandeur', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'overview')
    ->name('workspace.demandeur.overview');
Route::get('/profil/demandeur/dossiers', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'dossiers')
    ->name('workspace.demandeur.dossiers');
Route::get('/profil/demandeur/new-dossier', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'new-dossier')
    ->name('workspace.demandeur.new-dossier');
Route::get('/profil/demandeur/recipients', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'recipients')
    ->name('workspace.demandeur.recipients');
Route::get('/profil/demandeur/complements', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'complements')
    ->name('workspace.demandeur.complements');
Route::get('/profil/demandeur/recours', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'recours')
    ->name('workspace.demandeur.recours');
Route::get('/profil/demandeur/documents', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'documents')
    ->name('workspace.demandeur.documents');
Route::get('/profil/demandeur/ceremonies', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'ceremonies')
    ->name('workspace.demandeur.ceremonies');
Route::get('/profil/demandeur/payments', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'payments')
    ->name('workspace.demandeur.payments');
Route::get('/profil/demandeur/pieces', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'pieces')
    ->name('workspace.demandeur.pieces');
Route::get('/profil/demandeur/journal', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'journal')
    ->name('workspace.demandeur.journal');
Route::get('/profil/demandeur/notifications', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'notifications')
    ->name('workspace.demandeur.notifications');
Route::get('/profil/demandeur/profile', [WorkspaceController::class, 'show'])
    ->defaults('family', 'demandeur')
    ->defaults('page', 'profile')
    ->name('workspace.demandeur.profile');

// Espace récipiendaire (recipient)
Route::get('/profil/recipiendaire', [WorkspaceController::class, 'show'])
    ->defaults('family', 'recipient')
    ->defaults('page', 'overview')
    ->name('workspace.recipient.overview');
Route::get('/profil/recipiendaire/dossiers', [WorkspaceController::class, 'show'])
    ->defaults('family', 'recipient')
    ->defaults('page', 'dossiers')
    ->name('workspace.recipient.dossiers');
Route::get('/profil/recipiendaire/documents', [WorkspaceController::class, 'show'])
    ->defaults('family', 'recipient')
    ->defaults('page', 'documents')
    ->name('workspace.recipient.documents');
Route::get('/profil/recipiendaire/ceremonies', [WorkspaceController::class, 'show'])
    ->defaults('family', 'recipient')
    ->defaults('page', 'ceremonies')
    ->name('workspace.recipient.ceremonies');
Route::get('/profil/recipiendaire/distinctions', [WorkspaceController::class, 'show'])
    ->defaults('family', 'recipient')
    ->defaults('page', 'distinctions')
    ->name('workspace.recipient.distinctions');
Route::get('/profil/recipiendaire/retraits', [WorkspaceController::class, 'show'])
    ->defaults('family', 'recipient')
    ->defaults('page', 'retraits')
    ->name('workspace.recipient.retraits');
Route::get('/profil/recipiendaire/notifications', [WorkspaceController::class, 'show'])
    ->defaults('family', 'recipient')
    ->defaults('page', 'notifications')
    ->name('workspace.recipient.notifications');
Route::get('/profil/recipiendaire/profile', [WorkspaceController::class, 'show'])
    ->defaults('family', 'recipient')
    ->defaults('page', 'profile')
    ->name('workspace.recipient.profile');

// Secrétariat (secretariat_ministre, secretariat_dgt, secretariat_dr)
Route::get('/profil/secretariat', [WorkspaceController::class, 'show'])
    ->defaults('family', 'secretariat')
    ->defaults('page', 'overview')
    ->name('workspace.secretariat.overview');
Route::get('/profil/secretariat/dossiers', [WorkspaceController::class, 'show'])
    ->defaults('family', 'secretariat')
    ->defaults('page', 'dossiers')
    ->name('workspace.secretariat.dossiers');
Route::get('/profil/secretariat/new-dossier', [WorkspaceController::class, 'show'])
    ->defaults('family', 'secretariat')
    ->defaults('page', 'new-dossier')
    ->name('workspace.secretariat.new-dossier');
Route::get('/profil/secretariat/documents', [WorkspaceController::class, 'show'])
    ->defaults('family', 'secretariat')
    ->defaults('page', 'documents')
    ->name('workspace.secretariat.documents');
Route::get('/profil/secretariat/inbox', [WorkspaceController::class, 'show'])
    ->defaults('family', 'secretariat')
    ->defaults('page', 'inbox')
    ->name('workspace.secretariat.inbox');
Route::get('/profil/secretariat/ceremonies', [WorkspaceController::class, 'show'])
    ->defaults('family', 'secretariat')
    ->defaults('page', 'ceremonies')
    ->name('workspace.secretariat.ceremonies');
Route::get('/profil/secretariat/journal', [WorkspaceController::class, 'show'])
    ->defaults('family', 'secretariat')
    ->defaults('page', 'journal')
    ->name('workspace.secretariat.journal');
Route::get('/profil/secretariat/notifications', [WorkspaceController::class, 'show'])
    ->defaults('family', 'secretariat')
    ->defaults('page', 'notifications')
    ->name('workspace.secretariat.notifications');
Route::get('/profil/secretariat/profile', [WorkspaceController::class, 'show'])
    ->defaults('family', 'secretariat')
    ->defaults('page', 'profile')
    ->name('workspace.secretariat.profile');

// Direction (ministre, dgt, dr)
Route::get('/profil/direction', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')
    ->defaults('page', 'overview')
    ->name('workspace.direction.overview');
Route::get('/profil/direction/dossiers', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')
    ->defaults('page', 'dossiers')
    ->name('workspace.direction.dossiers');
Route::get('/profil/direction/decisions', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')
    ->defaults('page', 'decisions')
    ->name('workspace.direction.decisions');
Route::get('/profil/direction/recours', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')
    ->defaults('page', 'recours')
    ->name('workspace.direction.recours');
Route::get('/profil/direction/documents', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')
    ->defaults('page', 'documents')
    ->name('workspace.direction.documents');
Route::get('/profil/direction/ceremonies', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')
    ->defaults('page', 'ceremonies')
    ->name('workspace.direction.ceremonies');
Route::get('/profil/direction/stats', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')
    ->defaults('page', 'stats')
    ->name('workspace.direction.stats');
Route::get('/profil/direction/journal', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')
    ->defaults('page', 'journal')
    ->name('workspace.direction.journal');
Route::get('/profil/direction/notifications', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')
    ->defaults('page', 'notifications')
    ->name('workspace.direction.notifications');
Route::get('/profil/direction/profile', [WorkspaceController::class, 'show'])
    ->defaults('family', 'direction')
    ->defaults('page', 'profile')
    ->name('workspace.direction.profile');

// Service des Distinctions (service_agent, service_inspecteur, service_chef)
Route::get('/profil/service', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'overview')
    ->name('workspace.service.overview');
Route::get('/profil/service/dossiers', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'dossiers')
    ->name('workspace.service.dossiers');
Route::get('/profil/service/instruction', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'instruction')
    ->name('workspace.service.instruction');
Route::get('/profil/service/supervision', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'supervision')
    ->name('workspace.service.supervision');
Route::get('/profil/service/recipients', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'recipients')
    ->name('workspace.service.recipients');
Route::get('/profil/service/complements', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'complements')
    ->name('workspace.service.complements');
Route::get('/profil/service/recours', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'recours')
    ->name('workspace.service.recours');
Route::get('/profil/service/documents', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'documents')
    ->name('workspace.service.documents');
Route::get('/profil/service/ceremonies', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'ceremonies')
    ->name('workspace.service.ceremonies');
Route::get('/profil/service/remises', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'remises')
    ->name('workspace.service.remises');
Route::get('/profil/service/orders', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'orders')
    ->name('workspace.service.orders');
Route::get('/profil/service/stats', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'stats')
    ->name('workspace.service.stats');
Route::get('/profil/service/journal', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'journal')
    ->name('workspace.service.journal');
Route::get('/profil/service/controle', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'controle')
    ->name('workspace.service.controle');
Route::get('/profil/service/notifications', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'notifications')
    ->name('workspace.service.notifications');
Route::get('/profil/service/profile', [WorkspaceController::class, 'show'])
    ->defaults('family', 'service')
    ->defaults('page', 'profile')
    ->name('workspace.service.profile');

// Régie des Médailles (regisseur)
Route::get('/profil/regie', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'overview')
    ->name('workspace.regie.overview');
Route::get('/profil/regie/dossiers', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'dossiers')
    ->name('workspace.regie.dossiers');
Route::get('/profil/regie/documents', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'documents')
    ->name('workspace.regie.documents');
Route::get('/profil/regie/ceremonies', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'ceremonies')
    ->name('workspace.regie.ceremonies');
Route::get('/profil/regie/remises', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'remises')
    ->name('workspace.regie.remises');
Route::get('/profil/regie/orders', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'orders')
    ->name('workspace.regie.orders');
Route::get('/profil/regie/stock', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'stock')
    ->name('workspace.regie.stock');
Route::get('/profil/regie/retraits', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'retraits')
    ->name('workspace.regie.retraits');
Route::get('/profil/regie/journal', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'journal')
    ->name('workspace.regie.journal');
Route::get('/profil/regie/notifications', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'notifications')
    ->name('workspace.regie.notifications');
Route::get('/profil/regie/profile', [WorkspaceController::class, 'show'])
    ->defaults('family', 'regie')
    ->defaults('page', 'profile')
    ->name('workspace.regie.profile');

// Administration (admin)
Route::get('/administration', [WorkspaceController::class, 'show'])
    ->defaults('family', 'admin')
    ->defaults('page', 'overview')
    ->name('workspace.admin.overview');
Route::get('/administration/journal', [WorkspaceController::class, 'show'])
    ->defaults('family', 'admin')
    ->defaults('page', 'journal')
    ->name('workspace.admin.journal');
Route::get('/administration/users', [WorkspaceController::class, 'show'])
    ->defaults('family', 'admin')
    ->defaults('page', 'users')
    ->name('workspace.admin.users');
Route::get('/administration/notifications', [WorkspaceController::class, 'show'])
    ->defaults('family', 'admin')
    ->defaults('page', 'notifications')
    ->name('workspace.admin.notifications');
Route::get('/administration/profile', [WorkspaceController::class, 'show'])
    ->defaults('family', 'admin')
    ->defaults('page', 'profile')
    ->name('workspace.admin.profile');

/*
| Pages d'erreur : resources/views/errors/403.blade.php et 404.blade.php
| reprennent pages/errors/*.blade.php (Laravel les résout automatiquement).
*/
