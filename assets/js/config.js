/* Single source for business identity. Run npm run build after editing. No real clinic is represented. */
const LUMEN_CONFIG = {
  name: 'LUMEN Dental',
  wordmark: 'LUMEN',
  descriptor: 'D E N T A L',
  city: 'Hunedoara',
  address: 'Strada Curtea Corvinilor 1–3',
  postcode: '331141',
  country: 'România',
  phone: '+40 700 000 000',
  phoneLink: '+40700000000',
  whatsapp: '40700000000',
  email: 'contact@lumendental.ro',
  siteUrl: '',
  demo: true,
  hours: [['Luni–Vineri', '08:00–20:00'], ['Sâmbătă', '09:00–14:00'], ['Duminică', 'Închis']],
  media: {
    hero: 'assets/images/hero-poster.webp',
    clinic: 'assets/images/clinic/interior.webp',
    treatment: 'assets/images/services/precision.webp',
    team: 'assets/images/team/echipa.webp',
    before: 'assets/images/results/inainte.webp',
    after: 'assets/images/results/dupa.webp',
    video: 'assets/video/hero-dental.mp4'
  }
};
if (typeof window !== 'undefined') window.LUMEN_CONFIG = LUMEN_CONFIG;
