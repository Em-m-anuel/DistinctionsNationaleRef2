{{--
    Menu de compte. Le nom, le rôle et les initiales sont renseignés par
    js/site/chrome.js à partir du compte authentifié (window.MEDITRA.user).
    La déconnexion utilise le formulaire POST protégé par CSRF.
--}}
<div class="dd">
    <button class="account-btn" type="button" data-cf-action="account" aria-expanded="false">
        <span class="avatar" data-site-initials>—</span>
        <span class="account-meta">
            <strong data-site-name>Chargement…</strong>
            <span data-site-role>—</span>
        </span>
        @include('components.icon', ['name' => 'chevron-down'])
    </button>
    <div data-site-slot="account"></div>
</div>

<form id="meditra-logout-form" method="POST" action="{{ route('logout') }}" hidden>
    @csrf
</form>
