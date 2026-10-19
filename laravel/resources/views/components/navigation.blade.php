{{--
    Navigation principale : vraie liste de liens (aucun routeur client).
    Le filtrage par rôle est appliqué à l'affichage par js/site/chrome.js
    à partir de data-nav-roles ; l'autorisation réelle est vérifiée par
    App\Http\Controllers\WorkspaceController.
--}}
<nav class="main-nav" aria-label="Navigation principale">
    <div class="container">
        <ul id="nav-list">
            @foreach ($navigation as $item)
                @php
                    $isCurrent = $item['page'] === $page;
                    $isSection = $isCurrent;
                    foreach ($item['children'] as $child) {
                        if ($child['page'] === $page) { $isSection = true; }
                    }
                    $roles = implode(' ', $item['roles']);
                @endphp
                <li class="nav-item{{ $isSection ? ' is-current' : '' }}" data-nav-roles="{{ $roles }}">
                    <a class="{{ $isCurrent ? 'nav-link is-current' : 'nav-link' }}"
                       href="{{ route($item['route']) }}"
                       data-nav-page="{{ $item['page'] }}"
                       data-nav-parent-page="{{ $item['page'] }}"
                       data-nav-roles="{{ $roles }}"
                       @if ($isCurrent) aria-current="page" @endif>
                        @include('components.icon', ['name' => $item['icon']]){{ $item['label'] }}@if ($item['count'])<span class="nav-count is-zero" data-site-unread hidden>0</span>@endif
                    </a>
                    @if (! empty($item['children']))
                        <button class="nav-caret" type="button" data-site-action="menu" aria-expanded="false" aria-haspopup="true"
                                aria-controls="nav-{{ $item['page'] }}" aria-label="Autres accès : {{ $item['label'] }}">
                            @include('components.icon', ['name' => 'chevron-down'])
                        </button>
                        <div class="dd-menu" id="nav-{{ $item['page'] }}" hidden>
                            @foreach ($item['children'] as $child)
                                <a class="menu-item" href="{{ route($child['route']) }}"
                                   data-nav-page="{{ $child['page'] }}"
                                   data-nav-roles="{{ implode(' ', $child['roles']) }}"
                                   @if ($child['page'] === $page) aria-current="page" @endif>
                                    @include('components.icon', ['name' => $child['icon']]){{ $child['label'] }}
                                </a>
                            @endforeach
                        </div>
                    @endif
                </li>
            @endforeach
        </ul>
    </div>
</nav>
