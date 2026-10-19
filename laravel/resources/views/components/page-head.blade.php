<section class="page-head reveal">
    <p class="page-eyebrow">{{ $eyebrow ?? $familyLabel }}</p>
    <h1 class="page-title">{{ $title }}</h1>
    @isset($subtitle)
        <p class="page-sub">{{ $subtitle }}</p>
    @endisset
</section>
