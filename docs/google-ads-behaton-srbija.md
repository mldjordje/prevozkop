# Google Ads Setup - Behaton

## 1) Sta je sada spremno na sajtu
- Global Google Ads tag se ucitava iz `NEXT_PUBLIC_GADS_ID`.
- Slanje forme sada salje Google Ads konverziju iz `NEXT_PUBLIC_GOOGLE_ADS_FORM_SEND_TO`.
- Klik na telefon i WhatsApp u mobilnom floating CTA moze da salje posebne Ads konverzije preko:
  - `NEXT_PUBLIC_GOOGLE_ADS_PHONE_SEND_TO`
  - `NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_SEND_TO`
- `source_page` sada cuva i query string, pa u leadu ostaju i `utm_*` parametri i `gclid` kada dodje iz oglasa.
- Email obavestenje za lead sada prikazuje:
  - uslugu
  - model/proizvod
  - kolicinu i jedinicu
  - grad
  - source page
  - `utm_source`, `utm_medium`, `utm_campaign`

## 2) Env vrednosti za produkciju
Dodati na frontend:

```env
NEXT_PUBLIC_GADS_ID=AW-17801652604
NEXT_PUBLIC_GOOGLE_ADS_FORM_SEND_TO=AW-17801652604/FORM_LABEL
NEXT_PUBLIC_GOOGLE_ADS_PHONE_SEND_TO=AW-17801652604/PHONE_LABEL
NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_SEND_TO=AW-17801652604/WHATSAPP_LABEL
```

Napomena:
- `FORM_LABEL`, `PHONE_LABEL` i `WHATSAPP_LABEL` uzimas iz konkretnog Conversion Action-a u Google Ads.
- Ako hoces samo jednu glavnu konverziju za start, dovoljno je da podesis samo `NEXT_PUBLIC_GOOGLE_ADS_FORM_SEND_TO`.

## 3) Preporucena struktura kampanja
- Kampanja: `Search | Behaton | Core`
  Landing: `/behaton`
  Namena: opsti i komercijalni upiti.
- Kampanja: `Search | Behaton | Gradovi`
  Landing: `/behaton/grad/{slug}`
  Namena: upiti tipa `behaton beograd`, `behaton nis`, `behaton novi sad`.
- Kampanja: `Brand | Prevozkop | Behaton`
  Landing: `/behaton`
  Namena: branded zastita i jeftiniji branded klikovi.

Moja preporuka:
Za ovaj sajt prvo pusti samo Search. Performance Max ostavi za kasnije, tek kad Search donese ciste leadove i napunis listu negativnih reci.

## 4) Podesavanja kampanje
- Goal: `Leads`
- Bidding za start:
  - ako nema dovoljno konverzija: `Maximize Clicks` sa limitom CPC
  - kad skupis dovoljno leadova: `Maximize Conversions`
- Network:
  - ukljucen Search
  - iskljucen Display Network za start
- Locations:
  - `Serbia`
  - za lokalne kampanje po potrebi zasebni gradovi ili regioni
- Location option:
  - koristi `Presence: People in or regularly in your targeted locations` ako hoces strozu kontrolu i manje vanjskih klikova
- Language:
  - `Serbian`
  - `English`

## 5) Ad grupe i kljucne reci

### Ad grupa: Opsti behaton
- "behaton"
- "behaton srbija"
- "prodaja behatona"
- "cena behatona"
- [behaton cena]

### Ad grupa: Behaton ploce
- "behaton ploce"
- "behaton ploce cena"
- "behaton ploce za dvoriste"
- [behaton ploce]

### Ad grupa: Behaton kocke
- "behaton kocke"
- "behaton kocke cena"
- "kupovina behaton kocki"
- [behaton kocke]

### Ad grupa: Ugradnja
- "ugradnja behatona"
- "postavljanje behatona"
- "behaton za dvoriste"
- "behaton za parking"

### Ad grupa: Gradovi
- "behaton beograd"
- "behaton novi sad"
- "behaton nis"
- "behaton kragujevac"
- "behaton subotica"
- "behaton kraljevo"
- "behaton cacak"
- "behaton valjevo"

Preporuka za match type:
- kreni sa phrase i exact
- broad testiraj tek kada imas dovoljno negativnih reci i cisto pracenje konverzija

## 6) Negativne kljucne reci
- polovno
- oglasi
- olx
- kupujemprodajem
- uradi sam
- diy
- besplatno
- gratis
- posao
- karijera
- slike
- fotografije
- wallpaper
- texture
- cad
- dwg
- blokovi
- cigla

## 7) Responsive Search Ads
RSA za start:
- 1 RSA po ad grupi
- bez preteranog pinovanja
- sto vise unikatnih headline/descriptions

