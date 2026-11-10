export type EquipmentCategory =
  | 'Niezbędny: Plecak i Podstawowe Wyposażenie'
  | 'Niezbędny: Obuwie i Skarpety'
  | 'Niezbędny: Ubranie (System Warstwowy)'
  | 'Higiena'
  | 'Apteczka'
  | 'Nawigacja i Elektronika'
  | 'Dokumenty i Finanse'
  | 'Inne Użyteczne Przedmioty';

export interface ComprehensiveGearItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  weightGrams: number;
  defaultCarryMode: 'backpack' | 'van_or_deposit' | 'worn';
  seasonality: 'Cały rok (Czerwiec–Wrzesień+)' | 'Lato (Czerwiec–Wrzesień)' | 'Jesień / Zima / Góry (Październik–Marzec)';
  specification: string;
  pilgrimRationale: string;
}

export interface SeasonalPhaseStrategy {
  phase: string;
  months: string;
  stagesAndRegions: string;
  temperatureRange: string;
  weatherChallenges: string;
  gearAction: string;
}

export const SEASONAL_STRATEGIES: SeasonalPhaseStrategy[] = [
  {
    phase: 'Faza I: Lato Środkowoeuropejskie',
    months: 'Czerwiec – Sierpień',
    stagesAndRegions: 'Etapy 1–3 (Śląsk, Jura, Małopolska) oraz pierwsza połowa Etapu 4 (Czechy, Bawaria, Szwajcaria)',
    temperatureRange: '+15°C w nocy / +24°C do +33°C w dzień',
    weatherChallenges: 'Gwałtowne burze popołudniowe w czerwcu i lipcu, wysoka ekspozycja słoneczna na Jurze i w dolinie Dunaju, przełęcze alpejskie w Szwajcarii.',
    gearAction: 'Na Etapach 1–3 cięższy ekwipunek jedzie busem parafialnym z Kochłowic. Wyruszając 30 czerwca na Etap 4, redukujemy plecak do wersji letnio-górskiej (max 7,5–8,0 kg bez wody).',
  },
  {
    phase: 'Faza II: Jesień Atlantycka i Pireneje',
    months: 'Wrzesień – Październik',
    stagesAndRegions: 'Druga połowa Etapu 4: Francja (Via Podiensis, Masyw Centralny), Pireneje i Hiszpania (Camino Francés do Santiago)',
    temperatureRange: '+4°C na przełęczach / +14°C do +22°C w dzień',
    weatherChallenges: 'Poranne mgły na płaskowyżu Aubrac, silny wiatr na Mesecie, ulewne deszcze atlantyckie w Galicji.',
    gearAction: 'Konieczna pełna kurtka membranowa (Gore-Tex 20 000 mm) oraz lekka kurtka puchowa / primaloft na chłodne poranki i wieczory w nieogrzewanych albergues.',
  },
  {
    phase: 'Faza III: Zima Śródziemnomorska i Alpy Nadmorskie',
    months: 'Listopad – Luty',
    stagesAndRegions: 'Etap 5A i początek 5B: Północna Hiszpania, Prowansja, Via Francigena (Toskania, Lacjum, Watykan) i Południowe Włochy (Bari)',
    temperatureRange: '-2°C w górach / +6°C do +15°C na nizinach Italii',
    weatherChallenges: 'Krótki dzień (zmrok ok. 17:00), chłodne noce we włoskich klasztorach i ospitali, błoto na gliniastych wzgórzach Toskanii (Crete Senesi).',
    gearAction: 'W Rzymie lub Arles odbieramy przygotowaną wcześniej paczkę depozytową (Poste Restante) z cieplejszą bielizną merino 200 g/m², rękawiczkami, czapką zimową i cieplejszym śpiworem (+2°C komfort).',
  },
  {
    phase: 'Faza IV: Wiosna Lewantyńska i Ziemia Święta',
    months: 'Marzec – Maj',
    stagesAndRegions: 'Etap 5B: Grecja (Via Egnatia), Turcja (Szlak św. Pawła przez Anatolię) oraz Ziemia Święta (Galilea, Judea, Jerozolima)',
    temperatureRange: '+10°C w górach Taurus / +22°C do +35°C w Judei',
    weatherChallenges: 'Duże amplitudy dobowe w Anatolii, suche powietrze, silne promieniowanie UV i kamieniste podłoże w drodze do Jerozolimy.',
    gearAction: 'W Bari lub Salonikach odsyłamy zimowe warstwy do Polski; zakładamy przewiewne koszule z długim rękawem UPF 50+, chustę pustynną (buff) i zwiększamy zapas wody do 2,5–3,0 litrów.',
  },
  {
    phase: 'Faza V: Letni Powrót Kontynentalny',
    months: 'Maj – Wrzesień kolejnego roku',
    stagesAndRegions: 'Etap 6: Grecja, Bułgaria (Riła), Serbia, Węgry (Mária Út), Słowacja i Beskid Śląski → Kochłowice',
    temperatureRange: '+14°C w górach / +25°C do +34°C na Wielkiej Nizinie Węgierskiej',
    weatherChallenges: 'Upalne lato w dolinie Dunaju i Cisy oraz górskie podejścia w Rile, Małej Fatrze i Beskidzie Śląskim.',
    gearAction: 'Nowa para obuwia trekkingowego (wymiana po każdych 1200–1500 km marszu!) oraz ultralekki zestaw letni aż do spotkania z busem parafialnym z Kochłowic na granicy w Koniakowie.',
  },
];

