<script>
    window.setTimeout(function () {
        if (window.__siteBooted) return;
        var zone = document.getElementById("view") || document.getElementById("app");
        if (!zone) return;
        var html = [
            '<section style="max-width:720px;margin:64px auto;padding:0 20px;font-family:system-ui,sans-serif">',
            '<p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:#007e50;font-weight:700">Chargement interrompu</p>',
            '<h1 style="font-size:26px;margin:8px 0 12px;color:#102a50">Le site n’a pas pu charger ses fichiers</h1>',
            '<p style="color:#3f556b;line-height:1.6">Les scripts de cette page ne sont pas accessibles. ',
            'Vérifiez que <code>public/js</code> et <code>public/css</code> ont bien été copiés, ',
            'puis videz le cache du navigateur.</p>',
            '<p style="margin-top:18px"><a href="{{ route('home') }}" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#102a50;color:#fff;text-decoration:none">Revenir à l’accueil</a></p>',
            '</section>'
        ].join("");
        zone.innerHTML = html;
    }, 3500);
</script>
