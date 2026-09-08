# LUMEN Dental

Site demonstrativ complet pentru o clinică fictivă din Hunedoara. 14 pagini HTML statice, Tailwind CSS compilat local, CSS propriu și JavaScript fără framework. Nu are nevoie de compilare pentru a fi vizualizat.

## Deschidere locală

Deschide `index.html` direct în browser. Paginile, imaginile, fonturile, navigarea, comparațiile și formularele demonstrative funcționează local. Harta Google necesită internet.

Pentru previzualizare prin HTTP, din acest director:

```powershell
npm start
```

Apoi deschide **http://127.0.0.1:4173**. Serverul necesită Node.js 22 sau mai nou și nu necesită instalarea dependențelor pentru simpla pornire. Oprire: `Ctrl+C`.

## Structură

```text
DenTST/
├── index.html
├── servicii.html
├── implantologie.html
├── estetica-dentara.html
├── ortodontie.html
├── endodontie.html
├── echipa.html
├── rezultate.html
├── tarife.html
├── despre-noi.html
├── programare.html
├── contact.html
├── confidentialitate.html
├── cookies.html
├── assets/
│   ├── css/         styles.css, tailwind.css, tailwind-input.css
│   ├── js/          config.js, main.js, results.js, cases-data.js
│   ├── fonts/       Manrope local, inclusiv diacritice românești și licență OFL
│   ├── images/      favicon.svg și hero/
│   │   ├── clinic/
│   │   ├── services/
│   │   ├── team/
│   │   └── results/
├── scripts/
│   ├── content.mjs         servicii, echipă, tarife, cazuri
│   ├── build-site.mjs      generează paginile statice
│   ├── prepare-assets.py  comprimă imaginile și decupează portretele
│   ├── serve.mjs          server local
│   └── check.mjs          verificări de structură și interacțiuni
├── docs/
│   ├── image-prompts.md   prompturile exacte și proveniența imaginilor
│   └── validation.md     rezultatul și limitele verificărilor
├── package.json
├── package-lock.json
└── README.md
```

## Personalizare

- **Identitate, adresă, telefon, email, program, media și domeniu:** `assets/js/config.js`.
- **Servicii, cinci profile de echipă, prețuri și cazuri:** `scripts/content.mjs`.
- **Conținut, navigare și subsol partajate:** `scripts/build-site.mjs`.
- **Design și variante pentru telefon:** `assets/css/styles.css`.
- **Interacțiuni și formulare:** `assets/js/main.js`; filtre și modal: `assets/js/results.js`.
- **Animații:** `assets/js/motion.js`, `assets/js/page-entry.js` și `assets/css/motion.css`; detalii și limite în `docs/motion.md`.
- **Imagini originale:** `assets/images/`. Variantele `-small.webp` sunt încărcate pe ecrane mai mici. Înlocuiește atât originalul, cât și varianta mică pentru consecvență. Portretele individuale sunt decupaje editoriale din fotografia de grup generată.

După schimbări în configurație, conținut sau generator:

```powershell
npm ci
npm run build
npm run check
```

Dependențele sunt instrumente de dezvoltare. Site-ul livrat folosește fișiere HTML, CSS, JS, WebP și WOFF2 locale; nu încarcă Tailwind din CDN și nu depinde de un framework JavaScript.

Paginile HTML pot fi editate și direct. O rulare ulterioară a generatorului rescrie acele pagini, așadar păstrează modificările permanente în sursele partajate.

## Hero

Secțiunea hero folosește `assets/images/hero/hero-video.mp4`, optimizat pentru redare în Safari. `hero-poster.jpg` nu este încărcat la pornire, pentru a evita orice apariție înaintea videoclipului; JavaScript îl afișează automat și fără controale suplimentare doar dacă redarea video este blocată (inclusiv de modul Low Power pe iPhone) sau indisponibilă. Două straturi video suprapuse creează tranziția blur/crossfade dintre reluări atunci când videoclipul rulează.

## Comportament demonstrativ

- Formularele validează numele, telefonul, emailul opțional, serviciul, data și acordul. **Nu trimit, nu salvează și nu rezervă nimic.** Confirmarea explică acest lucru.
- Echipa, mărturiile, prețurile, experiența și cronologia sunt fictive. Fotografiile demonstrative au fost create pentru acest concept.
- Comparațiile sunt simulări. Aceeași pereche de imagini ilustrează cele patru scenarii de portofoliu, fapt menționat pe pagina de rezultate.
- Harta indică **Castelul Corvinilor**, ca reper de concept. Nu susține existența unei clinici la adresă. Încorporarea Google Maps și linkul de direcții nu necesită o cheie API.
- Butoanele sociale explică faptul că nu există conturi reale. Telefonul, emailul și WhatsApp folosesc datele fictive din brief; se înlocuiesc înainte de utilizare reală.
- Datele structurate `Dentist` sunt explicit demonstrative. Paginile au `noindex, nofollow`. `siteUrl` este gol; completarea lui generează URL-uri canonical și Open Graph absolute la următoarea compilare.
- Politicile incluse descriu implementarea demonstrativă actuală; trebuie adaptate dacă sunt adăugate servicii reale.

## Verificare și publicare

`npm run check` verifică toate paginile, referințele locale, ancorele, metadatele, etichetele, scripturile și fluxurile principale într-un DOM local simulat. Nu este o verificare vizuală în browser; raportul documentează această limită.

Pentru găzduire statică se publică paginile HTML și directorul `assets/`. Proiectul este livrat local, fără publicare automată. Înainte de lansarea unei clinici reale, înlocuiește conținutul fictiv, conectează un backend pentru programări, configurează domeniul și verifică interfața pe dispozitive reale.
