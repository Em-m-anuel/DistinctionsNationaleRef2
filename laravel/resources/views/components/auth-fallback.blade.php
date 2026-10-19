{{--
    Formulaire de connexion standard (sans JavaScript), rendu par Blade.
    Avec JavaScript, js/views/login.js remplace ce panneau par l'interface
    complète (mot de passe, OTP, mot de passe oublié, sélection de profil
    de démonstration) et utilise les routes Laravel pour la soumission.
--}}
<div class="auth-page">
    <div class="auth-topline" aria-hidden="true"></div>
    <main id="contenu" class="auth-main">
        <div class="auth-main-content">
            <div class="auth-card" id="login-panel">
                <h1 class="auth-title">{{ $title }}</h1>
                <p class="auth-sub">{{ $subtitle }}</p>

                @if ($errors->any())
                    <div class="cf-flash cf-flash-error" role="alert">
                        {{ $errors->first() }}
                    </div>
                @endif

                <form method="POST" action="{{ $action }}">
                    @csrf
                    @if ($mode === 'login')
                        <label class="auth-field">
                            <span>Adresse e-mail</span>
                            <input type="email" name="email" value="{{ old('email') }}" required autocomplete="email">
                        </label>
                        <label class="auth-field">
                            <span>Mot de passe</span>
                            <input type="password" name="password" required autocomplete="current-password">
                        </label>
                        <label class="auth-check">
                            <input type="checkbox" name="remember" value="1"> Se souvenir de moi
                        </label>
                    @else
                        <label class="auth-field">
                            <span>Nom</span>
                            <input type="text" name="nom" value="{{ old('nom') }}" required>
                        </label>
                        <label class="auth-field">
                            <span>Prénom</span>
                            <input type="text" name="prenom" value="{{ old('prenom') }}" required>
                        </label>
                        <label class="auth-field">
                            <span>Adresse e-mail</span>
                            <input type="email" name="email" value="{{ old('email') }}" required autocomplete="email">
                        </label>
                        <label class="auth-field">
                            <span>Mot de passe</span>
                            <input type="password" name="password" required autocomplete="new-password" minlength="8">
                        </label>
                        <label class="auth-field">
                            <span>Confirmation</span>
                            <input type="password" name="password_confirmation" required autocomplete="new-password">
                        </label>
                    @endif

                    <button class="btn btn-primary" type="submit">{{ $submit }}</button>
                </form>

                <p class="auth-alt">
                    @if ($mode === 'login')
                        <a href="{{ route('register') }}">Créer un compte</a>
                    @else
                        <a href="{{ route('login') }}">J’ai déjà un compte</a>
                    @endif
                </p>
            </div>
        </div>
        <footer class="auth-footer">© {{ date('Y') }} République Gabonaise — MEDITRA</footer>
    </main>
</div>
