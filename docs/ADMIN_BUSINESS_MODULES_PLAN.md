# Admin poslovni moduli

## Implementiran prvi paket

- Radnici i plate: `workers`, `worker_payrolls`, admin sekcija `/admin/radnici`, API rute `/admin/workers` i `/admin/payrolls`.
- Troskovi: `company_expenses`, admin sekcija `/admin/troskovi`, API rute `/admin/expenses`.
- Plate i troskovi su povezivi preko `company_expenses.worker_id`; automatsko kreiranje troska iz isplacene plate ostaje sledeci mali korak.

## Implementiran drugi paket

### Vozila i servisi

- Tabela: `vehicles`.
- Admin sekcija: `/admin/vozila`.
- API rute: `/admin/vehicles`, `/admin/vehicles/{id}`, `/admin/vehicles/summary`.
- `company_expenses.vehicle_id` sada povezuje troskove goriva, servisa i registracije sa vozilom.

### Kalendar isporuka

- Tabela: `delivery_calendar`.
- Admin sekcija: `/admin/kalendar`.
- API rute: `/admin/deliveries`, `/admin/deliveries/{id}`, `/admin/deliveries/summary`.
- Isporuka moze da koristi `orders`, `workers` i `vehicles`.
