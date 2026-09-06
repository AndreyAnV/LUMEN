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
│   ├── images/      hero-poster.webp, favicon.svg
│   │   ├── clinic/
│   │   ├── services/
│   │   ├── team/
│   │   └── results/
│   └── video/       hero-poster.webp, README.md
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
- **Imagini originale:** `assets/images/`. Variantele `-small.webp` sunt încărcate pe ecrane mai mici. Înlocuiește atât originalul, cât și varianta mică pentru consecvență. Portretele individuale sunt decupaje editoriale din fotografia de grup generată.

După schimbări în configurație, conținut sau generator:

```powershell
npm ci
npm run build
npm run check
```

Dependențele sunt instrumente de dezvoltare. Site-ul livrat folosește fișiere HTML, CSS, JS, WebP și WOFF2 locale; nu încarcă Tailwind din CDN și nu depinde de un framework JavaScript.

Paginile HTML pot fi editate și direct. O rulare ulterioară a generatorului rescrie acele pagini, așadar păstrează modificările permanente în sursele partajate.

## Hero și video

Posterul principal este `assets/images/hero-poster.webp`. Este inclusă și varianta `hero-poster-small.webp`, precum și copia solicitată în `assets/video/`.

Fișierul **`assets/video/hero-dental.mp4` este intenționat absent**. Site-ul arată posterul complet stilizat. Pentru a activa video, adaugă un MP4 H.264 optimizat la acea cale și deschide site-ul prin `npm start`; nu trebuie schimbat layoutul. Scriptul verifică existența fișierului înainte de redare. La deschiderea directă prin `file://`, cu preferința de mișcare redusă, Save-Data sau conexiuni 2G, rămâne posterul.

## Comportament demonstrativ

- Formularele validează numele, telefonul, emailul opțional, serviciul, data și acordul. **Nu trimit, nu salvează și nu rezervă nimic.** Confirmarea explică acest lucru.
- Echipa, mărturiile, prețurile, experiența și cronologia sunt fictive. Fotografiile au fost create cu instrumentul integrat imagegen. Prompturile complete sunt în `docs/image-prompts.md`.
- Comparațiile sunt simulări. Aceeași pereche de imagini ilustrează cele patru scenarii de portofoliu, fapt menționat pe pagina de rezultate.
- Harta indică **Castelul Corvinilor**, ca reper de concept. Nu susține existența unei clinici la adresă. Încorporarea Google Maps și linkul de direcții nu necesită o cheie API.
- Butoanele sociale explică faptul că nu există conturi reale. Telefonul, emailul și WhatsApp folosesc datele fictive din brief; se înlocuiesc înainte de utilizare reală.
- Datele structurate `Dentist` sunt explicit demonstrative. Paginile au `noindex, nofollow`. `siteUrl` este gol; completarea lui generează URL-uri canonical și Open Graph absolute la următoarea compilare.
- Politicile incluse descriu implementarea demonstrativă actuală; trebuie adaptate dacă sunt adăugate servicii reale.

## Verificare și publicare

`npm run check` verifică toate paginile, referințele locale, ancorele, metadatele, etichetele, scripturile și fluxurile principale într-un DOM local simulat. Nu este o verificare vizuală în browser; raportul documentează această limită.

Pentru găzduire statică se publică paginile HTML și directorul `assets/`. Proiectul este livrat local, fără publicare automată. Înainte de lansarea unei clinici reale, înlocuiește conținutul fictiv, conectează un backend pentru programări, configurează domeniul și verifică interfața pe dispozitive reale.
