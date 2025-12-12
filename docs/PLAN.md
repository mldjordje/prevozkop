# Prevoz Kop – migracija na savremeni stack

Ovaj plan pokriva prelazak na moderni front (Vercel/Next.js), zadržavanje baze na cPanel/phpMyAdmin, i izgradnju jednostavnog CMS/API sloja za projekte.

## Tehnički okvir
- Front: Next.js 15 (app router), SSR/SSG za SEO i Google Ads kvalitet, Tailwind ili CSS Modules; deploy iz Git->Vercel.
- Backend/API: PHP 8.1+ na cPanelu, PDO + MySQL; REST JSON rute `/api/projects` i `/api/projects/{slug}`; admin sa login-om i CRUD za projekte.
- Baza: MySQL (preko phpMyAdmin). Tabele `projects`, `project_media`, `admins` (vidi `sql/schema.sql`).
- Asseti: upload u `/uploads/projects/{id}/`; servirati preko PHP skripte sa kontrolom MIME i keš zaglavljima; `.htaccess` blok direktnog listanja.

## SEO/Ads smernice
- `lang="sr"` (ili `sr-Latn` ako ostajemo na latinici); canonical tagovi, og:image/og:title/og:description, twitter cards.
- Sitemap i robots.txt izgraditi na backendu (dinamički iz baze) i hostovati na istom rootu.
- Strukturirani podaci: `BreadcrumbList`, `Organization`, `Product/Service` po stranici projekta.
- Page speed: SSR + statička prerender lista/detalj projekata, optimizovane slike (webp + fallback), lazy load za galerije.
- Konverzije: jasno definisani event-i (CTA klik, submit kontakt forme) + Google Ads/GA4 tag; cookie/consent banner pre marketing kolačića.

## Koraci
1) Provera hostinga: PHP verzija, da li imamo SSH/Composer; max upload size; da li je moguć crontab (za sitemap refresh).  
2) Kreirati bazu i tabele (import `sql/schema.sql` u phpMyAdmin).  
3) Postaviti `.env` (lokalno i na serveru) za DB i upload putanje; ugasiti `display_errors` u produkciji.  
4) Implementirati PHP API (read-only) za projekte + admin login/CRUD:  
   - Auth: sessions + rate limit na login; password_hash.  
   - Rute: `/api/projects`, `/api/projects/{slug}`, `/admin/projects/*`, upload endpoint sa validacijom MIME/veličine.  
5) Front: podići Next.js app (repo na Git) sa stranicama:  
   - `/` (hero + istaknuti projekti iz API-ja), `/projekti` (lista), `/projekti/[slug]` (detalj, galerija), `/kontakt` (forma ka backendu).  
   - Dodati SEO head helper, strukturisane podatke, sitemap i robots integraciju (fetch iz backend rute ili generisati na frontu iz API-ja).  
6) Uvezati kontakt formu i CTA event-e sa Google Ads/GA4 (gtag) i consent bannerom.  
7) Migracija sadržaja: popuniti bazu postojećim projektima, dodati preusmerenja sa starih `.html` ruta (301) na nove rute.  
8) QA: Lighthouse, Core Web Vitals, test API/error handling, test upload limita, test 301 i sitemap/robots.  
9) Deploy: Backend na cPanel (API + admin + uploads), Front na Vercel; podesiti env varijable i CORS između domena.

## Otvorene odluke
- Da li koristimo latinicu ili ćirilicu kao primarni sadržaj (`lang`)?  
- Da li cPanel omogućava Composer (Filament/Laravel admin) ili idemo na custom “light” admin?  
- Maksimalne dozvoljene veličine upload-a i da li treba automatska kompresija (Imagick/GD dostupnost).  
- Treba li multi-language (sr/en) sada ili kasnije?
