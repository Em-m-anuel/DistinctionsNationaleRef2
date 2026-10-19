<div class="dd">
    <button class="icon-btn" type="button" data-cf-action="notices" aria-expanded="false" aria-label="Notifications">
        @include('components.icon', ['name' => 'bell'])
        <span class="count" data-site-unread hidden>0</span>
    </button>
    <div data-site-slot="notices"></div>
</div>
