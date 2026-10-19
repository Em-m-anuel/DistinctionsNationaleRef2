{{--
    En-tête partagé des pages métier.
    Reçoit : $family, $page, $navigation (config('meditra.families.*.navigation')),
             $familyLabel, $pageLabel.
--}}
<header class="site-header sticky" id="site-header">
    <div class="container hdr-top">
        <button class="icon-btn nav-toggle" type="button" data-site-action="mobile" aria-label="Ouvrir le menu de navigation" aria-expanded="false">
            @include('components.icon', ['name' => 'menu'])
        </button>

        <a class="brand" href="{{ route('workspace.' . $family . '.overview') }}" aria-label="MEDITRA, accueil de l’espace">
            <span class="md-brand ">
    <svg class="md-symbol" width="36" height="36" viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
    <path d="M18 2h4.1v13.2H18z" fill="#009E60"/>
    <path d="M22.1 2h3.8v13.2h-3.8z" fill="#FCD116"/>
    <path d="M25.9 2H30v13.2h-4.1z" fill="#3A75C4"/>
    <path d="M18 15.2 24 19.4 30 15.2v1.2L24 21 18 16.4z" fill="#102A50"/>
    <circle cx="24" cy="32.2" r="14.6" fill="#102A50"/>
    <circle cx="24" cy="32.2" r="12.2" stroke="#FCD116" stroke-width="1.5"/>
    <path d="M15.8 39.2V25.6L24 33.2l8.2-7.6v13.6" stroke="#FCD116" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
    <span class="md-brand-text">
      <span class="md-brand-name">MEDITRA</span>
      <span class="md-brand-sub">République Gabonaise</span>
    </span>
  </span>
        </a>

        @include('components.search-trigger')

        <div class="hdr-actions">
            @include('components.notifications')
            @include('components.profile-menu')
        </div>
    </div>

    @include('components.navigation')

    <div data-site-slot="search"></div>
    @include('components.mobile-nav')
</header>