export const COMPREHENSIVE_EQUIPMENT_LIST: ComprehensiveGearItem[] = [
  // ==================== 1. NIEZBĘDNY: PLECAK I PODSTAWOWE WYPOSAŻENIE ====================
  {
    id: 'eq-pack-main',
    name: 'Plecak trekkingowy 36–42 l z wentylowanym systemem nośnym (siatka dystansowa)',
    category: 'Niezbędny: Plecak i Podstawowe Wyposażenie',
    weightGrams: 1150,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Pojemność 36–42 litry, szeroki pas biodrowy przenoszący 70% ciężaru na miednicę, zintegrowany pokrowiec przeciwdeszczowy.',
    pilgrimRationale: 'Przy odcinkach do 30 km dziennie przez wiele miesięcy większy plecak (60 l) skłania do zabierania zbędnych rzeczy. 38–40 l wymusza dyscyplinę wagową poniżej 10% masy ciała.',
  },
  {
    id: 'eq-pack-drybags',
    name: 'Zestaw 4 ultralekkich worków wodoszczelnych (Dry Bags z Cordury/Silnylonu)',
    category: 'Niezbędny: Plecak i Podstawowe Wyposażenie',
    weightGrams: 110,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Worki w różnych kolorach: czerwony (apteczka), niebieski (śpiwór), zielony (odzież czysta), żółty (elektronika).',
    pilgrimRationale: 'Chronią śpiwór i elektronikę podczas wielogodzinnych ulew oraz pozwalają spakować plecak o 5:30 rano bez szeleszczenia reklamówkami.',
  },
  {
    id: 'eq-sleep-bag',
    name: 'Śpiwór puchowy ultralekki (komfort +7°C, waga <600 g) + wkładka jedwabna/mikrofibra',
    category: 'Niezbędny: Plecak i Podstawowe Wyposażenie',
    weightGrams: 640,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Puch gęsi 750–850 cuin + higiena: wkładka prześcieradłowa (110 g) podnosząca termikę o 3°C.',
    pilgrimRationale: 'Latem w Hiszpanii czy Ziemi Świętej wystarcza sama wkładka; jesienią w Masywie Centralnym i zimą we Włoszech śpiwór z wkładką gwarantuje ciepły sen.',
  },
  {
    id: 'eq-sleep-mat',
    name: 'Składana mata piankowa (Z-Lite) lub ultralekki materac dmuchany (R-Value ≥ 2.5)',
    category: 'Niezbędny: Plecak i Podstawowe Wyposażenie',
    weightGrams: 390,
    defaultCarryMode: 'van_or_deposit',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Izolacja od zimnej posadzki w salkach parafialnych, szkołach i klasztorach.',
    pilgrimRationale: 'Obowiązkowa na Etapach 1–3 (Świerklaniec, Woźniki, Poczesna, Spytkowice) oraz na szlaku węgierskim i bałkańskim.',
  },
  {
    id: 'eq-poles',
    name: 'Składane kije trekkingowe (3-segmentowe karbonowo-aluminiowe) + gumowe buciki na asfalt',
    category: 'Niezbędny: Plecak i Podstawowe Wyposażenie',
    weightGrams: 440,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Rękojeść z naturalnego korka (nie obciera spoconych dłoni w czerwcu i lipcu), zewnętrzne blokady dźwigniowe.',
    pilgrimRationale: 'Przy dystansie ~11 947 km kije przejmują setki ton skumulowanego obciążenia ze stawów kolanowych i skokowych.',
  },
  {
    id: 'eq-hydration',
    name: '2 butelki szerokoootworowe (2 × 0,75 l) lub bukłak 2,0 l + kubek stalowy 350 ml i spork',
    category: 'Niezbędny: Plecak i Podstawowe Wyposażenie',
    weightGrams: 270,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Jedna butelka na czystą wodę (również do przemywania ran), druga na roztwór izotoniczny/elektrolity.',
    pilgrimRationale: 'Na odcinkach w Hiszpanii (Meseta), Turcji i Judei odległość między ujęciami wody dochodzi do 15–18 km.',
  },

  // ==================== 2. NIEZBĘDNY: OBUWIE I SKARPETY ====================
  {
    id: 'eq-shoes-main',
    name: 'Buty główne: Lekkie buty trailowe (Trail Runners) lub niskie buty podejściowe z szerokim przodem (Wide Toe Box)',
    category: 'Niezbędny: Obuwie i Skarpety',
    weightGrams: 740,
    defaultCarryMode: 'worn',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Podeszwa Vibram z dobrą amortyzacją na asfalt i szuter, bez sztywnej membrany na lato (szybko schnące), o 1,0–1,5 rozmiaru większe.',
    pilgrimRationale: 'Ponad 60% europejskich szlaków pątniczych to utwardzone drogi, bruk i szuter. Uwaga: na całej trasie do Jerozolimy i z powrotem konieczna jest planowa wymiana obuwia co ok. 1300 km (np. w Le Puy, Rzymie, Antalyi i Budapeszcie).',
  },
  {
    id: 'eq-shoes-sandals',
    name: 'Sandały trekkingowe z trójfazowym zapięciem i profilowaną podeszwą',
    category: 'Niezbędny: Obuwie i Skarpety',
    weightGrams: 450,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Możliwość marszu w skarpetach w razie otarć pięty oraz obuwie pod prysznic i po zakończeniu etapu.',
    pilgrimRationale: 'Natychmiast po dojściu na nocleg zdjęte buty główne pozwalają stopom odparować wilgoć; w razie pęcherzy w sandałach można przejść cały 25-kilometrowy odcinek.',
  },
  {
    id: 'eq-socks-system',
    name: '3 pary skarpet z wełny Merino (60–70% merino) + 2 pary cienkich skarpet wewnętrznych (Liner z Coolmaxu)',
    category: 'Niezbędny: Obuwie i Skarpety',
    weightGrams: 240,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'System dwuwarstwowy (Liner + Merino): tarcie zachodzi między dwiema warstwami skarpet, a nie między skarpetą a skórą.',
    pilgrimRationale: 'Najskuteczniejsza metoda prewencji pęcherzy podczas wielomiesięcznego marszu dzień po dniu.',
  },

  // ==================== 3. NIEZBĘDNY: UBRANIE (SYSTEM WARSTWOWY) ====================
  {
    id: 'eq-cloth-shirts',
    name: '2 koszulki z wełny Merino 150 g/m² + 1 koszula trekkingowa z długim rękawem i filtrem UPF 50+',
    category: 'Niezbędny: Ubranie (System Warstwowy)',
    weightGrams: 460,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Wełna merynosów nie chłonie zapachów przez wiele dni i grzeje nawet po zamoczeniu; koszula z kołnierzem chroni kark i przedramiona przed słońcem oraz umożliwia wejście do bazylik w Watykanie i Jerozolimie.',
    pilgrimRationale: 'W świątyniach we Włoszech i Ziemi Świętej obowiązuje zakaz wejścia z odkrytymi ramionami.',
  },
  {
    id: 'eq-cloth-pants',
    name: '2 pary spodni trekkingowych z odpinanymi nogawkami (Zip-Off) z szybkoschnącego nylonu z elastanem',
    category: 'Niezbędny: Ubranie (System Warstwowy)',
    weightGrams: 620,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Rano przy +10°C marsz w długich spodniach, w południe odpięcie nogawek bez zdejmowania butów; wieczorem dopięcie nogawek do wejścia do kościoła.',
    pilgrimRationale: 'Zastępują cztery osobne sztuki odzieży przy minimalnej wadze.',
  },
  {
    id: 'eq-cloth-midlayer',
    name: 'Bluza z mikropolaru (Grid Fleece) + ultralekka kurtka puchowa / syntetyczna (ok. 280 g)',
    category: 'Niezbędny: Ubranie (System Warstwowy)',
    weightGrams: 560,
    defaultCarryMode: 'backpack',
    seasonality: 'Jesień / Zima / Góry (Październik–Marzec)',
    specification: 'Kurtka docieplająca kompresowana do własnej kieszeni (służy także jako poduszka pod głowę w nocy).',
    pilgrimRationale: 'Niezbędna w Alpach Szwajcarskich, Pirenejach, zimowej Toskanii oraz na chłodnych wyżynach Anatolii.',
  },
  {
    id: 'eq-cloth-rain',
    name: 'Kurtka membranowa Hardshell (2.5L lub 3L) + peleryna przeciwdeszczowa (Poncho z garbem na plecak)',
    category: 'Niezbędny: Ubranie (System Warstwowy)',
    weightGrams: 540,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Peleryna zapewnia doskonałą wentylację podczas ciepłych czerwcowych ulew w Polsce; kurtka z kapturem chroni przed wiatrem na graniach górskich.',
    pilgrimRationale: 'Połączenie lekkiej wiatrówki/membrany z poncho daje 100% ochrony w każdym klimacie.',
  },
  {
    id: 'eq-cloth-underwear-head',
    name: '3 komplety bielizny bezszwowej merino/syntetyk, kapelusz z szerokim rondem, chusta wielofunkcyjna Buff i lekkie rękawiczki',
    category: 'Niezbędny: Ubranie (System Warstwowy)',
    weightGrams: 310,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Bielizna typu bokserki bez grubych szwów w pachwinach (ochrona przed odparzeniami).',
    pilgrimRationale: 'Kapelusz i chusta Buff nawilżona wodą ratują przed przegrzaniem na odkrytych odcinkach Etapów 2, 4, 5 i 6.',
  },

  // ==================== 4. HIGIENA ====================
  {
    id: 'eq-hyg-soap',
    name: 'Kostka mydła aleppo / marsylskiego (100 g w puszce z ociekaczem) lub biodegradowalny płyn 3w1',
    category: 'Higiena',
    weightGrams: 135,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Jedno naturalne mydło z oliwy z oliwek służy do mycia ciała, włosów oraz codziennego ręcznego prania skarpet i koszulki.',
    pilgrimRationale: 'Codzienny rytuał pątnika po etapie: prysznic i natychmiastowe wypranie zestawu marszowego z danego dnia.',
  },
  {
    id: 'eq-hyg-towel-brush',
    name: 'Ręcznik szybkoschnący z mikrofibry (rozmiar M/L z pętelką), składana szczoteczka, pasta, obcinacz do paznokci',
    category: 'Higiena',
    weightGrams: 210,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Obcinacz do paznokci z pilnikiem — paznokcie u stóp muszą być zawsze krótko i prosto przycięte przed zejściami z gór.',
    pilgrimRationale: 'Zbyt długi paznokieć na 25-kilometrowym zejściu z Pirenejów lub Apeninów kończy się zejściem płytki paznokciowej.',
  },
  {
    id: 'eq-hyg-sun-care',
    name: 'Krem z filtrem UV SPF 50+, pomadka ochronna z filtrem oraz chusteczki biodegradowalne',
    category: 'Higiena',
    weightGrams: 165,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Wysoka ochrona UVA/UVB uzupełniana w aptekach po drodze.',
    pilgrimRationale: 'Wielogodzinny marsz w kierunku południowym i zachodnim naraża twarz, uszy, kark i łydki na silne poparzenia słoneczne.',
  },

  // ==================== 5. APTECZKA ====================
  {
    id: 'eq-med-blisters',
    name: 'Zestaw przeciw pęcherzom: maść z jelenim łojem (Hirschtalg) / Sudocrem / wazelina, plastry Compeed, taśma kinezjologiczna / Leukoplast, jałowe igły i nici bawełniane',
    category: 'Apteczka',
    weightGrams: 230,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Smarowanie stóp grubą warstwą maści z jelenim łojem lub lanoliną rano przed założeniem skarpet; zaklejanie miejsc wrażliwych taśmą zanim pojawi się pęcherz.',
    pilgrimRationale: 'Fundament przetrwania pieszej pielgrzymki — pęcherze to główna przyczyna rezygnacji w pierwszym tygodniu marszu.',
  },
  {
    id: 'eq-med-drugs',
    name: 'Leki osobiste na stałe + leki przeciwzapalne/przeciwbólowe (Ibuprofen/Paracetamol), żel z diklofenakiem na ścięgna Achillesa',
    category: 'Apteczka',
    weightGrams: 190,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Na Etapach 1–3 leki stałe bezwzględnie w plecaku podręcznym (nigdy w busie bagażowym!). Na Etapach 4–6 zaświadczenie lekarskie po angielsku na leki recepturowe.',
    pilgrimRationale: 'Przeciążenia ścięgna Achillesa i rozcięgna podeszwowego wymagają szybkiej reakcji chłodzącej i przeciwzapalnej.',
  },
  {
    id: 'eq-med-electrolytes-gi',
    name: 'Elektrolity z magnezem i potasem, leki żołądkowo-jelitowe (Loperamid, probiotyk, węgiel), środek odkażający (Octenisept 50 ml), bandaż kohezyjny',
    category: 'Apteczka',
    weightGrams: 240,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Saszetki nawadniające ORS rozpuszczane w bidonie podczas upałów.',
    pilgrimRationale: 'Zmiana flory bakteryjnej wody i pożywienia między Europą Środkową, południem Włoch, Turcją a Bliskim Wschodem wymaga osłony probiotycznej.',
  },

  // ==================== 6. NAWIGACJA I ELEKTRONIKA ====================
  {
    id: 'eq-nav-phone-maps',
    name: 'Smartfon z mapami offline (Mapy.cz, Buen Camino, Via Francigena App, ślady GPX wszystkich 6 etapów)',
    category: 'Nawigacja i Elektronika',
    weightGrams: 210,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Pobrane wektorowe mapy offline wszystkich 12 krajów na trasie (działają w trybie samolotowym bez zużycia baterii).',
    pilgrimRationale: 'Mapy.cz pokazują każde leśne źródło wody, kapliczkę, profil wysokościowy i szlaki piesze w całej Europie i Lewancie.',
  },
  {
    id: 'eq-nav-power',
    name: 'Powerbank 10 000 mAh (z szybkim ładowaniem PD), ładowarka ścienna GaN z 2–3 portami USB-C i krótki przewód',
    category: 'Nawigacja i Elektronika',
    weightGrams: 295,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Ładowarka wieloportowa pozwala naładować telefon i powerbank z jednego gniazdka (w albergues i salkach parafialnych liczba gniazdek jest ograniczona).',
    pilgrimRationale: 'Zabezpiecza łączność i nawigację na 3–4 dni bez dostępu do sieci elektrycznej.',
  },
  {
    id: 'eq-nav-headlamp',
    name: 'Latarka czołowa LED (ładowana przez USB-C) z trybem czerwonego światła + mały kompas i gwizdek ratunkowy',
    category: 'Nawigacja i Elektronika',
    weightGrams: 75,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Tryb czerwonej diody nie oślepia śpiących współbraci podczas porannego pakowania o godz. 5:30.',
    pilgrimRationale: 'Niezbędna przy porannych wyjściach przed świtem dla uniknięcia południowych upałów.',
  },

  // ==================== 7. DOKUMENTY I FINANSE ====================
  {
    id: 'eq-doc-credentials',
    name: 'Paszport Pielgrzyma (Credencial del Peregrino + Credenziale Via Francigena) oraz list polecający z parafii Trójcy Świętej w Kochłowicach',
    category: 'Dokumenty i Finanse',
    weightGrams: 95,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Zapasowe książeczki na pieczęcie (przy 455 dniach trasy pątnik zapełni ok. 6–8 paszportów pielgrzymkowych!).',
    pilgrimRationale: 'Upoważnia do noclegów w schroniskach pątniczych, klasztorach oraz do odbioru Composteli w Santiago, Testimonium w Watykanie i certyfikatu Kustodii w Jerozolimie.',
  },
  {
    id: 'eq-doc-passport-insurance',
    name: 'Paszport biometryczny (ważny min. 12 miesięcy po planowanym powrocie) + Dowód Osobisty, karta EKUZ i całoroczne ubezpieczenie KL/NNW/OC obejmujące świat',
    category: 'Dokumenty i Finanse',
    weightGrams: 70,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Paszport jest bezwzględnie wymagany przy przekraczaniu granic Turcji, Izraela/Ziemi Świętej i Serbii; skany dokumentów zapisane dodatkowo w chmurze i pamięci telefonu.',
    pilgrimRationale: 'Standardowa karta EKUZ działa w UE i Szwajcarii, natomiast w Turcji, Serbii i Ziemi Świętej konieczna jest polisa komercyjna z wysoką sumą gwarantowaną.',
  },
  {
    id: 'eq-doc-money',
    name: '2 niezależne karty wielowalutowe (np. Visa + Mastercard) + rezerwa gotówki w PLN, EUR i USD (w drobnym bilonie/banknotach na donativo)',
    category: 'Dokumenty i Finanse',
    weightGrams: 55,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Jedna karta i główna gotówka w ukrytej saszetce pod ubraniem (Money Belt), drobne na bieżący dzień w kieszeni.',
    pilgrimRationale: 'Większość parafii, klasztorów i schronisk typu „donativo” (dobrowolna ofiara) przyjmuje wyłącznie gotówkę.',
  },

  // ==================== 8. INNE UŻYTECZNE PRZEDMIOTY ====================
  {
    id: 'eq-misc-laundry',
    name: '5 metrów cienkiej linki spadochronowej (Paracord) + 8 agrafek pątniczych i korek uniwersalny do umywalki',
    category: 'Inne Użyteczne Przedmioty',
    weightGrams: 65,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Agrafki służą do przypinania wilgotnych skarpet do zewnętrznych troków plecaka, aby doschły w słońcu podczas marszu.',
    pilgrimRationale: 'W wielu starszych schroniskach brakuje korków w umywalkach do zrobienia prania oraz sznurków na pranie.',
  },
  {
    id: 'eq-misc-sleep-comfort',
    name: 'Woskowe zatyczki do uszu (3 pary) + opaska zaciemniająca na oczy',
    category: 'Inne Użyteczne Przedmioty',
    weightGrams: 35,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Miękkie zatyczki dopasowujące się do kształtu kanału słuchowego.',
    pilgrimRationale: 'W salach zbiorowych na 20–40 osób głęboki sen decyduje o regeneracji mięśni na kolejny dzień marszu.',
  },
  {
    id: 'eq-misc-repair-shell',
    name: 'Mały scyzoryk (ostrzem do chleba i sera, nożyczkami i pęsetą), 1,5 m taśmy naprawczej Duct Tape nawiniętej na kijek trekkingowy oraz Muszla św. Jakuba i Krzyż Jerozolimski',
    category: 'Inne Użyteczne Przedmioty',
    weightGrams: 115,
    defaultCarryMode: 'backpack',
    seasonality: 'Cały rok (Czerwiec–Wrzesień+)',
    specification: 'Muszla św. Jakuba przytroczona do plecaka od startu w Kochłowicach jako widoczny znak pielgrzyma.',
    pilgrimRationale: 'Ułatwia życzliwy kontakt z mieszkańcami na całej trasie od Górnego Śląska przez Europę aż po Ziemię Świętą.',
  },
];
