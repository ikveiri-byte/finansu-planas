# Mano biudžetas

Asmeninė finansų planavimo programėlė. Next.js + Supabase + Tailwind, veikia kaip
PWA (galima "įsidiegti" į telefono ekraną).

**Dizainas** perkurtas pagal tavo ankstesnę programėlę (`finansai-app-main`): DM Sans šriftas,
gradientinės hero kortelės, viršuje esantys tabai su pabraukimu, apvalūs mygtukai,
kiekvieno mėnesio spalvų pora (accent/dark/light) tiksliai atitinka senąją. Funkcijos ir
duomenų struktūra — tos pačios, kurias derinome šiame pokalbyje.

## 1. Supabase (duomenų bazė + prisijungimas)

1. Susikurk paskyrą [supabase.com](https://supabase.com) ir naują projektą.
2. **SQL Editor -> New query** -> įklijuok ir paleisk `supabase/schema.sql`.
3. **Authentication -> Users -> Add user** -> susikurk sau vartotoją (el. paštas + slaptažodis) — juo prisijungsi prie app'o.
4. Nukopijuok to vartotojo **UUID** (Authentication -> Users -> paspaudus ant vartotojo).
5. Atsidaryk `supabase/seed.sql`, pakeisk `__USER_ID__` į tą UUID (Ctrl+H / Find & Replace visame faile).
6. **SQL Editor -> New query** -> įklijuok pataisytą `seed.sql` ir paleisk. Tai įkels visus istorinius duomenis iš Excel.
7. **Project Settings -> API** -> nusikopijuok `Project URL` ir `anon public` raktą — jų reikės kitame žingsnyje.

## 2. Aplinkos kintamieji

Nukopijuok `.env.local.example` į `.env.local` ir įrašyk savo Supabase duomenis:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 3. GitHub

```bash
cd finansu-planas
git init
git add .
git commit -m "Pradinė versija"
git remote add origin https://github.com/<tavo-vartotojas>/finansu-planas.git
git push -u origin main
```

## 4. Vercel

1. [vercel.com](https://vercel.com) -> **Add New Project** -> pasirink savo GitHub repo.
2. **Environment Variables** -> pridėk tuos pačius du kintamuosius iš `.env.local`.
3. Deploy. Po kelių minučių gausi nuorodą, veiksiančią ir kompiuteryje, ir telefone.
4. Telefone atsidaryk tą nuorodą naršyklėje -> "Pridėti į pradžios ekraną" ("Add to Home Screen") — appsas atsidarys kaip įprasta programėlė.

## 5. Reikalingi vaizdai / ikonos (tu pati kursi)

Programėlė šiuos failus tikisi rasti kataloge `public/icons/` — kol jų nėra, PWA
ikona tiesiog nebus rodoma, bet pats appsas veiks normaliai per naršyklę.

| Failas | Dydis | Paskirtis |
|---|---|---|
| `public/icons/icon-192.png` | 192×192 px | App ikona (Android, mažesnė) |
| `public/icons/icon-512.png` | 512×512 px | App ikona (didesnė, splash ekranui) |
| `public/icons/icon-512-maskable.png` | 512×512 px | Ta pati ikona, bet su papildoma paraštę (≈10% nuo kraštų tuščia), kad Android galėtų ją apkirpti į apskritimą/kvadratą nepažeisdama turinio |
| `public/favicon.ico` | 32×32 px (arba .png) | Naršyklės skiltuko ikonėlė |

Kai sukursi šiuos failus — tiesiog įkelk juos į `public/icons/` (ir `public/favicon.ico` į `public/`) savo GitHub repo, Vercel automatiškai juos "pamatys", papildomos konfigūracijos nereikės.

Design kryptis, kurią naudojau appso viduje (kad ikona derėtų): šiltas popieriaus fono
tonas (`#F3F1EA`), tamsi rašalo spalva tekstui (`#20241F`), o kiekvienas mėnuo turi
savo fiksuotą akcentinę spalvą (žr. `lib/monthColors.ts`) — pvz. liepa visada oranžinė
(`#E0793A`), sausis visada mėlyna (`#5B7C99`) ir t.t. Ikona galėtų remtis viena iš šių
spalvų arba būti neutrali (pvz. tavo inicialai ar simbolinis ženkliukas ant popieriaus
fono).

## 6. Ką svarbu žinoti apie duomenų importą

- Importuoti 34 mėnesiai (2023-08 – 2026-07). **2025 m. balandis praleistas** (excel lape buvo sugadinti duomenys).
- Seniausiuose mėnesiuose (iki 2024-03) pajamos importuotos kaip vienas bendras įrašas "Pajamos (istoriniai, be detalės)", nes originaliame faile nebuvo suskaidytos.
- Skolos iš Irutės (2025-11 – 2026-03 laikotarpiu buvusios eilutės) importuotos kaip **jau apmokėtos**, kaip nurodei.
- "Planuojami pirkiniai" iš seno failo neimportuoti (originale neturėjo sumų) — nuo dabar pildysi appse.

## 7. Undo/Redo

Veikia vienos naršymo sesijos ribose (kol neperkrauni puslapio) — tai standartinis šio
tipo funkcijos elgesys daugumoje programėlių.

## 8. CSV eksportas

Statistikos tabe yra mygtukas "⬇ Eksportuoti į CSV" — eksportuoja tuo metu pasirinkto
laikotarpio įrašus. Failą gali atsidaryti su Excel/Google Sheets.
