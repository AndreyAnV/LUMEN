import {readFile, writeFile, readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {Window} from 'happy-dom';
import {services as roServices, team as roTeam, prices as roPrices, cases as roCases} from './content.mjs';
import {services as enServices, team as enTeam, prices as enPrices, cases as enCases} from './content-en.mjs';

const root = resolve(import.meta.dirname, '..');
const englishFile = filename => filename.replace(/\.html$/, '-en.html');
const translations = new Map();
const pair = (ro, en) => {
  if (typeof ro === 'string' && typeof en === 'string' && ro !== en) translations.set(ro, en);
  else if (Array.isArray(ro) && Array.isArray(en)) ro.forEach((value, index) => pair(value, en[index]));
  else if (ro && en && typeof ro === 'object' && typeof en === 'object') {
    for (const key of Object.keys(ro)) if (key in en && !['slug','category','id','image','doctor'].includes(key)) pair(ro[key], en[key]);
  }
};
pair(roServices, enServices);
pair(roTeam, enTeam);
pair(roPrices, enPrices);
pair(roCases, enCases);

const staticTranslations = {
  'Acasă':'Home','Servicii':'Services','Echipă':'Team','Rezultate':'Results','Tarife':'Fees','Despre noi':'About us','Contact':'Contact',
  'Limbă':'Language','Navigație principală':'Main navigation','Navigație mobilă':'Mobile navigation','Meniu de navigație':'Navigation menu',
  'Sari la conținut':'Skip to content','Deschide meniul':'Open menu','Închide meniul':'Close menu','Închide':'Close',
  'Programează-te':'Book an appointment','Programează o consultație':'Book a consultation','Solicită o consultație':'Request a consultation',
  'Sună':'Call','Contact rapid':'Quick contact','HUNEDOARA · ROMÂNIA':'HUNEDOARA · ROMANIA',
  'Concept demonstrativ · Date de contact fictive':'Demonstration concept · Fictional contact details',
  'Stomatologie modernă pentru':'Modern dentistry for','zâmbete care durează.':'smiles that last.',
  'Explorează':'Explore','Ne găsești aici':'Find us here','Program':'Opening hours',
  'Luni–Vineri':'Monday–Friday','Sâmbătă':'Saturday','Duminică':'Sunday','Închis':'Closed',
  'Adresă și contacte demonstrative.':'Demonstration address and contact details.','Nu există o clinică LUMEN la această adresă.':'There is no LUMEN clinic at this address.',
  'Concept demonstrativ':'Demonstration concept','Politica de confidențialitate':'Privacy policy','Politica cookies':'Cookie policy',
  'Confidențialitate':'Privacy','Programare':'Appointments','de la':'from','/ arcadă':'/ arch','politica cookies':'cookie policy',
  '331141 Hunedoara, România':'331141 Hunedoara, Romania','nume@exemplu.ro':'name@example.com',
  'Clinică fictivă. Echipa, experiența, recenziile, tarifele și cazurile sunt conținut demonstrativ. Imaginile sunt generate cu inteligență artificială.':'Fictional clinic. The team, experience, reviews, fees and cases are demonstration content. Images were generated using artificial intelligence.',
  'Un concept, deocamdată.':'A concept, for now.','Am înțeles':'Understood',
  'Fir de navigare':'Breadcrumb','Simulare demonstrativă după tratament: zâmbet cu dinți aliniați':'Demonstration after-treatment simulation: aligned teeth',
  'Simulare demonstrativă înainte de tratament: zâmbet natural':'Demonstration before-treatment simulation: natural smile',
  'ÎNAINTE':'BEFORE','DUPĂ':'AFTER','Compară înainte și după — deplasează separatorul':'Compare before and after — move the slider',
  'Glisează pentru a compara':'Slide to compare','50% înainte, 50% după':'50% before, 50% after',
  'imagine demonstrativă':'demonstration image','imagine generată':'generated image','Portret generat, profil fictiv:':'Generated portrait, fictional profile:',
  'Interior demonstrativ LUMEN Dental, cu lumină naturală și finisaje calde':'Demonstration LUMEN Dental interior with natural light and warm finishes',
  'Planificare cu instrumente de precizie — imagine demonstrativă':'Precision treatment planning — demonstration image',
  'Instagram — profil demonstrativ':'Instagram — demonstration profile','Facebook — profil demonstrativ':'Facebook — demonstration profile',
  'MEDIC · PROFIL DEMO':'DENTIST · DEMO PROFILE','ASISTENT · PROFIL DEMO':'DENTAL NURSE · DEMO PROFILE',
  'Programează o consultație —':'Book a consultation —','Descoperă profilul —':'View profile —',
  'ÎN SPATELE FIECĂRUI ZÂMBET':'BEHIND EVERY SMILE','Oameni în care poți':'People you can','avea încredere.':'trust.',
  'Cinci personalități. Aceeași grijă pentru tine. Profiluri fictive, create pentru acest concept.':'Five personalities. The same care for you. Fictional profiles created for this concept.',
  'Cunoaște echipa':'Meet the team','TEHNOLOGIE CU SENS':'TECHNOLOGY WITH PURPOSE','Precizia face diferența.':'Precision makes the difference.',
  'Mai multă claritate pentru medic. Un plan mai ușor de înțeles pentru tine.':'More clinical clarity. A treatment plan that is easier for you to understand.',
  '01 / DIAGNOSTIC':'01 / DIAGNOSTICS','Radiologie digitală':'Digital dental radiology','Diagnostic rapid, direct în clinică. Investigații recomandate atunci când sunt necesare.':'Prompt diagnostics in the clinic. Imaging is recommended only when clinically indicated.',
  'Instrumentar de precizie — imagine generată':'Precision instruments — generated image','Microscop dentar':'Dental operating microscope',
  'Precizie sporită pentru tratamente complexe.':'Enhanced precision for complex treatments.','Planificare digitală':'Digital planning',
  'Tratamentul începe înainte de prima intervenție.':'Treatment begins before the first procedure.','Confort înainte de toate':'Comfort comes first',
  'O experiență calmă, cu timp pentru întrebările tale.':'A calm experience, with time for your questions.',
  'UN ÎNCEPUT BUN':'A GOOD BEGINNING','Primul pas':'The first step','este simplu.':'is simple.',
  'Spune-ne cu ce te putem ajuta, iar noi te contactăm pentru confirmarea programării.':'Tell us how we can help and we will contact you to confirm the appointment request.',
  'Preferi să vorbim?':'Prefer to speak with us?','Număr demonstrativ':'Demonstration number',
  'Nume':'Name','Telefon':'Phone','Serviciu':'Service','Mesaj':'Message','opțional':'optional','Alege serviciul':'Select a service',
  'Nu știu încă — am nevoie de o consultație':'I am not sure yet — I need a consultation','Numele tău':'Your name','Cum te putem ajuta?':'How can we help?',
  'Am citit':'I have read the','politica de confidențialitate':'privacy policy','și sunt de acord cu utilizarea datelor pentru solicitarea mea.':'and agree that my details may be used for this request.',
  'Solicită programare':'Request an appointment','Răspundem de obicei în timpul programului clinicii.':'We usually respond during clinic hours.',
  'Formular demonstrativ. Datele nu sunt trimise sau salvate.':'Demonstration form. Data is neither sent nor saved.',
  'SUNTEM AICI PENTRU TINE':'WE ARE HERE FOR YOU','Începem cu o conversație.':'Let’s start with a conversation.','Un plan clar începe cu întrebările tale.':'A clear plan begins with your questions.',
  'STOMATOLOGIE MODERNĂ · HUNEDOARA':'MODERN DENTISTRY · HUNEDOARA','Un zâmbet care':'A smile that','se simte la fel de':'feels as good as','bine cum':'it','arată.':'looks.',
  'Stomatologie modernă, tehnologie precisă și o echipă care pune confortul tău pe primul loc.':'Modern dentistry, precise technology and a team that puts your comfort first.',
  'Descoperă serviciile':'Explore our services','O NOUĂ PERSPECTIVĂ ASUPRA STOMATOLOGIEI':'A NEW PERSPECTIVE ON DENTISTRY',
  'Consultații disponibile':'Consultations available','Vezi programările':'View appointments','LUMEN DENTAL · CONCEPT DEMONSTRATIV':'LUMEN DENTAL · DEMONSTRATION CONCEPT',
  'Clinica în cifre — date demonstrative':'The clinic in numbers — demonstration data','ani experiență':'years of experience','specialiști în echipă':'team members',
  'Tehnologie digitală':'Digital technology','Tratamente complete':'Comprehensive care','Date demonstrative':'Demonstration data',
  'TOTUL ÎNTR-UN SINGUR LOC':'COMPLETE CARE IN ONE PLACE','Tot ce îi trebuie':'Everything your','zâmbetului tău.':'smile needs.',
  'De la prevenție la reabilitări complexe, fiecare tratament face parte dintr-un plan gândit pentru tine.':'From prevention to complex rehabilitation, every treatment is part of a plan designed for you.',
  'Toate serviciile':'All services','Tarif stabilit la consultație':'Fee confirmed after consultation',
  'IMPLANTOLOGIE LUMEN':'LUMEN IMPLANT DENTISTRY','Implantologia modernă începe cu un':'Modern implant dentistry begins with a','plan precis.':'precise plan.',
  'IMPLANTOLOGIE · LUMEN DENTAL':'DENTAL IMPLANTS · LUMEN DENTAL','ESTETICĂ DENTARĂ · LUMEN DENTAL':'COSMETIC DENTISTRY · LUMEN DENTAL','ORTODONȚIE · LUMEN DENTAL':'ORTHODONTICS · LUMEN DENTAL','ENDODONȚIE · LUMEN DENTAL':'ENDODONTICS · LUMEN DENTAL',
  'Privim imaginea de ansamblu înainte să ne concentrăm pe detalii. Pentru o soluție potrivită ție, de la prima discuție.':'We consider the complete clinical picture before focusing on individual details, so your options are appropriate from the first discussion.',
  'Soluții adaptate fiecărui caz':'Solutions tailored to each case','De la consultație până la lucrarea finală':'From consultation to the final restoration','Descoperă implantologia':'Explore implant dentistry',
  'REZULTATE · SIMULĂRI DEMONSTRATIVE':'RESULTS · DEMONSTRATION SIMULATIONS','Transformări care se văd.':'Visible transformations.','Încredere care se simte.':'Confidence you can feel.',
  'Fiecare caz începe cu o poveste. Fiecare plan, cu o persoană.':'Every case begins with a story. Every plan begins with a person.','CAZ 01 · DEMONSTRATIV':'CASE 01 · DEMONSTRATION','CAZ 02 · DEMONSTRATIV':'CASE 02 · DEMONSTRATION',
  'O nuanță mai uniformă':'A more even tooth shade','Estetică dentară':'Cosmetic dentistry','2 săptămâni — scenariu ilustrativ':'2 weeks — illustrative scenario',
  '6 luni — scenariu ilustrativ':'6 months — illustrative scenario','Vezi toate cazurile':'View all cases',
  'Fotografiile sunt demonstrative. Rezultatele tratamentelor diferă de la pacient la pacient.':'Images are for demonstration only. Treatment outcomes vary from patient to patient.',
  'EXPERIENȚA LUMEN · RECENZII FICTIVE':'THE LUMEN EXPERIENCE · FICTIONAL REVIEWS','carusel':'carousel','Mărturii demonstrative':'Demonstration testimonials',
  'Pentru prima dată n-am avut senzația că merg la dentist. Totul a fost explicat clar, iar experiența a fost surprinzător de relaxată.':'For the first time, visiting the dentist did not feel daunting. Everything was explained clearly and the experience was surprisingly relaxed.',
  'Mi-a plăcut că am avut timp să pun întrebări. Am înțeles opțiunile și am știut ce urmează la fiecare pas.':'I appreciated having time to ask questions. I understood my options and knew what to expect at every stage.',
  'Un spațiu calm și oameni atenți. De la prima discuție, m-am simțit ascultată.':'A calm space and attentive people. I felt heard from our first conversation.',
  '5 stele':'5 stars','Mărturie demonstrativă':'Demonstration testimonial','Recenzia anterioară':'Previous review','Recenzia următoare':'Next review',
  'Tratamente pentru fiecare etapă a zâmbetului tău.':'Care for every stage of your smile.','Un singur loc. Un plan complet. De la prima consultație la îngrijirea pe termen lung.':'One place. One comprehensive plan. From your first consultation to long-term care.',
  'Toate tratamentele':'All treatments','Descoperă tratamentul':'Explore this treatment','Plan și tarif stabilite la consultație':'Treatment plan and fee confirmed after consultation',
  'Tarife demonstrative. Costul final se stabilește în urma consultației și a planului individual de tratament.':'Demonstration fees. The final cost is confirmed after a consultation and an individual treatment plan.',
  'O ABORDARE ATENTĂ':'THOUGHTFUL CARE','Claritate înainte de tratament.':'Clarity before treatment.','Cui i se adresează':'Who may benefit',
  'PAS CU PAS':'STEP BY STEP','Știi mereu ce urmează.':'Always know what comes next.','Pornim de la întrebările tale și de la o evaluare atentă.':'We begin with your questions and a careful assessment.',
  'Discutăm opțiunile, etapele și costurile estimate.':'We discuss your options, treatment stages and estimated costs.','Adaptăm fiecare etapă la planul stabilit împreună.':'We tailor each stage to the treatment plan agreed with you.',
  'Îți explicăm îngrijirea și următoarele vizite.':'We explain aftercare and the appointments that follow.','COSTURI EXPLICATE':'CLEARLY EXPLAINED FEES',
  'Un plan clar.':'A clear plan.','Inclusiv financiar.':'Including the cost.','Tarif demonstrativ':'Demonstration fee','Vezi toate tarifele':'View all fees',
  'Profil fictiv. Medicul și rolul se înlocuiesc înainte de publicare.':'Fictional profile. Replace the clinician and role before publication.',
  'ÎNTREBĂRI FIREȘTI':'COMMON QUESTIONS','Răspunsuri, pe înțelesul tău.':'Answers in clear language.',
  'Fiecare zâmbet are propria poveste.':'Every smile has its own story.','O perspectivă asupra felului în care poate fi gândit un tratament. Cazuri ilustrative, prezentate ca un portofoliu.':'A perspective on how dental treatment may be planned. Illustrative cases presented as a portfolio.',
  'Fotografiile sunt demonstrative. Rezultatele tratamentelor diferă de la pacient la pacient. Aceeași pereche de imagini generate ilustrează scenarii diferite; nu documentează tratamente efectuate.':'Images are for demonstration only. Treatment outcomes vary from patient to patient. The same generated image pair illustrates different scenarios and does not document treatment provided.',
  'Filtrează cazurile':'Filter cases','Toate':'All','Implanturi':'Dental implants','Estetică':'Cosmetic dentistry','Protetică':'Prosthodontics',
  '4 cazuri demonstrative':'4 demonstration cases','Deschide cazul':'Open case','Simulare de zâmbet — cazul demonstrativ':'Smile simulation — demonstration case','CAZ':'CASE','SIMULARE':'SIMULATION',
  'scenariu ilustrativ':'illustrative scenario','Închide cazul':'Close case','Punctul de plecare':'Starting point','Abordarea':'Approach','Obiectivul':'Objective',
  'Simulare vizuală, fără valoare de predicție medicală. Rezultatele diferă de la pacient la pacient.':'Visual simulation with no medical predictive value. Outcomes vary from patient to patient.',
  'Discută despre cazul tău':'Discuss your case','SCENARIU DEMONSTRATIV':'DEMONSTRATION SCENARIO','durată ilustrativă':'illustrative timeline',
  'Profesioniști.':'Professionals.','Dar mai întâi, oameni.':'People first.','Încrederea începe cu o conversație. Descoperă oamenii imaginați pentru conceptul LUMEN.':'Trust begins with a conversation. Meet the fictional people created for the LUMEN concept.',
  'Toate cele cinci identități, biografiile și portretele sunt fictive. Aceste profiluri nu reprezintă personal medical real și nu atestă calificări profesionale.':'All five identities, biographies and portraits are fictional. These profiles do not represent real dental professionals or attest to professional qualifications.',
  'ACELEAȘI VALORI':'SHARED VALUES','Ascultăm. Explicăm.':'We listen. We explain.','Construim încredere.':'We build trust.',
  'O experiență bună începe când te simți ascultat. În conceptul LUMEN, colaborarea și timpul acordat fiecărei persoane sunt la fel de importante ca tehnologia.':'A positive experience begins when you feel heard. In the LUMEN concept, collaboration and time for every person matter as much as technology.',
  'Prețuri clare.':'Clear fees.','Planuri fără surprize.':'Plans without surprises.','Fiecare zâmbet are nevoi diferite. Aici găsești un punct de plecare pentru discuția despre planul tău.':'Every smile has different needs. These fees provide a starting point for discussing your treatment plan.',
  'Procedurile suplimentare și etapele protetice se prezintă separat în planul de tratament.':'Additional procedures and prosthetic stages are itemised separately in the treatment plan.','Discută cu noi':'Talk to us','servicii':'services',
  'Vrei să afli costul pentru cazul tău?':'Would you like an estimate for your case?',
  'Medicină precisă.':'Precise dentistry.','Oameni înainte de toate.':'People come first.','Un spațiu în care tehnologia se întâlnește cu grija. Iar fiecare vizită începe cu tine.':'A space where technology meets thoughtful care, and every visit begins with you.',
  'Concept de interior LUMEN Dental — imagine generată':'LUMEN Dental interior concept — generated image','UN SPAȚIU PENTRU STAREA TA DE BINE':'A SPACE DESIGNED FOR YOUR WELLBEING',
  'POVESTEA NOASTRĂ':'OUR STORY','O altă perspectivă':'A different perspective','asupra mersului':'on visiting','la dentist.':'the dentist.',
  'LUMEN este un concept de clinică construit în jurul unei idei simple: îngrijirea bună începe cu o relație bună.':'LUMEN is a dental clinic concept built around a simple idea: good care begins with a good relationship.',
  'Ne imaginăm un loc luminos și calm, în care primești explicații clare și ai timp să iei decizii. O echipă care privește dincolo de tratament, spre omul din fața sa.':'We imagine a bright, calm place where you receive clear explanations and have time to make decisions. A team that sees the person as well as the treatment.',
  'Povestea, cronologia și cifrele de mai jos sunt fictive, create pentru acest site demonstrativ.':'The story, timeline and figures below are fictional and were created for this demonstration website.',
  'Statistici fictive':'Fictional statistics','membri în echipă':'team members','pacienți':'patients','arii de tratament':'areas of care',
  'FILOSOFIA NOASTRĂ':'OUR PHILOSOPHY','De ce LUMEN':'Why LUMEN','Trei idei care dau sens fiecărei etape.':'Three principles that guide every stage.',
  'Timp pentru tine':'Time for you','Ascultăm înainte să propunem. Întrebările tale fac parte din consultație.':'We listen before making recommendations. Your questions are part of the consultation.',
  'Un plan pe înțelesul tău':'A plan you can understand','Discutăm opțiunile, costurile și pașii următori, cu răbdare.':'We discuss your options, costs and next steps with patience.',
  'Grijă consecventă':'Continuity of care','Prevenția și urmărirea sunt parte din aceeași relație de încredere.':'Prevention and follow-up are part of the same relationship of trust.',
  'O POVESTE IMAGINATĂ':'AN IMAGINED STORY','Creștem cu fiecare pas.':'Growing with every step.','Începutul poveștii':'The story begins',
  'Un spațiu mic și o idee mare: mai multă grijă pentru fiecare persoană.':'A small space and a big idea: more thoughtful care for every person.','Extinderea clinicii':'Expanding the clinic',
  'Un concept de echipă în care specialitățile lucrează împreună.':'A team concept where dental specialties work together.','Stomatologie digitală modernă':'Modern digital dentistry','Tehnologie care sprijină diagnosticul și planificarea.':'Technology that supports diagnosis and treatment planning.',
  'SPAȚIUL LUMEN':'THE LUMEN SPACE','Calm, până în cele mai mici detalii.':'Calm, down to the smallest detail.','Interior de clinică — concept generat':'Clinic interior — generated concept','Detaliu instrumentar — concept generat':'Instrument detail — generated concept','Echipa fictivă LUMEN Dental — fotografie generată':'Fictional LUMEN Dental team — generated image','ECHIPĂ · CONCEPT DEMONSTRATIV':'TEAM · DEMONSTRATION CONCEPT',
  'Recepția clinicii — concept generat':'Clinic reception — generated concept','Cabinet de tratament — concept generat':'Dental treatment room — generated concept','Spațiu de consultație — concept generat':'Consultation room — generated concept',
  'Echipament CBCT pentru radiologie digitală — imagine generată':'CBCT equipment for digital dental radiology — generated image','Tratament endodontic asistat de microscop — imagine generată':'Microscope-assisted endodontic treatment — generated image','Scanare intraorală digitală — imagine generată':'Digital intraoral scanning — generated image','Planificare digitală pentru implantologie ghidată — imagine generată':'Digital planning for guided implant surgery — generated image',
  'Imaginile generate ilustrează scenarii diferite și nu documentează tratamente efectuate.':'The generated images illustrate different scenarios and do not document treatments that were performed.',
  'Hai să vorbim.':'Let’s talk.','O întrebare, o primă vizită sau un nou început. Suntem la un mesaj distanță.':'A question, a first visit or a new beginning. We are only a message away.',
  'Ne imaginăm':'We imagine being','aproape de tine.':'close to you.','Reper pentru concept: zona intrării la Castelul Corvinilor. LUMEN Dental este fictivă și nu funcționează la această adresă.':'Concept landmark: the entrance area of Corvin Castle. LUMEN Dental is fictional and does not operate at this address.',
  'Telefon · număr demonstrativ':'Phone · demonstration number','WhatsApp · număr demonstrativ':'WhatsApp · demonstration number','Email · adresă demonstrativă':'Email · demonstration address','Program demonstrativ':'Demonstration opening hours',
  'Hartă reper: Castelul Corvinilor, Hunedoara — nu reprezintă o clinică reală':'Landmark map: Corvin Castle, Hunedoara — this is not a real clinic','CASTELUL CORVINILOR · REPER DEMO':'CORVIN CASTLE · DEMO LANDMARK','Deschide în Google Maps':'Open in Google Maps',
  'Harta este furnizată de Google. Dacă nu se încarcă, poți folosi legătura de mai sus. Consultă':'The map is provided by Google. If it does not load, use the link above. See the',
  'Programează-te în mai puțin de un minut.':'Request an appointment in under a minute.','Spune-ne câteva lucruri despre tine. Într-o clinică reală, echipa te-ar contacta pentru confirmarea detaliilor.':'Tell us a little about yourself. In a real clinic, the team would contact you to confirm the details.',
  'De la primul pas.':'From the first step.','Alege ce ți se potrivește. Dacă nu știi încă de ce tratament ai nevoie, începem cu o consultație.':'Choose what suits you. If you are unsure which treatment you need, we begin with a consultation.',
  'Preferințele se confirmă telefonic':'Preferences are confirmed by phone','Ai timp pentru întrebările tale':'Time for your questions','O experiență gândită în jurul tău':'An experience designed around you',
  'Acesta este un formular demonstrativ. Nu creează o programare reală și nu trimite sau salvează datele.':'This is a demonstration form. It does not create a real appointment or send or save data.',
  'Etapele programării':'Appointment request steps','Date de contact':'Contact details','Tratament':'Treatment','Preferințe':'Preferences','Datele tale de contact':'Your contact details','Câmpurile marcate cu * sunt obligatorii.':'Fields marked * are required.',
  'Nume și prenume':'Full name','Cu ce te putem ajuta?':'How can we help?','Medic preferat':'Preferred dentist','Fără preferință':'No preference',
  'Profilurile sunt fictive. Disponibilitatea unui medic nu este garantată prin alegerea sa în formular.':'Profiles are fictional. Selecting a dentist in this form does not guarantee availability.',
  'Preferințele tale':'Your preferences','Zi preferată':'Preferred day','Interval preferat':'Preferred time','Dimineața · 08:00–12:00':'Morning · 08:00–12:00','La prânz · 12:00–16:00':'Midday · 12:00–16:00','După-amiaza · 16:00–20:00':'Afternoon · 16:00–20:00',
  'Mai este ceva ce ai vrea să știm?':'Is there anything else you would like us to know?','Preferințele de zi și oră sunt orientative. Nu reprezintă o rezervare.':'Day and time preferences are indicative and do not constitute a booking.','Înapoi':'Back','Continuă':'Continue',
  'Preferințele tale contează.':'Your preferences matter.','Informații despre funcționarea acestui site demonstrativ.':'Information about how this demonstration website operates.','Ce folosește acest site':'What this website uses',
  'LUMEN Dental nu setează cookie-uri proprii, nu utilizează instrumente de analiză și nu include pixeli de publicitate. Formularele sunt simulate local, fără trimiterea sau stocarea datelor.':'LUMEN Dental does not set first-party cookies, use analytics tools or include advertising pixels. Forms are simulated locally without sending or storing data.',
  'Servicii externe':'External services','Pagina de contact încorporează Google Maps. La încărcarea hărții, browserul comunică direct cu Google, care poate prelucra adresa IP și alte date tehnice și poate utiliza cookie-uri conform politicilor sale.':'The contact page embeds Google Maps. When the map loads, the browser communicates directly with Google, which may process the IP address and other technical data and may use cookies under its own policies.',
  'Linkurile de telefon, WhatsApp, email și Google Maps deschid servicii externe numai când sunt activate. Politicile furnizorilor respectivi se aplică acolo.':'Phone, WhatsApp, email and Google Maps links open external services only when activated. The respective providers’ policies apply there.',
  'Controlul tău':'Your control','Poți bloca modulele externe și cookie-urile din setările browserului. Restul site-ului funcționează și dacă harta nu se încarcă.':'You can block external modules and cookies in your browser settings. The rest of the website works even if the map does not load.',
  'Înainte de lansarea unei clinici reale':'Before launching a real clinic','Acest text descrie exclusiv demonstrația actuală. Adăugarea analiticelor, reclamelor sau a unui sistem de programări necesită actualizarea informării și, unde este cazul, a mecanismului de consimțământ.':'This text describes only the current demonstration. Adding analytics, advertising or an appointment system requires updated information and, where applicable, an appropriate consent mechanism.',
  'Datele tale merită grijă.':'Your data deserves care.','Cum funcționează formularele și datele în această demonstrație.':'How forms and data work in this demonstration.','Un site demonstrativ':'A demonstration website',
  'LUMEN Dental este o clinică fictivă. Numele, adresa, contactele și echipa sunt exemple și nu identifică un operator medical real.':'LUMEN Dental is a fictional clinic. Its name, address, contact details and team are examples and do not identify a real healthcare provider.',
  'Formularele de programare':'Appointment forms','Informațiile introduse sunt folosite exclusiv în browser pentru validarea formularului și afișarea unei confirmări demonstrative. Nu sunt trimise unui server, nu sunt salvate în stocarea browserului și nu creează programări reale. Evită introducerea de informații medicale sau date personale reale în această demonstrație.':'Information entered is used only in the browser to validate the form and display a demonstration confirmation. It is not sent to a server, saved in browser storage or used to create real appointments. Do not enter real medical information or personal data in this demonstration.',
  'Conținut extern':'External content','Google Maps este încorporat în pagina de contact. Furnizorul poate primi date tehnice de la browser. Vezi':'Google Maps is embedded on the contact page. The provider may receive technical data from the browser. See the',
  'pentru detalii. Apelurile, emailurile și mesajele WhatsApp sunt gestionate de serviciile externe, dacă alegi să le deschizi.':'for details. Calls, emails and WhatsApp messages are handled by external services if you choose to open them.',
  'Imagini și rezultate':'Images and results','Portretele și fotografiile sunt generate. Comparațiile înainte și după sunt simulări și nu reprezintă dosare sau rezultate ale unor pacienți.':'Portraits and photographs are generated. Before-and-after comparisons are simulations and do not represent patient records or outcomes.',
  'Publicarea unei versiuni reale':'Publishing a real version','Înainte de utilizarea de către o clinică reală, datele operatorului, scopurile, temeiurile, destinatarii, termenele de păstrare și modalitățile de exercitare a drepturilor trebuie completate potrivit serviciilor implementate.':'Before use by a real clinic, the controller’s details, purposes, legal bases, recipients, retention periods and methods for exercising data rights must be completed according to the services implemented.',
  'JavaScript este dezactivat. Navigarea și informațiile sunt disponibile. Activează JavaScript pentru formulare și comparații interactive.':'JavaScript is disabled. Navigation and information remain available. Enable JavaScript for forms and interactive comparisons.'
};
for (const [ro, en] of Object.entries(staticTranslations)) translations.set(ro, en);

const pageMetadata = {
  'index.html':['LUMEN Dental · Modern dentistry in Hunedoara','Discover the LUMEN Dental concept: modern dentistry in Hunedoara, personal care and digital technology. Demonstration clinic.'],
  'servicii.html':['Dental services in Hunedoara · LUMEN Dental','Dental implants, cosmetic dentistry, orthodontics and comprehensive care. Explore LUMEN Dental’s demonstration services.'],
  'implantologie.html':['Dental implants in Hunedoara · LUMEN Dental','Modern implant dentistry with digital planning and tailored care. Information and demonstration fees.'],
  'estetica-dentara.html':['Cosmetic dentistry in Hunedoara · LUMEN Dental','Tooth whitening and carefully planned aesthetic restorations. Information and demonstration fees.'],
  'ortodontie.html':['Orthodontics in Hunedoara · LUMEN Dental','Orthodontic assessment, braces, monitoring and retention planning. Information and demonstration fees.'],
  'endodontie.html':['Endodontics in Hunedoara · LUMEN Dental','Microscope-assisted root canal treatment and restorative planning. Information and demonstration fees.'],
  'echipa.html':['Team · LUMEN Dental Hunedoara','Meet the five fictional LUMEN Dental team profiles, created to demonstrate thoughtful communication and personal care.'],
  'rezultate.html':['Demonstration results and cases · LUMEN Dental','Explore before-and-after simulations and illustrative treatment scenarios. Demonstration images with no promise of outcome.'],
  'tarife.html':['Demonstration dental fees · LUMEN Dental','Indicative fees for consultations, dental implants, orthodontics and dental treatment. Fictional prices for the LUMEN concept.'],
  'despre-noi.html':['About us · LUMEN Dental Hunedoara','The imagined story of LUMEN Dental: precise dentistry with people at the centre. A demonstration clinic concept.'],
  'contact.html':['Demonstration contact and location · LUMEN Dental','Demonstration contact details and a map near Corvin Castle in Hunedoara. LUMEN Dental is a fictional clinic.'],
  'programare.html':['Request a demonstration appointment · LUMEN Dental','Complete the three-step LUMEN Dental appointment form. A demonstration with no data submission or real booking.'],
  'confidentialitate.html':['Privacy policy · LUMEN Dental','How data is handled on the LUMEN Dental demonstration website. Local forms with no storage or transmission.'],
  'cookies.html':['Cookie policy · LUMEN Dental','Information about cookies and external services on the LUMEN Dental demonstration website.']
};

const preserveSpacing = (source, value) => `${source.match(/^\s*/)?.[0] || ''}${value}${source.match(/\s*$/)?.[0] || ''}`;
const dynamicTranslation = value => {
  if (translations.has(value)) return translations.get(value);
  let translated = value;
  const ordered = [...translations.entries()].sort((a,b) => b[0].length - a[0].length);
  for (const [ro, en] of ordered) if (ro.length > 3 && translated.includes(ro)) translated = translated.replaceAll(ro, en);
  translated = translated
    .replace(/^„/, '“')
    .replace(/\bde la ([\d.]+) lei\b/g, (_, amount) => `from ${amount.replaceAll('.', ',')} RON`)
    .replace(/\b([\d.]+) lei\b/g, (_, amount) => `${amount.replaceAll('.', ',')} RON`)
    .replace(/\b(\d+) cazuri demonstrative\b/g, '$1 demonstration cases')
    .replace(/\b1 caz demonstrativ\b/g, '1 demonstration case')
    .replace(/\b(\d+) servicii\b/g, '$1 services')
    .replace(/(\d+)% înainte, (\d+)% după/g, '$1% before, $2% after')
    .replace(/\bCAZ\b/g, 'CASE')
    .replace(/© (\d{4}) (.+) · Concept demonstrativ/, '© $1 $2 · Demonstration concept');
  return translated;
};

const roPages = (await readdir(root)).filter(name => pageMetadata[name]);
for (const filename of roPages) {
  const window = new Window({settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,disableIframePageLoading:true}});
  window.document.write(await readFile(resolve(root, filename), 'utf8'));
  const {document} = window;
  document.documentElement.lang = 'en';
  document.title = pageMetadata[filename][0];
  document.querySelector('meta[name="description"]').content = pageMetadata[filename][1];
  document.querySelector('meta[property="og:locale"]').content = 'en_GB';
  document.querySelector('meta[property="og:title"]').content = pageMetadata[filename][0];
  document.querySelector('meta[property="og:description"]').content = pageMetadata[filename][1];
  const structured = document.querySelector('script[type="application/ld+json"]');
  if (structured) {
    const data = JSON.parse(structured.textContent);
    data.description = 'Fictional dental clinic — demonstration example, not a real business.';
    structured.textContent = JSON.stringify(data);
  }

  const walker = document.createTreeWalker(document.documentElement, 4);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.matches('script, style')) continue;
    const key = node.textContent.replace(/\s+/g, ' ').trim();
    if (!key) continue;
    const translated = dynamicTranslation(key);
    if (translated !== key) node.textContent = preserveSpacing(node.textContent, translated);
  }
  for (const element of document.querySelectorAll('[title], [alt], [aria-label], [placeholder], [aria-valuetext], [aria-roledescription]')) {
    for (const attr of ['title','alt','aria-label','placeholder','aria-valuetext','aria-roledescription']) {
      const value = element.getAttribute(attr);
      if (value) element.setAttribute(attr, dynamicTranslation(value));
    }
  }

  for (const element of document.querySelectorAll('[href]')) {
    const href = element.getAttribute('href');
    if (!href || /^(#|https?:|tel:|mailto:|data:|javascript:)/.test(href)) continue;
    const match = href.match(/^([^?#]+\.html)(.*)$/);
    if (!match || match[1].endsWith('-en.html')) continue;
    let suffix = match[2];
    for (const [ro, en] of translations) suffix = suffix.replaceAll(encodeURIComponent(ro), encodeURIComponent(en));
    element.setAttribute('href', englishFile(match[1]) + suffix);
  }
  const enFilename = englishFile(filename);
  document.body.dataset.page = enFilename;
  const switcher = document.querySelector('.language-switch');
  if (switcher) {
    switcher.setAttribute('aria-label','Language');
    switcher.innerHTML = `<a href="${filename}" lang="ro" hreflang="ro" aria-label="Switch to Romanian">RO</a><span aria-current="true">EN</span>`;
  }
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = canonical.href.replace(/\.html$/, '-en.html');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = ogUrl.content.replace(/\.html$/, '-en.html');
  document.head.insertAdjacentHTML('beforeend', `<link rel="alternate" hreflang="ro" href="${filename}"><link rel="alternate" hreflang="en" href="${enFilename}">`);
  const casesScript = document.querySelector('script[src="assets/js/cases-data.js"]');
  if (casesScript) casesScript.src = 'assets/js/cases-data-en.js';
  const html = '<!doctype html>\n' + document.documentElement.outerHTML.replace(/\s*<br>\s*/g, ' <br> ');
  await writeFile(resolve(root, enFilename), html);
  await window.happyDOM.close();
}
await writeFile(resolve(root, 'assets/js/cases-data-en.js'), 'window.LUMEN_CASES = ' + JSON.stringify(enCases, null, 2) + ';\n');
console.log(`Generated ${roPages.length} complete English HTML pages.`);
