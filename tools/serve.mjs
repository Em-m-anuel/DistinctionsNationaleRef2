#!/usr/bin/env node
/* ==================================================================
   tools/serve.mjs — serveur statique minimal pour le site multipage.

   Aucune dépendance : uniquement `node:http` et `node:fs`.

   Pourquoi ce serveur ?
     · il sert `/profil/demandeur/dossiers` aussi bien que l'URL avec
       barre finale, sans redirection (les proxies d'aperçu ne suivent
       pas toujours les 301) ;
     · il envoie `Cache-Control: no-store` sur le HTML, le CSS et le JS,
       pour qu'une page régénérée ne soit jamais servie avec un ancien
       CSS ou un ancien script en cache ;
     · il applique les bons types MIME (css, js, svg, jpg, woff2…).

   Usage : node tools/serve.mjs [--port 8000] [--host 0.0.0.0]
================================================================== */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const PORT = Number(argOf("--port", process.env.PORT || 8000));
const HOST = argOf("--host", "0.0.0.0");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

const NO_STORE = new Set([".html", ".css", ".js", ".mjs", ".json"]);

function send(res, status, body, type = "text/plain; charset=utf-8", extra = {}) {
  res.writeHead(status, {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    ...extra,
  });
  res.end(body);
}

/** Résout une URL en fichier, avec `index.html` pour les dossiers. */
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const normalized = path.normalize(clean).replace(/^(\.\.[/\\])+/, "");
  let file = path.join(ROOT, normalized);
  if (!file.startsWith(ROOT)) return { file: null, redirect: null };

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    const index = path.join(file, "index.html");
    if (fs.existsSync(index)) return { file: index, redirect: null };
    return { file: null, redirect: null };
  }
  if (fs.existsSync(file)) return { file, redirect: null };

  // `/profil/demandeur/dossiers` → `…/dossiers/index.html`, sans 301.
  const asDir = path.join(file, "index.html");
  if (fs.existsSync(asDir)) return { file: asDir, redirect: null };

  // `/profil/demandeur/dossiers/` sans fichier → page d'accueil de la famille ?
  return { file: null, redirect: null };
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "Méthode non autorisée", "text/plain; charset=utf-8", { Allow: "GET, HEAD" });
    return;
  }

  const { file } = resolveFile(req.url || "/");
  if (!file) {
    const notFound = path.join(ROOT, "404.html");
    const body = fs.existsSync(notFound)
      ? fs.readFileSync(notFound)
      : `<!doctype html><html lang="fr"><meta charset="utf-8"><title>Page introuvable</title>
<body style="font-family:system-ui;padding:48px"><h1>Page introuvable</h1>
<p>Cette adresse n'existe pas. <a href="/">Revenir à l'accueil</a>.</p></body></html>`;
    send(res, 404, body, "text/html; charset=utf-8");
    return;
  }

  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  const headers = {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": NO_STORE.has(ext) ? "no-store, must-revalidate" : "public, max-age=3600",
  };

  if (req.method === "HEAD") {
    const stat = fs.statSync(file);
    res.writeHead(200, { ...headers, "Content-Length": stat.size });
    res.end();
    return;
  }

  const stream = fs.createReadStream(file);
  stream.on("error", () => send(res, 500, "Erreur de lecture du fichier"));
  res.writeHead(200, headers);
  stream.pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`MEDITRA — site multipage servi sur http://${HOST}:${PORT}`);
  console.log(`Racine : ${ROOT}`);
});
