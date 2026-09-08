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
    heroPosterEnabled: false, // Temporary preview: show the theme fallback until video playback begins.
    heroPoster: 'assets/images/hero/hero-poster.jpg',
    heroVideoMp4: 'assets/images/hero/hero-video.mp4',
    clinic: 'assets/images/clinic/reception.webp',
    treatment: 'assets/images/services/implantology.webp',
    clinicGallery: [
      'assets/images/clinic/reception.webp',
      'assets/images/clinic/treatment-room.webp',
      'assets/images/clinic/consultation-room.webp'
    ],
    services: {
      implantologie: 'assets/images/services/implantology.webp',
      'estetica-dentara': 'assets/images/services/dental-veneers.webp',
      ortodontie: 'assets/images/services/orthodontics.webp',
      endodontie: 'assets/images/services/endodontics.webp',
      'stomatologie-generala': 'assets/images/services/professional-cleaning.webp',
      'protetica-dentara': 'assets/images/services/dental-crowns.webp',
      chirurgie: 'assets/images/services/oral-surgery.webp',
      parodontologie: 'assets/images/services/periodontics.webp',
      pedodontie: 'assets/images/services/paediatric-dentistry.webp',
      radiologie: 'assets/images/technology/cbct.webp'
    },
    detailServices: {
      'estetica-dentara': 'assets/images/services/teeth-whitening.webp'
    },
    technology: [
      'assets/images/technology/cbct.webp',
      'assets/images/technology/dental-microscope.webp',
      'assets/images/technology/digital-scanner.webp',
      'assets/images/technology/guided-implantology.webp'
    ],
    results: [
      ['assets/images/results/case-02-before.webp', 'assets/images/results/case-02-after.webp'],
      ['assets/images/results/case-01-before.webp', 'assets/images/results/case-01-after.webp'],
      ['assets/images/results/case-03-before.webp', 'assets/images/results/case-03-after.webp']
    ]
  }
};
if (typeof window !== 'undefined') window.LUMEN_CONFIG = LUMEN_CONFIG;
