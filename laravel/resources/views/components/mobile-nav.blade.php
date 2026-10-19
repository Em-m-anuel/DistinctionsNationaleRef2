{{-- Navigation mobile : mêmes liens, à plat. --}}
<div class="mobile-nav" id="mobile-nav" hidden>
    <div class="mobile-nav-list">
        @foreach ($navigation as $item)
            <a href="{{ route($item['route']) }}" data-nav-page="{{ $item['page'] }}"
               data-nav-roles="{{ implode(' ', $item['roles']) }}"
               @if ($item['page'] === $page) aria-current="page" @endif>{{ $item['label'] }}</a>
            @foreach ($item['children'] as $child)
                <a href="{{ route($child['route']) }}" data-nav-page="{{ $child['page'] }}"
                   data-nav-roles="{{ implode(' ', $child['roles']) }}"
                   @if ($child['page'] === $page) aria-current="page" @endif>{{ $child['label'] }}</a>
            @endforeach
        @endforeach
        <a href="{{ route('home') }}">Accueil public</a>
    </div>
</div>
