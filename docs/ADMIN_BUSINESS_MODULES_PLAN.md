# Admin poslovni moduli

## Implementiran prvi paket

- Radnici i plate: `workers`, `worker_payrolls`, admin sekcija `/admin/radnici`, API rute `/admin/workers` i `/admin/payrolls`.
- Troskovi: `company_expenses`, admin sekcija `/admin/troskovi`, API rute `/admin/expenses`.
- Plate i troskovi su povezivi preko `company_expenses.worker_id`; automatsko kreiranje troska iz isplacene plate ostaje sledeci mali korak.

## Plan za drugi paket

### Vozila i servisi

Planirana tabela: `vehicles`.

Predvidjena polja:
- naziv
- tip: `mixer`, `truck`, `pump`, `van`, `machine`, `other`
- registracija
- datum isteka registracije
- datum poslednjeg servisa
- datum sledeceg servisa
- kilometraza
- radni sati
- status
- napomena

Veze:
- `company_expenses.vehicle_id` je vec pripremljen za troskove goriva, servisa i registracije.

### Kalendar isporuka

Planirana tabela: `delivery_calendar`.

Predvidjena polja:
- `order_id`
- kupac
- adresa
- datum i vreme
- kolicina
- usluga
- `vehicle_id`
- `worker_id`
- status: `scheduled`, `in_progress`, `done`, `cancelled`
- napomena

Veze:
- isporuka koristi radnika iz `workers`
- isporuka koristi vozilo iz buduce tabele `vehicles`
- porudzbina ostaje izvor prodajnih podataka kroz `orders`
