# API i admin specifikacija (PHP, cPanel)

## Endpoints (read-only, javni)
- `GET /api/projects`  
  - Query: `status=published` (default), `limit`, `offset`, `tag`.  
  - Response: `{ data: [ { id, title, slug, excerpt, hero_image, published_at } ], meta: { total, limit, offset } }`
- `GET /api/projects/{slug}`  
  - Response: `{ id, title, slug, body, excerpt, hero_image, gallery: [ { src, alt } ], published_at, tags }`  
  - 404 ako ne postoji ili je `status != published` (osim ako je admin auth).

## Admin auth
- Session-based login na `POST /admin/login` (email + password); rate limit (npr. 5 pokušaja / 10 min po IP).  
- Logout: `POST /admin/logout`.  
- Svi admin API pozivi zahtevaju session cookie.

## Admin CRUD za projekte
- `GET /admin/projects` (lista, filter po statusu).  
- `POST /admin/projects` (create). Body: `title`, `slug`, `excerpt`, `body`, `tags`, `status`, `published_at`.  
- `PUT /admin/projects/{id}` (update).  
- `DELETE /admin/projects/{id}` (soft delete opciono).  
- Upload hero: `POST /admin/projects/{id}/hero` (multipart). Validacija MIME (jpg/png/webp), max size (npr. 5 MB), generisati webp + smanjene verzije ako GD/Imagick postoje.  
- Upload galerije: `POST /admin/projects/{id}/media` (multipart). Response vraća `file_path` i `id`.

## Sigurnost i zaštita
- PDO sa prepared statements, CORS samo za Vercel domen, CSRF tokeni za admin forme.  
- Gasi `display_errors`; logovi u fajl van webroot-a.  
- `.htaccess` u `uploads` da zabrani izvršne ekstenzije; serviranje fajlova kroz PHP koji provodi MIME i Content-Disposition.

## SEO/Ads integracija (front)
- Server-side meta: title/description/canonical per slug; `ld+json` za `BreadcrumbList`, `Organization`, `Product/Service`.  
- Sitemap ruta: `GET /sitemap.xml` generisana iz baze (status=published).  
- Robots: `GET /robots.txt` sa pravilima i lokacijom sitemap-a.  
- GA4/Google Ads: gtag sa consent bannerom; event-i na CTA i submit forme; server-ili front-side event dispatch.