### Headlines
1. Behaton Sirom Srbije
2. Prodaja I Ugradnja
3. Behaton Za Dvorista
4. Cena Po Modelu I Kolicini
5. Brza Procena Za Projekat
6. Kocke, Ploce I Prilazi
7. Parking, Staze, Dvorista
8. Isporuka Po Dogovoru
9. Pomoc Oko Izbora Modela
10. Podloga I Nivelacija
11. Upit Za Behaton Online
12. Behaton Za Poslovne Zone
13. Lokalna Ponuda Za Grad
14. Ponuda Za Privatne Radove
15. Debljina I Format Po Nameni

### Descriptions
1. Posaljite upit za behaton kocke i ploce. Dobijate preporuku modela i procenu kolicine.
2. Behaton za dvorista, prilaze, parkinge i staze. Pomazemo oko podloge, logistike i radova.
3. Radimo gradove sirom Srbije. Brz odgovor za privatne i poslovne projekte.
4. Recite nam kvadraturu, namenu i grad. Saljemo jasan predlog i sledece korake.

### Paths
- `behaton`
- `srbija`

## 8) Asseti

### Sitelinks
- Behaton ponuda -> `/behaton`
- Behaton Beograd -> `/behaton/grad/beograd`
- Behaton Novi Sad -> `/behaton/grad/novi-sad`
- Behaton Nis -> `/behaton/grad/nis`
- Kontakt -> `/kontakt`

### Callouts
- Brza preporuka modela
- Procena kolicine
- Logistika sirom Srbije
- Pomoc oko podloge
- Za privatne i firme
- Upit online ili telefonom

### Structured snippet
- Header: `Usluge`
- Values: `Behaton kocke, Behaton ploce, Ugradnja, Priprema podloge`

## 9) Landing pravila
- Opsti upiti vode na `/behaton`.
- Upiti sa gradom vode na `/behaton/grad/{slug}`.
- Ako oglas pominje cenu, landing mora jasno da objasni da cena zavisi od modela, debljine, kvadrature i logistike.
- Produkt stranice `/behaton/{slug}` sada mogu da se koriste i kao dublji landing za konkretne modele jer imaju:
  - jedinstveniji naslov po varijanti
  - galeriju
  - specifikacije
  - cene po boji kada postoje u opisu
  - formu sa unapred izabranim modelom

## 10) Konverzije koje treba napraviti u Google Ads
- `Lead Form - Behaton`
  Tip: website conversion
  Aktivira se preko `NEXT_PUBLIC_GOOGLE_ADS_FORM_SEND_TO`
- `Phone Click - Mobile CTA`
  Tip: website conversion
  Aktivira se preko `NEXT_PUBLIC_GOOGLE_ADS_PHONE_SEND_TO`
- `WhatsApp Click - Mobile CTA`
  Tip: website conversion
  Aktivira se preko `NEXT_PUBLIC_GOOGLE_ADS_WHATSAPP_SEND_TO`

Moja preporuka za start:
- primarna konverzija neka bude samo forma
- telefon i WhatsApp ostavi kao secondary dok ne vidis kvalitet leadova

## 11) Launch checklist
1. U Google Ads napravi conversion actions za formu, telefon i WhatsApp.
2. Upisi `send_to` vrednosti u frontend env.
3. Redeploy frontend.
4. Otvori sajt sa test URL-om:
   - `/behaton?utm_source=google&utm_medium=cpc&utm_campaign=test&gclid=test123`
5. Posalji test formu.
6. Proveri:
   - da forma vrati success stanje
   - da lead stigne u admin
   - da mail sadrzi `source_page` i UTM
   - da se u Tag Assistant / Google Ads vidi conversion event
7. Tek onda pusti budzet.

## 12) Reference
- Website conversion tracking: [Google Ads Help - How Google Ads tracks website conversions](https://support.google.com/google-ads/answer/7521212?hl=en)
- Responsive search ads: [Google Ads Help - About responsive search ads](https://support.google.com/google-ads/answer/7684791?hl=en)
- RSA assets i dodaci: [Google Ads Help - About assets](https://support.google.com/google-ads/answer/7331111?hl=en)
- Ad strength guidance: [Google Ads Help - About Ad Strength for responsive search ads](https://support.google.com/google-ads/answer/9921843)
- Location targeting: [Google Ads Help - Target ads to geographic locations](https://support.google.com/google-ads/answer/1722043?hl=en)
- Striktnije geo prisustvo: [Google Ads Help - Prevent clicks outside of your geo-targeted locations](https://support.google.com/google-ads/answer/9376662?hl=en)
- Enhanced conversions for web: [Google Ads Help - About enhanced conversions for web](https://support.google.com/google-ads/answer/15712870)
