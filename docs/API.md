# API i admin specifikacija (PHP, cPanel)

## Javni endpointi
- `GET /api/projects`
  - Query: `status`, `limit`, `offset`
- `GET /api/projects/{slug}`
- `GET /api/products`
  - Query: `status`, `category`, `q`, `limit`, `offset`
- `GET /api/products/{slug}`
- `POST /api/orders`
  - Prima: `name`, `email`, `phone`, `subject`, `concrete_type`, `message`
  - Dodatno prima lead polja: `service_type`, `quantity`, `quantity_unit`, `city_slug`, `source_page`, `utm_source`, `utm_medium`, `utm_campaign`
  - Preporuka: `source_page` neka sadrzi i query string kako bi `gclid` i `utm_*` ostali vezani za lead.

## Admin auth
- `POST /api/admin/login`
- `POST /api/admin/logout`
- Session cookie je obavezan za sve admin rute.

## Admin projekti/proizvodi
- Standardni CRUD i upload endpointi ostaju nepromenjeni:
  - `/api/admin/projects*`
  - `/api/admin/products*`

## Admin porudzbine (lead pipeline)
- `GET /api/admin/orders`
  - Filteri: `status`, `pipeline_stage`, `service_type`, `city_slug`, `from`, `to`, `q`, `limit`, `offset`
- `PUT /api/admin/orders/{id}`
  - Podrzano: `status`, `pipeline_stage`, `next_follow_up_at`, `lost_reason`
- `DELETE /api/admin/orders/{id}`

## Admin lead beleske
- `GET /api/admin/orders/{id}/notes`
- `POST /api/admin/orders/{id}/notes`
  - Body: `{ "note": "..." }`

## Admin ponude
- `GET /api/admin/orders/{id}/offers`
- `POST /api/admin/orders/{id}/offers`
- `PUT /api/admin/offers/{id}`
- `GET /api/admin/offers/{id}/print` - print-ready HTML view for Save as PDF / printing

## Napomene
- JSON response koristi `utf-8`.
- Za upload i staticke fajlove ostaju postojeca pravila i validacija MIME tipa.
