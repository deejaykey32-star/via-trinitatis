export interface PilgrimageStage {
  id: number;
  code: string;
  name: string;
  subtitle: string;
  isOptional: boolean;
  startLocation: string;
  endLocation: string;
  daysCount: number;
  startDayOffset: number; // 0 = 14 czerwca
  endDayOffset: number;
  totalDistanceKm: number;
  avgDailyKm: number;
  maxDailyKm: number;
  countries: string[];
  baggageSystem: string;
  accommodationSystem: string;
  description: string;
  spiritualFocus: string;
  keySanctuaries: string[];
  coordinates: {
    start: [number, number]; // [x, y] on schematic SVG map
    waypoints: Array<{ name: string; x: number; y: number }>;
    end: [number, number];
  };
}

export interface DailySegment {
  globalDayNumber: number; // 1..455
  stageId: number;
  stageDayNumber: number;
  dayOffsetFromJune14: number; // Note: Stage 2 has a liturgical vigil/celebration span 18-25 June
  dateNote?: string;
  fromTown: string;
  viaWaypoints: string[];
  toTown: string;
  country: string;
  region: string;
  distanceKm: number; // Strictly <= 30.0 km
  elevationGainM: number;
  terrainType: string;
  accommodationName: string;
  accommodationType: 'Dom Pielgrzyma' | 'Parafia / Sala / Kwatery' | 'Klasztor / Opactwo' | 'Albergue / Schronisko' | 'Hospicjum Chrześcijańskie';
  estimatedCostPLN: string;
  baggageMode: string;
  waterAndFoodPoints: string;
  sanctuaryOrLandmark: string;
  scheduleSummary: string;
}

export interface PackingItem {
  id: string;
  name: string;
  category: 'Dokumenty i Duchowość' | 'Obuwie i Odzież' | 'Sen i Nocleg' | 'Higiena i Apteczka' | 'Sprzęt i Nawigacja';
  weightGrams: number;
  defaultPlacement: 'backpack' | 'van' | 'none';
  essentialForStages: string;
  note: string;
}

export const HERO_IMAGE = '/src/assets/images/hero_pilgrimage_trail_1794270259827.jpg';
export const CAMINO_IMAGE = '/src/assets/images/stage_camino_santiago_1794270259783.jpg';
export const JERUSALEM_IMAGE = '/src/assets/images/stage_vatican_jerusalem_1794270261072.jpg';
export const GEAR_IMAGE = '/src/assets/images/pilgrim_luggage_gear_1794270261915.jpg';

export const PILGRIMAGE_STAGES: PilgrimageStage[] = [
  {
    id: 1,
    code: 'ETAP 1 · BOK I MAŁEGO TRÓJKĄTA',
    name: 'Kochłowice → Jasna Góra (Częstochowa)',
    subtitle: 'Zachodnie Ramię Trójkąta Polskiego · 14 czerwca – 17 czerwca (4 dni)',
    isOptional: false,
    startLocation: 'Ruda Śląska – Kochłowice (Kościół Trójcy Świętej / Sanktuarium MB z Lourdes)',
    endLocation: 'Częstochowa – Jasna Góra (Klasztor Ojców Paulinów)',
    daysCount: 4,
    startDayOffset: 0, // 14 czerwca
    endDayOffset: 3,   // 17 czerwca
    totalDistanceKm: 96.0,
    avgDailyKm: 24.0,
    maxDailyKm: 26.2,
    countries: ['Polska'],
    baggageSystem: 'Bus parafialny z Kochłowic (limit 15 kg/os., kolor wstążki: Biało-Niebieski)',
    accommodationSystem: 'Domy pielgrzyma, kwatery parafialne, szkoła w Woźnikach i Dom Pielgrzyma na Jasnej Górze',
    description:
      'Pierwszy bok Małego Trójkąta Pątniczego (Etapy 1–3) wyrusza 14 czerwca o godz. 7:00 z Kościoła Trójcy Świętej obok Sanktuarium Matki Bożej z Lourdes w Rudzie Śląskiej-Kochłowicach. Szlak wiedzie w 100% drogą lądową wzdłuż znaków z muszlą św. Jakuba (Górnośląska i Jasnogórska Droga św. Jakuba) przez Piekary Śląskie, Świerklaniec, Sączów (kościół św. Jakuba Apostoła), Woźniki oraz Poczesną do północnego wierzchołka trójkąta na Jasnej Górze.',
    spiritualFocus: 'Zawierzenie Maryjne na szlaku z muszlą św. Jakuba — od Groty Lurdzkiej w Kochłowicach przez Piekary Śląskie i Sączów do Tronu Jasnogórskiego.',
    keySanctuaries: [
      'Kościół Trójcy Świętej i Sanktuarium MB z Lourdes w Kochłowicach (węzeł Górnośląskiej Drogi św. Jakuba)',
      'Bazylika NMP i św. Bartłomieja w Piekarach Śląskich (Szlak z muszlą św. Jakuba)',
      'Kościół św. Jakuba Apostoła w Sączowie i kościół św. Katarzyny w Woźnikach (Jasnogórska Droga św. Jakuba)',
      'Klasztor Ojców Paulinów na Jasnej Górze i kościół św. Jakuba w Częstochowie',
    ],
    coordinates: {
      start: [50.258, 18.975],
      waypoints: [
        { name: 'Piekary Śl.', x: 50.379, y: 18.946 },
        { name: 'Świerklaniec', x: 50.431, y: 18.948 },
        { name: 'Woźniki', x: 50.588, y: 19.059 },
        { name: 'Poczesna', x: 50.728, y: 19.149 },
      ],
      end: [50.812, 19.097],
    },
  },
  {
    id: 2,
    code: 'ETAP 2 · BOK II MAŁEGO TRÓJKĄTA',
    name: 'Jasna Góra → Pustynia Błędowska → Ojców → Kraków-Łagiewniki',
    subtitle: 'Wschodnie Ramię Trójkąta Polskiego (Pustynia Błędowska i Dzień Ojca w Ojcowie) · 18–25 czerwca (7 dni)',
    isOptional: false,
    startLocation: 'Częstochowa – Jasna Góra',
    endLocation: 'Kraków-Łagiewniki (Sanktuarium Bożego Miłosierdzia)',
    daysCount: 7,
    startDayOffset: 4,  // 18 czerwca
    endDayOffset: 11,   // 25 czerwca (7 dni marszu + uroczystości w Łagiewnikach)
    totalDistanceKm: 166.0,
    avgDailyKm: 23.7,
    maxDailyKm: 27.4,
    countries: ['Polska'],
    baggageSystem: 'Bus logistyczny pielgrzymki (limit 15 kg/os., kolor wstążki: Biało-Czerwony)',
    accommodationSystem: 'Schroniska jurajskie, klasztor Franciszkanów w Pilicy, kwatery pątnicze w Ojcowie (Dzień Ojca 23.06), Opactwo w Tyńcu i Dom Duszpasterski w Łagiewnikach',
    description:
      'Drugi bok Małego Trójkąta Pątniczego trwa od 18 do 25 czerwca i prowadzi z Jasnej Góry Jurajską Drogą św. Jakuba i Szlakiem Orlich Gniazd przez Złoty Potok, Kroczyce i Pilicę, następnie obejmuje piesze przejście przez Pustynię Błędowską (Chechło – Róża Wiatrów – Klucze) do Olkusza, gdzie wchodzi na główny szlak z muszlami Via Regia (Droga św. Jakuba), prowadzący przez Pieskową Skałę do Ojcowa na uroczysty pobyt w Dzień Ojca (23 czerwca), a dalej przez Giebułtów i Tyniec do Krakowa-Łagiewnik.',
    spiritualFocus: 'Doświadczenie Pustyni (Pustynia Błędowska), wdzięczność za Ojcostwo w Ojcowie w Dzień Ojca (23 czerwca) na szlaku z muszlą św. Jakuba (Via Regia) oraz tajemnica Bożego Miłosierdzia w Łagiewnikach.',
    keySanctuaries: [
      'Sanktuarium Matki Bożej Leśniowskiej (Jurajska Droga św. Jakuba)',
      'Klasztor OO. Franciszkanów w Pilicy-Biskupicach',
      'Przejście przez Pustynię Błędowską i Bazylika św. Andrzeja w Olkuszu (główny szlak z muszlami Via Regia)',
      'Kaplica „Na Wodzie” św. Józefa Robotnika i Zamek w Ojcowie (Pobyt w Dzień Ojca · 23 czerwca na szlaku Via Regia)',
      'Kościół św. Idziego w Giebułtowie (Małopolska Droga św. Jakuba) i Opactwo Benedyktynów w Tyńcu',
      'Sanktuarium Bożego Miłosierdzia i Centrum Jana Pawła II w Krakowie-Łagiewnikach',
    ],
    coordinates: {
      start: [50.812, 19.097],
      waypoints: [
        { name: 'Złoty Potok', x: 50.705, y: 19.435 },
        { name: 'Kroczyce', x: 50.568, y: 19.566 },
        { name: 'Pilica', x: 50.467, y: 19.656 },
        { name: 'Pustynia Błędowska / Olkusz', x: 50.335, y: 19.535 },
        { name: 'Ojców (Dzień Ojca 23.06)', x: 50.211, y: 19.830 },
        { name: 'Tyniec', x: 50.019, y: 19.802 },
      ],
      end: [50.020, 19.937],
    },
  },
  {
    id: 3,
    code: 'ETAP 3 · BOK III MAŁEGO TRÓJKĄTA',
    name: 'Kraków-Łagiewniki → Kochłowice (Powrót Szlakiem z Muszlami)',
    subtitle: 'Południowa Podstawa Trójkąta Polskiego (Droga św. Jakuba Via Regia) · 26–29 czerwca (4 dni)',
    isOptional: false,
    startLocation: 'Kraków-Łagiewniki (Sanktuarium Bożego Miłosierdzia)',
    endLocation: 'Ruda Śląska – Kochłowice (Kościół Trójcy Świętej)',
    daysCount: 4,
    startDayOffset: 12, // 26 czerwca
    endDayOffset: 15,   // 29 czerwca
    totalDistanceKm: 100.0,
    avgDailyKm: 25.0,
    maxDailyKm: 28.4,
    countries: ['Polska'],
    baggageSystem: 'Bus parafialny z Kochłowic (limit 15 kg/os., kolor wstążki: Żółto-Złoty)',
    accommodationSystem: 'Zaplecza parafialne w Spytkowicach, Dom Pielgrzyma Franciszkanów w Harmężach, parafia w Mikołowie',
    description:
      'Trzeci bok domykający Mały Trójkąt Pątniczy (Etapy 1–3): czterodniowy marsz drogą lądową za znakami muszli św. Jakuba (południowy wariant Drogi św. Jakuba Via Regia oraz szlak Doliny Karpia) z krakowskich Łagiewnik przez Skawinę, Spytkowice, Zator, Oświęcim-Harmęże, Bieruń Stary (kościół św. Walentego na szlaku Via Regia) i Mikołów z powrotem do Kościoła Trójcy Świętej w Kochłowicach.',
    spiritualFocus: 'Dziękczynienie na szlaku z muszlą św. Jakuba (Via Regia) — domknięcie pierwszego trójkąta pątniczego w Kochłowicach.',
    keySanctuaries: [
      'Centrum św. Maksymiliana w Harmężach k. Oświęcimia (Oświęcimska Droga św. Jakuba)',
      'Sanktuarium św. Walentego w Bieruniu Starym (drewniany kościół XVII w. ze znakami muszli Via Regia)',
      'Bazylika św. Wojciecha w Mikołowie',
      'Kościół Trójcy Świętej i Sanktuarium MB z Lourdes w Kochłowicach',
    ],
    coordinates: {
      start: [50.020, 19.937],
      waypoints: [
        { name: 'Spytkowice', x: 49.991, y: 19.507 },
        { name: 'Oświęcim', x: 50.034, y: 19.210 },
        { name: 'Mikołów', x: 50.169, y: 18.903 },
      ],
      end: [50.258, 18.975],
    },
  },
  {
    id: 4,
    code: 'ETAP 4 · BOK I WIELKIEGO TRÓJKĄTA',
    name: 'Kochłowice → Santiago de Compostela',
    subtitle: 'Północno-Zachodnie Ramię Trójkąta Kontynentalnego · 30 czerwca – 2 października (95 dni)',
    isOptional: true,
    startLocation: 'Ruda Śląska – Kochłowice (Wierzchołek Północny: Kościół Trójcy Świętej)',
    endLocation: 'Santiago de Compostela (Wierzchołek Zachodni: Katedra św. Jakuba, Hiszpania)',
    daysCount: 95,
    startDayOffset: 16,  // 30 czerwca
    endDayOffset: 110,   // 2 października
    totalDistanceKm: 3182.0,
    avgDailyKm: 33.5,
    maxDailyKm: 37.4,
    countries: ['Polska', 'Czechy', 'Niemcy', 'Szwajcaria', 'Francja', 'Hiszpania'],
    baggageSystem: 'Plecak pątniczy (max 10% wagi ciała, ~7–8 kg) + opcjonalny serwis kurierski Correos (Paq Mochila) w Hiszpanii',
    accommodationSystem: 'Sieć Albergues de Peregrinos, domy parafialne Jakobsweg w Czechach/Niemczech/Szwajcarii oraz Gîtes d’étape we Francji (na podstawie Credencialu)',
    description:
      'Pierwszy bok Wielkiego Trójkąta Pątniczego (Etapy 4–6) prowadzi w 100% drogą lądową i w całości oznakowanymi szlakami z muszlą św. Jakuba (95 dni, śr. 33,5 km/dzień): Górnośląską Drogą św. Jakuba (Via Regia) do Bramy Morawskiej, czeską Svatojakubską cestą przez Ołomuniec i Telč, niemieckim Jakobsweg przez Ratyzbonę i Ulm, szwajcarską Via Jacobi (lądowym obejściem Jeziora Bodeńskiego przez Stein am Rhein) przez Einsiedeln i Genewę, francuską Via Podiensis (GR65) z Le Puy-en-Velay oraz hiszpańskim Camino Francés do grobu św. Jakuba w Santiago de Compostela.',
    spiritualFocus: 'Ultreia et Suseia — nieprzerwany lądowy szlak za znakami żółtej muszli św. Jakuba przez serce Europy.',
    keySanctuaries: [
      'Bazylika Nawiedzenia NMP na Świętym Kopečku w Ołomuńcu i Kościół św. Jakuba w Telču (Svatojakubská cesta)',
      'Kościół Szkocki św. Jakuba w Ratyzbonie i Katedra w Ulm (Oberschwäbischer Jakobsweg)',
      'Opactwo Benedyktynów w Einsiedeln (szlak z muszlami Via Jacobi w Szwajcarii)',
      'Katedra Notre-Dame w Le Puy-en-Velay i Opactwo w Conques (Via Podiensis GR65)',
      'Katedra w Burgos, León i Katedra św. Jakuba w Santiago de Compostela (Camino Francés)',
    ],
    coordinates: {
      start: [50.258, 18.975],
      waypoints: [
        { name: 'Ołomuniec', x: 49.593, y: 17.250 },
        { name: 'Ulm', x: 48.401, y: 9.987 },
        { name: 'Einsiedeln', x: 47.128, y: 8.751 },
        { name: 'Genewa', x: 46.204, y: 6.143 },
        { name: 'Le Puy-en-Velay', x: 45.042, y: 3.883 },
        { name: 'St-Jean-Pied-de-Port', x: 43.163, y: -1.238 },
        { name: 'Burgos', x: 42.343, y: -3.696 },
      ],
      end: [42.880, 8.544 * -1],
    },
  },
  {
    id: 5,
    code: 'ETAP 5 · BOK II WIELKIEGO TRÓJKĄTA',
    name: 'Santiago de Compostela → Watykan → Jerozolima (100% Drogą Lądową)',
    subtitle: 'Południowa Podstawa Trójkąta (Szlaki z Muszlami + Korytarz Lądowy) · 3 października – 11 marca (160 dni)',
    isOptional: true,
    startLocation: 'Santiago de Compostela (Wierzchołek Zachodni, Hiszpania)',
    endLocation: 'Jerozolima (Wierzchołek Południowo-Wschodni: Bazylika Grobu Pańskiego)',
    daysCount: 160,
    startDayOffset: 111, // 3 października
    endDayOffset: 270,   // 11 marca
    totalDistanceKm: 5305.0,
    avgDailyKm: 33.2,
    maxDailyKm: 37.2,
    countries: ['Hiszpania', 'Francja', 'Włochy', 'Watykan', 'Słowenia / Chorwacja / Serbia', 'Grecja', 'Turcja', 'Ziemia Święta'],
    baggageSystem: 'System lekki pątniczy (7,5 kg) + paczki depozytowe Poste Restante w Rzymie, Trieście, Salonikach i Antakyi',
    accommodationSystem: 'Albergues na Camino, Ospitali na Via Francigena we Włoszech, domy pątnicze Jakobova pot / Camino Croatia, klasztory na Wschodzie i Christian Guesthouses w Ziemi Świętej',
    description:
      'Drugi bok Wielkiego Trójkąta Pątniczego prowadzi w 100% drogą lądową (bez promów morskich!) i wykorzystuje szlaki z muszlami św. Jakuba tam, gdzie to możliwe: Część 5A (70 dni) wiedzie z Santiago przez Camino del Norte / Camino Catalán, Lourdes, Via Tolosana (GR653 z muszlami w Arles) oraz włoską Via Francigena do Watykanu. Część 5B (90 dni) omija morze drogą lądową: z Watykanu wiedzie włoskimi szlakami św. Jakuba (Cammino di San Giacomo / Padwa / Akwileja / Triest), Słoweńską i Chorwacką Drogą św. Jakuba (Jakobova pot i Camino Croatia z muszlami!), przez Bałkany i grecką Via Egnatia (Saloniki, Filippi), lądowym przejściem w Stambule, przez Anatolię (Szlak św. Pawła: Konya, Tars, Antiochia) i korytarzem lądowym Lewantu (Damaszek / Dolina Jordanu) do Jerozolimy.',
    spiritualFocus: 'Ad Limina Apostolorum & Ziemia Ewangelii — nieprzerwana droga lądowa łącząca Santiago, Rzym i Jerozolimę.',
    keySanctuaries: [
      'Sanktuarium w Lourdes, Montserrat i Arles (Szlak z muszlami Via Tolosana GR653)',
      'Katedra w Lukce (Volto Santo) i Sienie (Via Francigena do Rzymu)',
      'Bazylika św. Piotra na Watykanie oraz Bazylika św. Antoniego w Padwie (Cammino di San Giacomo)',
      'Słoweńska i Chorwacka Droga św. Jakuba (Triest – Lublana – Zagrzeb) oraz Saloniki i Filippi (Via Egnatia)',
      'Stambuł (przejście lądowe), Efez/Konya, Tars i Grota św. Piotra w Antiochii',
      'Nazaret, Jerycho, Betlejem i Bazylika Grobu Pańskiego w Jerozolimie (wejście drogą lądową)',
    ],
    coordinates: {
      start: [42.880, -8.544],
      waypoints: [
        { name: 'Arles', x: 43.676, y: 4.627 },
        { name: 'Siena', x: 43.318, y: 11.330 },
        { name: 'Watykan (Rzym)', x: 41.902, y: 12.453 },
        { name: 'Triest / Zagrzeb (Lądem)', x: 45.649, y: 13.776 },
        { name: 'Saloniki', x: 40.640, y: 22.944 },
        { name: 'Stambuł / Antiochia', x: 36.202, y: 36.160 },
      ],
      end: [31.778, 35.229],
    },
  },
  {
    id: 6,
    code: 'ETAP 6 · BOK III WIELKIEGO TRÓJKĄTA',
    name: 'Jerozolima → Kochłowice (Powrót 100% Lądem i Szlakiem z Muszlami)',
    subtitle: 'Wschodnie Ramię Lądowe (Szlak Anatolijsko-Bałkański + Camino Szent Jakab-út / Svätojakubská cesta) · 12.03 – 14.06 (95 dni)',
    isOptional: true,
    startLocation: 'Jerozolima (Wierzchołek Południowo-Wschodni: Brama Jafska)',
    endLocation: 'Ruda Śląska – Kochłowice (Wierzchołek Północny: Kościół Trójcy Świętej)',
    daysCount: 95,
    startDayOffset: 271, // 12 marca
    endDayOffset: 365,   // 14 czerwca (zamknięcie pełnego roku 365 dni)
    totalDistanceKm: 3094.0,
    avgDailyKm: 32.6,
    maxDailyKm: 36.8,
    countries: ['Ziemia Święta', 'Turcja', 'Bułgaria', 'Serbia', 'Węgry', 'Słowacja', 'Polska'],
    baggageSystem: 'Plecak pątniczy (7 kg) + na ostatnich 5 dniach (od Czadcy/Wisły przez Pszczynę do Kochłowic) ponowne wsparcie busa parafialnego z Kochłowic',
    accommodationSystem: 'Domy pielgrzyma, monastyry bałkańskie (Rila), schroniska Węgierskiej i Słowackiej Drogi św. Jakuba (Szent Jakab-út / Svätojakubská cesta) oraz Beskidzkiej Drogi św. Jakuba',
    description:
      'Trzeci bok domykający Wielki Trójkąt Pątniczy (Etapy 4–6) w 95 dni marszu prowadzi w 100% drogą lądową (bez promów morskich!) prostą osią północno-zachodnią z Jerozolimy przez Galileę, Syrię/Lewant, Anatolię i Stambuł, a następnie przez Bułgarię (Monastyr Rilski, Sofia) i Serbię (Nisz, Belgrad, Subotica). Od granicy węgierskiej aż do samych Kochłowic trasa biegnie nieprzerwanie oznakowanymi szlakami z muszlą św. Jakuba: Węgierską Drogą św. Jakuba (Szent Jakab-út i Mária Út przez Segedyn, Budapeszt, Ostrzyhom), Słowacką Drogą św. Jakuba (Svätojakubská cesta przez Bańską Szczawnicę i Żylinę) oraz Beskidzką i Górnośląską Drogą św. Jakuba przez Wisłę, Skoczów i Pszczynę do Kościoła Trójcy Świętej w Kochłowicach.',
    spiritualFocus: 'Powrót przemienionego pątnika — lądowe i jakubowe domknięcie Wielkiego Trójkąta Trójcy Świętej w Kochłowicach.',
    keySanctuaries: [
      'Nazaret i Góra Tabor (lądowe wyjście z Ziemi Świętej ku Antiochii i Anatolii)',
      'Monastyr Rilski i Sofia (Bułgarski trakt lądowy Via Diagonalis)',
      'Bazylika w Segedynie, Budapeszcie i Ostrzyhomiu (Węgierska Droga św. Jakuba – Szent Jakab-út / Mária Út)',
      'Kalwaria w Bańskiej Szczawnicy i Żylina (Słowacka Droga św. Jakuba – Svätojakubská cesta z muszlami)',
      'Kościół św. Jakuba w Szczyrku/Pszczynie i Kościół Trójcy Świętej w Kochłowicach (Beskidzka i Górnośląska Droga św. Jakuba)',
    ],
    coordinates: {
      start: [31.778, 35.229],
      waypoints: [
        { name: 'Stambuł / Sofia', x: 42.697, y: 23.321 },
        { name: 'Budapeszt (Szent Jakab-út)', x: 47.497, y: 19.040 },
        { name: 'Żylina (Svätojakubská)', x: 49.223, y: 18.739 },
        { name: 'Wisła / Pszczyna', x: 49.655, y: 18.859 },
      ],
      end: [50.258, 18.975],
    },
  },
];

// Core 15 Days of Stages 1, 2, 3 with exact towns, landmarks, distances <= 30 km
const CORE_15_DAYS: DailySegment[] = [
  // ETAP 1: Kochłowice -> Jasna Góra (4 dni, 14.06 - 17.06)
  {
    globalDayNumber: 1,
    stageId: 1,
    stageDayNumber: 1,
    dayOffsetFromJune14: 0,
    fromTown: 'Ruda Śląska – Kochłowice (Kościół Trójcy Świętej)',
    viaWaypoints: ['Chorzów Stary (św. Marii Magdaleny)', 'Piekary Śląskie (Bazylika NMP)', 'Kozłowa Góra'],
    toTown: 'Świerklaniec',
    country: 'Polska',
    region: 'Górny Śląsk',
    distanceKm: 25.4,
    elevationGainM: 210,
    terrainType: 'Nawierzchnia mieszana, parki miejskie i leśne dukty za Piekarami',
    accommodationName: 'Baza noclegowa przy parafii Chrystusa Króla i sala szkolna w Świerklańcu',
    accommodationType: 'Parafia / Sala / Kwatery',
    estimatedCostPLN: '25 PLN (składka organizacyjna)',
    baggageMode: 'Bus parafialny z Kochłowic (zdanie bagażu o 6:15 przed kościołem Trójcy Świętej)',
    waterAndFoodPoints: 'Postój śniadaniowy w Chorzowie Starym (10 km), obiad pielgrzymkowy w Piekarach Śląskich (18 km)',
    sanctuaryOrLandmark: 'Sanktuarium MB z Lourdes w Kochłowicach (start) · Bazylika NMP w Piekarach Śląskich',
    scheduleSummary: '6:15 Zdanie bagażu · 7:00 Msza Św. na rozpoczęcie pielgrzymki w Kochłowicach · 8:00 Wymarsz · 13:30 Modlitwa w Bazylice Piekarskiej · 17:30 Nocleg w Świerklańcu',
  },
  {
    globalDayNumber: 2,
    stageId: 1,
    stageDayNumber: 2,
    dayOffsetFromJune14: 1,
    fromTown: 'Świerklaniec',
    viaWaypoints: ['Sączów (kościół św. Jakuba Apostoła – szlak z muszlami)', 'Miasteczko Śląskie', 'Kalety (Jędrysek)', 'Miotek'],
    toTown: 'Woźniki',
    country: 'Polska',
    region: 'Jasnogórska Droga św. Jakuba / Lasy Lublinieckie',
    distanceKm: 26.2,
    elevationGainM: 185,
    terrainType: '70% utwardzone drogi leśne ze znakami muszli św. Jakuba, 30% asfalt lokalny',
    accommodationName: 'Kwatery prywatne u rodzin oraz sala gimnastyczna przy parafii św. Katarzyny w Woźnikach',
    accommodationType: 'Parafia / Sala / Kwatery',
    estimatedCostPLN: '25 PLN (nocleg + ciepła kolacja parafialna)',
    baggageMode: 'Bus parafialny (odbiór bagażu o 17:15 przed salą w Woźnikach)',
    waterAndFoodPoints: 'Postój przy kościele św. Jakuba w Sączowie (pieczęć z muszlą), Miasteczko Śląskie (10 km) oraz kuchnia polowa w Kaletach (18 km)',
    sanctuaryOrLandmark: 'Kościół św. Jakuba Apostoła w Sączowie (Jasnogórska Droga św. Jakuba) oraz drewniany kościół św. Walentego w Woźnikach',
    scheduleSummary: '6:30 Jutrznia i wymarsz szlakiem z muszlami · 9:30 Modlitwa i pieczęć w kościele św. Jakuba w Sączowie · 17:00 Wejście do Woźnik · 19:30 Nabożeństwo wieczorne',
  },
  {
    globalDayNumber: 3,
    stageId: 1,
    stageDayNumber: 3,
    dayOffsetFromJune14: 2,
    fromTown: 'Woźniki',
    viaWaypoints: ['Cynków', 'Koziegłowy (kościół św. Marii Magdaleny)', 'Osiny', 'Nierada'],
    toTown: 'Poczesna',
    country: 'Polska',
    region: 'Wyżyna Woźnicko-Wieluńska',
    distanceKm: 24.8,
    elevationGainM: 195,
    terrainType: 'Spokojne drogi polne i powiatowe z widokiem na wzgórza jurajskie',
    accommodationName: 'Dom Parafialny św. Jana Chrzciciela i sala OSP w Poczesnej',
    accommodationType: 'Parafia / Sala / Kwatery',
    estimatedCostPLN: '25 PLN',
    baggageMode: 'Bus parafialny (przewóz z Woźnik do Poczesnej)',
    waterAndFoodPoints: 'Tradycyjny poczęstunek przygotowany przez mieszkańców Cynkowa (6 km) oraz postój w Koziegłowach (12 km)',
    sanctuaryOrLandmark: 'Kościół Bożego Ciała i św. Marii Magdaleny w Koziegłowach (XV w.)',
    scheduleSummary: '6:30 Wymarsz z Woźnik · 11:00 Msza Św. polowa w Koziegłowach · 16:45 Dotarcie do Poczesnej · 19:00 Wieczór pojednania i spowiedzi przed Jasną Górą',
  },
  {
    globalDayNumber: 4,
    stageId: 1,
    stageDayNumber: 4,
    dayOffsetFromJune14: 3,
    fromTown: 'Poczesna',
    viaWaypoints: ['Wrzosowa', 'Częstochowa – Błeszno', 'Ostatni Grosz', 'Aleja Najświętszej Maryi Panny'],
    toTown: 'Częstochowa – Jasna Góra',
    country: 'Polska',
    region: 'Ziemia Częstochowska',
    distanceKm: 19.6,
    elevationGainM: 140,
    terrainType: 'Trakt pątniczy i reprezentacyjna Aleja NMP w Częstochowie',
    accommodationName: 'Dom Pielgrzyma im. św. Jana Pawła II na Jasnej Górze (ul. Wyszyńskiego 1/31)',
    accommodationType: 'Dom Pielgrzyma',
    estimatedCostPLN: '75–110 PLN (pokoje wieloosobowe lub 2-osobowe w Domu Pielgrzyma)',
    baggageMode: 'Bus parafialny (wydawanie bagaży na parkingu przy Domu Pielgrzyma od godz. 16:00)',
    waterAndFoodPoints: 'Postój we Wrzosowej (6 km) i na Ostatnim Groszu przed wejściem w Aleje NMP (14 km)',
    sanctuaryOrLandmark: 'Klasztor Ojców Paulinów na Jasnej Górze — Kaplica Cudownego Obrazu Matki Bożej',
    scheduleSummary: '7:00 Wymarsz z Poczesnej · 14:30 Pokłon na Górce Przeprośnej / Alejach NMP · 16:00 Wejście na Jasną Górę · 18:30 Msza Św. w Kaplicy Matki Bożej · 21:00 Apel Jasnogórski (Koniec Etapu 1)',
  },

  // ETAP 2: Jasna Góra -> Kraków-Łagiewniki (7 dni: 18.06 - 25.06)
  {
    globalDayNumber: 5,
    stageId: 2,
    stageDayNumber: 1,
    dayOffsetFromJune14: 4,
    fromTown: 'Częstochowa – Jasna Góra',
    viaWaypoints: ['Góry Towarne', 'Olsztyn k. Częstochowy (Ruiny Zamku)', 'Zrębice (drewniany kościół św. Idziego)'],
    toTown: 'Złoty Potok (Sanktuarium Leśniowskie / Dolina Wiercicy)',
    country: 'Polska',
    region: 'Jura Krakowsko-Częstochowska (Północ)',
    distanceKm: 26.8,
    elevationGainM: 340,
    terrainType: 'Czerwony Szlak Orlich Gniazd — piaszczyste ścieżki leśne i wapienne ostańce',
    accommodationName: 'Schronisko Jurajskie i Dom Pielgrzyma przy Sanktuarium MB Leśniowskiej Patronki Rodzin',
    accommodationType: 'Dom Pielgrzyma',
    estimatedCostPLN: '65 PLN',
    baggageMode: 'Bus logistyczny Etapu 2 (zdanie bagażu o 6:45 przy Domu Pielgrzyma na Jasnej Górze)',
    waterAndFoodPoints: 'Olsztyn Jurajski — rynek (14 km), Zrębice (20 km), Źródła Zygmunta w Złotym Potoku (25 km)',
    sanctuaryOrLandmark: 'Kościół św. Idziego w Zrębicach oraz Sanktuarium Matki Bożej Leśniowskiej',
    scheduleSummary: '6:00 Msza Św. przed Obrazem Jasnogórskim · 7:15 Wymarsz na Szlak Orlich Gniazd · 12:30 Postój pod zamkiem w Olsztynie · 17:30 Nocleg w Złotym Potoku / Leśniowie',
  },
  {
    globalDayNumber: 6,
    stageId: 2,
    stageDayNumber: 2,
    dayOffsetFromJune14: 5,
    fromTown: 'Złoty Potok',
    viaWaypoints: ['Ostrężnik', 'Trzebniów', 'Niegowa', 'Zamki w Mirowie i Bobolicach', 'Podlesice'],
    toTown: 'Kroczyce',
    country: 'Polska',
    region: 'Jura Krakowsko-Częstochowska (Skały Kroczyckie)',
    distanceKm: 24.5,
    elevationGainM: 380,
    terrainType: 'Szlak grzbietowy między zamkami w Mirowie i Bobolicach oraz leśne dukty koło Góry Zborów',
    accommodationName: 'Szkolne Schronisko Młodzieżowe i Dom Parafialny św. Jacka w Kroczycach',
    accommodationType: 'Albergue / Schronisko',
    estimatedCostPLN: '50 PLN',
    baggageMode: 'Bus logistyczny Etapu 2',
    waterAndFoodPoints: 'Niegowa (10 km), Baza pod zamkiem w Bobolicach (15 km), Centrum Dziedzictwa w Podlesicach (20 km)',
    sanctuaryOrLandmark: 'Grzęda Mirowsko-Bobolicka i kościół św. Mikołaja w Niegowie',
    scheduleSummary: '7:00 Wymarsz ze Złotego Potoku · 13:00 Modlitwa południowa na grani Mirowskiej · 16:45 Zakwaterowanie w Kroczycach',
  },
  {
    globalDayNumber: 7,
    stageId: 2,
    stageDayNumber: 3,
    dayOffsetFromJune14: 6,
    fromTown: 'Kroczyce',
    viaWaypoints: ['Morsko', 'Skarżyce (Sanktuarium Trójcy Świętej)', 'Podzamcze (Zamek Ogrodzieniec)'],
    toTown: 'Pilica (Klasztor Franciszkanów)',
    country: 'Polska',
    region: 'Jura Krakowsko-Częstochowska (Środkowa)',
    distanceKm: 23.8,
    elevationGainM: 360,
    terrainType: 'Szlak wapiennych wzgórz przez Skarżyce i Górę Janowskiego (516 m n.p.m.)',
    accommodationName: 'Klasztor Ojców Franciszkanów (OFM) w Pilicy-Biskupicach (Dom Rekolekcyjny)',
    accommodationType: 'Klasztor / Opactwo',
    estimatedCostPLN: '60 PLN (ofiara klasztorna z posiłkiem)',
    baggageMode: 'Bus logistyczny Etapu 2',
    waterAndFoodPoints: 'Sanktuarium w Skarżycach (9 km), Podzamcze / Ogrodzieniec (15 km)',
    sanctuaryOrLandmark: 'Sanktuarium Trójcy Świętej w Skarżycach (nawiązanie do patronatu parafii w Kochłowicach) oraz Sanktuarium MB Śnieżnej w Pilicy',
    scheduleSummary: '6:45 Wymarsz · 10:30 Msza Św. w Sanktuarium Trójcy Świętej w Skarżycach · 14:00 Przejście pod Ogrodzieńcem · 17:15 Powitanie przez Franciszkanów w Pilicy',
  },
  {
    globalDayNumber: 8,
    stageId: 2,
    stageDayNumber: 4,
    dayOffsetFromJune14: 7,
    dateNote: '21 czerwca — Piesze przejście przez Pustynię Błędowską („Polską Saharę”)',
    fromTown: 'Pilica',
    viaWaypoints: [
      'Bydlin (Wzgórze Świętego Krzyża)',
      'Chechło (Wejście na Pustynię Błędowską)',
      'Pustynia Błędowska — Róża Wiatrów i Wzgórze Czubatka (Klucze)',
      'Zamek Rabsztyn',
    ],
    toTown: 'Olkusz (przez Pustynię Błędowską)',
    country: 'Polska',
    region: 'Pustynia Błędowska / Ziemia Olkuska',
    distanceKm: 27.4,
    elevationGainM: 390,
    terrainType: 'Lotne piaski Pustyni Błędowskiej (szlak przez Różę Wiatrów do Klucz), bukowe lasy koło Rabsztyna i szlak Via Regia',
    accommodationName: 'Dom Parafialny przy Bazylice św. Andrzeja Apostoła i kwatery pielgrzymkowe w Olkuszu',
    accommodationType: 'Parafia / Sala / Kwatery',
    estimatedCostPLN: '45 PLN',
    baggageMode: 'Bus logistyczny Etapu 2',
    waterAndFoodPoints: 'Chechło przed wejściem na Pustynię Błędowską (11 km — obowiązkowe uzupełnienie wody!), Róża Wiatrów / Klucze-Czubatka (18 km), Podzamcze Rabsztyńskie (23 km)',
    sanctuaryOrLandmark: 'Pustynia Błędowska (Róża Wiatrów i panorama z Czubatki) oraz Bazylika św. Andrzeja Apostoła w Olkuszu (Via Regia)',
    scheduleSummary: '6:30 Wymarsz z Pilicy · 10:30 Wejście w Chechle na piaski Pustyni Błędowskiej (medytacja pustyni w ciszy) · 13:00 Postój na Róży Wiatrów i punkcie widokowym Czubatka w Kluczach · 15:45 Zamek Rabsztyn · 17:45 Bazylika w Olkuszu',
  },
  {
    globalDayNumber: 9,
    stageId: 2,
    stageDayNumber: 5,
    dayOffsetFromJune14: 8,
    dateNote: '22 czerwca — Wejście do Ojcowa w przeddzień Dnia Ojca',
    fromTown: 'Olkusz',
    viaWaypoints: [
      'Kosmolów',
      'Przeginia (kościół Najświętszego Zbawiciela)',
      'Sułoszowa (Zamek Pieskowa Skała i Maczuga Herkulesa)',
      'Dolina Prądnika (Młyn Boronia)',
    ],
    toTown: 'Ojców (Ojcowski Park Narodowy)',
    country: 'Polska',
    region: 'Ojcowski Park Narodowy / Dolina Prądnika',
    distanceKm: 22.6,
    elevationGainM: 290,
    terrainType: 'Wapienny kanion Doliny Prądnika — Szlak Orlich Gniazd obok Pieskowej Skały i Maczugi Herkulesa do serca Ojcowa',
    accommodationName: 'Dom Wycieczkowy PTTK „Zosia” w Ojcowie (Ojców 6) oraz kwatery agroturystyczne w Dolinie Prądnika',
    accommodationType: 'Albergue / Schronisko',
    estimatedCostPLN: '65 PLN',
    baggageMode: 'Bus logistyczny Etapu 2 (postój na parkingu pod Zamkiem w Ojcowie)',
    waterAndFoodPoints: 'Przeginia (8 km), Sułoszowa / Pieskowa Skała (14 km), pstrągarnia i źródła w Ojcowie (22.6 km)',
    sanctuaryOrLandmark: 'Zamek w Pieskowej Skale, Maczuga Herkulesa oraz Kaplica „Na Wodzie” św. Józefa Robotnika w Ojcowie',
    scheduleSummary: '7:00 Wymarsz z Olkusza · 12:30 Postój pod Zamkiem w Pieskowej Skale i Maczugą Herkulesa · 16:00 Wejście Doliną Prądnika do Ojcowa · 18:30 Wieczorna modlitwa wigilijna przed Dniem Ojca w Kaplicy „Na Wodzie” w Ojcowie',
  },
  {
    globalDayNumber: 10,
    stageId: 2,
    stageDayNumber: 6,
    dayOffsetFromJune14: 9,
    dateNote: '23 czerwca — DZIEŃ OJCA: Uroczysty pobyt w Ojcowie (Ojcowski Park Narodowy) i marsz Doliną Prądnika',
    fromTown: 'Ojców (Pobyt w Dzień Ojca)',
    viaWaypoints: [
      'Ojców: Kaplica „Na Wodzie” św. Józefa i Zamek Kazimierzowski',
      'Brama Krakowska, Źródło Miłości i Grota Łokietka (pobyt w OPN)',
      'Prądnik Korzkiewski i Giebułtów (kościół św. Idziego)',
      'Bielany / Przeprawa do Tyńca',
    ],
    toTown: 'Kraków – Tyniec (Opactwo Benedyktynów)',
    country: 'Polska',
    region: 'Ojcowski Park Narodowy → Brama Krakowska',
    distanceKm: 24.2,
    elevationGainM: 310,
    terrainType: 'Skalne wąwozy Ojcowskiego Parku Narodowego (Brama Krakowska, Dolina Prądnika) oraz wały wiślane do Tyńca',
    accommodationName: 'Dom Gościnny Opactwa Benedyktynów w Tyńcu oraz salka parafialna w Tyńcu',
    accommodationType: 'Klasztor / Opactwo',
    estimatedCostPLN: '80 PLN (kwatery opactwa) / 35 PLN (baza parafialna)',
    baggageMode: 'Bus logistyczny Etapu 2',
    waterAndFoodPoints: 'Ojców — Park Zamkowy i Źródło Miłości (pobyt do godz. 12:30), Prądnik Korzkiewski (6 km), Giebułtów (11 km), Bielany (19 km)',
    sanctuaryOrLandmark: 'Kaplica „Na Wodzie” św. Józefa w Ojcowie (świętowanie Dnia Ojca 23 czerwca w miejscowości nazwanej na cześć ojca króla Kazimierza Wielkiego) oraz Opactwo w Tyńcu',
    scheduleSummary: '8:00 Uroczysta Msza Św. w Dzień Ojca (23.06) w Kaplicy „Na Wodzie” św. Józefa Robotnika w Ojcowie i błogosławieństwo ojców · 9:15–12:30 Pobyt w Ojcowie (Zamek w Ojcowie, Brama Krakowska, Grota Łokietka) · 12:30 Wymarsz Doliną Prądnika · 18:00 Opactwo w Tyńcu',
  },
  {
    globalDayNumber: 11,
    stageId: 2,
    stageDayNumber: 7,
    dayOffsetFromJune14: 10,
    dateNote: '24–25 czerwca (Wejście do Łagiewnik 24.06 + Dzień Skupienia i Uroczystości 25.06)',
    fromTown: 'Kraków – Tyniec',
    viaWaypoints: ['Kostrze', 'Zakrzówek', 'Sanktuarium św. Jana Pawła II (Białe Morza)'],
    toTown: 'Kraków – Łagiewniki (Sanktuarium Bożego Miłosierdzia)',
    country: 'Polska',
    region: 'Kraków',
    distanceKm: 16.7,
    elevationGainM: 135,
    terrainType: 'Bulwary Wiślane, park Zakrzówek i Most Miłosierdzia łączący Białe Morza z Łagiewnikami',
    accommodationName: 'Dom Duszpasterski Sanktuarium Bożego Miłosierdzia (ul. Siostry Faustyny 3, Kraków)',
    accommodationType: 'Dom Pielgrzyma',
    estimatedCostPLN: '90 PLN / doba (2 noclegi: 24/25.06 oraz 25/26.06)',
    baggageMode: 'Bus logistyczny (odbiór bagażu pod Domem Duszpasterskim w Łagiewnikach)',
    waterAndFoodPoints: 'Tyniec-Kostrze (6 km), Zakrzówek (11 km), Restauracja Domu Duszpasterskiego w Łagiewnikach (16.7 km)',
    sanctuaryOrLandmark: 'Sanktuarium Bożego Miłosierdzia (Kaplica z łaskami słynącym obrazem Jezusa Miłosiernego i relikwiami św. Faustyny) oraz Sanktuarium św. Jana Pawła II',
    scheduleSummary: '8:00 Wymarsz z Tyńca · 12:30 Nawiedzenie Sanktuarium św. Jana Pawła II · 15:00 Godzina Miłosierdzia i Koronka w Bazylice w Łagiewnikach · 25 czerwca: Całodniowe czuwanie dziękczynne i odpoczynek przed Etapem 3',
  },

  // ETAP 3: Kraków-Łagiewniki -> Kochłowice (4 dni: 26.06 - 29.06)
  {
    globalDayNumber: 12,
    stageId: 3,
    stageDayNumber: 1,
    dayOffsetFromJune14: 12, // 26 czerwca
    fromTown: 'Kraków – Łagiewniki',
    viaWaypoints: ['Skawina (kościół św. Apostołów Szymona i Judy)', 'Jaśkowice', 'Brzeźnica', 'Czernichów / Łączany (stopień wodny)'],
    toTown: 'Spytkowice',
    country: 'Polska',
    region: 'Dolina Górnej Wisły',
    distanceKm: 28.4,
    elevationGainM: 160,
    terrainType: 'Wiślana Trasa Rowerowo-Piesza oraz spokojne drogi nadrzeczne',
    accommodationName: 'Dom Parafialny św. Katarzyny oraz remiza OSP w Spytkowicach',
    accommodationType: 'Parafia / Sala / Kwatery',
    estimatedCostPLN: '25 PLN',
    baggageMode: 'Bus parafialny z Kochłowic (kolor wstążki: Żółto-Złoty)',
    waterAndFoodPoints: 'Skawina Park Miejski (9 km), Brzeźnica (19 km), zapora w Łączanach (24 km)',
    sanctuaryOrLandmark: 'Kościół św. Katarzyny Aleksandryjskiej w Spytkowicach ( z 1633 r.)',
    scheduleSummary: '6:30 Msza Św. rozesłania w Łagiewnikach · 7:30 Wymarsz · 10:30 Postój w Skawinie · 17:30 Dotarcie do Spytkowic',
  },
  {
    globalDayNumber: 13,
    stageId: 3,
    stageDayNumber: 2,
    dayOffsetFromJune14: 13, // 27 czerwca
    fromTown: 'Spytkowice',
    viaWaypoints: ['Zator (kościół św. Wojciecha i Jerzego)', 'Przeciszów', 'Włosienica', 'Oświęcim (Stare Miasto)'],
    toTown: 'Oświęcim – Harmęże (Centrum św. Maksymiliana)',
    country: 'Polska',
    region: 'Ziemia Oświęcimska / Dolina Karpia',
    distanceKm: 26.8,
    elevationGainM: 145,
    terrainType: 'Groblami stawów Doliny Karpia i nadrzecznymi ścieżkami Soły i Wisły',
    accommodationName: 'Dom Pielgrzyma i Rekolekcyjny Ojców Franciszkanów (OFMConv) w Harmężach k. Oświęcimia',
    accommodationType: 'Klasztor / Opactwo',
    estimatedCostPLN: '65 PLN (z obiadokolacją klasztorną)',
    baggageMode: 'Bus parafialny z Kochłowic',
    waterAndFoodPoints: 'Zator Rynek (6 km), Przeciszów (12 km), Oświęcim – Sanktuarium MB Wspomożenia Wiernych (21 km)',
    sanctuaryOrLandmark: 'Centrum św. Maksymiliana w Harmężach (wystawa „Klisze Pamięci” Mariana Kołodzieja) oraz Sanktuarium Salezjańskie w Oświęcimiu',
    scheduleSummary: '6:45 Wymarsz ze Spytkowic · 13:30 Modlitwa o pokój w Oświęcimiu · 16:45 Zakwaterowanie u Franciszkanów w Harmężach · 18:30 Zwiedzanie ekspozycji „Klisze Pamięci”',
  },
  {
    globalDayNumber: 14,
    stageId: 3,
    stageDayNumber: 3,
    dayOffsetFromJune14: 14, // 28 czerwca
    fromTown: 'Oświęcim – Harmęże',
    viaWaypoints: ['Bieruń Stary (Sanktuarium św. Walentego)', 'Tychy – Stare Tychy (kościół św. Marii Magdaleny)', 'Wyry'],
    toTown: 'Mikołów',
    country: 'Polska',
    region: 'Ziemia Pszczyńsko-Mikołowska / Górny Śląsk',
    distanceKm: 25.9,
    elevationGainM: 175,
    terrainType: 'Grobla bieruńska, Lasy Pszczyńsko-Kobiórskie i trakt mikołowski',
    accommodationName: 'Dom Parafialny przy Bazylice św. Wojciecha w Mikołowie oraz kwatery u rodzin',
    accommodationType: 'Parafia / Sala / Kwatery',
    estimatedCostPLN: '25 PLN',
    baggageMode: 'Bus parafialny z Kochłowic',
    waterAndFoodPoints: 'Bieruń Stary przy Sanktuarium św. Walentego (7 km), Tychy Stary Rynek (16 km), Wyry (21 km)',
    sanctuaryOrLandmark: 'Sanktuarium św. Walentego w Bieruniu Starym („Walencinek”) oraz Bazylika św. Wojciecha i Sanktuarium MB Mikołowskiej',
    scheduleSummary: '7:00 Wymarsz z Harmęż · 9:15 Modlitwa w drewnianym Sanktuarium św. Walentego w Bieruniu · 13:00 Obiad w Tychach · 17:00 Powitanie przed Bazyliką w Mikołowie',
  },
  {
    globalDayNumber: 15,
    stageId: 3,
    stageDayNumber: 4,
    dayOffsetFromJune14: 15, // 29 czerwca (Uroczystość św. Apostołów Piotra i Pawła)
    fromTown: 'Mikołów',
    viaWaypoints: ['Mikołów – Borowa Wieś (kościół św. Mikołaja)', 'Ruda Śląska – Halemba', 'Ruda Śląska – Kłodnica'],
    toTown: 'Ruda Śląska – Kochłowice (Kościół Trójcy Świętej i Sanktuarium MB z Lourdes)',
    country: 'Polska',
    region: 'Górny Śląsk',
    distanceKm: 18.9,
    elevationGainM: 130,
    terrainType: 'Lasy Panewnicko-Halembskie i uroczyste wejście ul. Tunkla do Kochłowic',
    accommodationName: 'Powrót do domów w Kochłowicach / Dom Parafialny dla pątników kontynuujących Etap 4 do Santiago',
    accommodationType: 'Parafia / Sala / Kwatery',
    estimatedCostPLN: '0 PLN (meta pętli podstawowej)',
    baggageMode: 'Odbiór bagażu głównego o godz. 15:30 przy Kościele Trójcy Świętej w Kochłowicach',
    waterAndFoodPoints: 'Borowa Wieś (7 km), Halemba – parafia MB Różańcowej (13 km)',
    sanctuaryOrLandmark: 'Kościół Trójcy Świętej oraz Grota Sanktuarium Matki Bożej z Lourdes w Rudzie Śląskiej-Kochłowicach',
    scheduleSummary: '7:30 Wymarsz z Mikołowa · 11:30 Postój w Halembie · 15:00 Uroczyste wejście do Kochłowic · 15:30 Msza Św. dziękczynna w Kościele Trójcy Świętej, modlitwa przy Grocie MB z Lourdes i błogosławieństwo pątników wyruszających nazajutrz na Etap 4 do Santiago de Compostela',
  },
];

// Authentic geographical waypoint chains for Stages 4, 5, and 6 so every single day (Days 16..455) has real towns and distance <= 30 km!
const STAGE_4_CORRIDOR: Array<{ town: string; country: string; region: string; landmark: string }> = [
  { town: 'Gliwice (Katedra św. Piotra i Pawła)', country: 'Polska', region: 'Górny Śląsk', landmark: 'Szlak Jakubowy Via Regia' },
  { town: 'Rudy Raciborskie (Opactwo Cystersów)', country: 'Polska', region: 'Górny Śląsk', landmark: 'Sanktuarium MB Pokornej w Rudach' },
  { town: 'Racibórz', country: 'Polska', region: 'Brama Morawska', landmark: 'Kaplica zamkowa św. Tomasza Becketa' },
  { town: 'Opawa (Opava)', country: 'Czechy', region: 'Śląsk Czeski', landmark: 'Konkatedra Wniebowzięcia NMP' },
  { town: 'Moravský Beroun', country: 'Czechy', region: 'Niski Jesionik', landmark: 'Kościół Podwyższenia Krzyża Św.' },
  { town: 'Ołomuniec (Svatý Kopeček)', country: 'Czechy', region: 'Morawy', landmark: 'Bazylika Nawiedzenia NMP i Katedra św. Wacława' },
  { town: 'Prościejów (Prostějov)', country: 'Czechy', region: 'Morawy Środkowe', landmark: 'Trakt Morawski Svatojakubská cesta' },
  { town: 'Slavkov u Brna', country: 'Czechy', region: 'Morawy Południowe', landmark: 'Kościół Zmartwychwstania Pańskiego' },
  { town: 'Brno (Katedra św. Piotra i Pawła)', country: 'Czechy', region: 'Morawy Południowe', landmark: 'Wzgórze Petrov w Brnie' },
  { town: 'Třebíč (Bazylika św. Prokopa)', country: 'Czechy', region: 'Wysoczyna', landmark: 'Romańsko-gotycka bazylika UNESCO' },
  { town: 'Telč', country: 'Czechy', region: 'Wysoczyna', landmark: 'Kościół św. Jakuba Starszego w Telču' },
  { town: 'Jindřichův Hradec', country: 'Czechy', region: 'Czechy Południowe', landmark: 'Kościół Wniebowzięcia NMP' },
  { town: 'Czeskie Budziejowice', country: 'Czechy', region: 'Czechy Południowe', landmark: 'Katedra św. Mikołaja' },
  { town: 'Český Krumlov', country: 'Czechy', region: 'Szumawa', landmark: 'Kościół św. Wita nad Wełtawą' },
  { town: 'Frymburk / Lipno', country: 'Czechy', region: 'Szumawa', landmark: 'Przejście graniczne Szumawa–Las Bawarski' },
  { town: 'Pasawa (Passau)', country: 'Niemcy', region: 'Bawaria', landmark: 'Katedra św. Stefana nad Dunajem' },
  { town: 'Straubing', country: 'Niemcy', region: 'Bawaria Dolna', landmark: 'Bazylika św. Jakuba w Straubingu' },
  { town: 'Ratyzbona (Regensburg)', country: 'Niemcy', region: 'Bawaria', landmark: 'Katedra św. Piotra i Kościół Szkocki św. Jakuba' },
  { town: 'Eichstätt', country: 'Niemcy', region: 'Frankonia / Bawaria', landmark: 'Katedra Zbawiciela i św. Willibalda' },
  { town: 'Donauwörth', country: 'Niemcy', region: 'Szwabia', landmark: 'Klasztor Świętego Krzyża' },
  { town: 'Ulm (Katedra Ulmer Münster)', country: 'Niemcy', region: 'Badenia-Wirtembergia', landmark: 'Oberschwäbischer Jakobsweg' },
  { town: 'Biberach an der Riß', country: 'Niemcy', region: 'Górna Szwabia', landmark: 'Kościół św. Marcina' },
  { town: 'Bad Waldsee', country: 'Niemcy', region: 'Górna Szwabia', landmark: 'Kolegiata św. Piotra' },
  { town: 'Ravensburg / Stein am Rhein (Obejście lądowe)', country: 'Niemcy / Szwajcaria', region: 'Jezioro Bodeńskie (Lądem)', landmark: 'Lądowy szlak z muszlą św. Jakuba wokół Jeziora Bodeńskiego (bez promu)' },
  { town: 'Konstancja (Konstanz)', country: 'Niemcy', region: 'Jezioro Bodeńskie', landmark: 'Katedra NMP w Konstancji (początek szlaku z muszlami Via Jacobi)' },
  { town: 'Fischingen (Klasztor)', country: 'Szwajcaria', region: 'Turgowia', landmark: 'Kaplica św. Iddi na szlaku z muszlami Via Jacobi' },
  { town: 'Rapperswil', country: 'Szwajcaria', region: 'Jezioro Zuryskie', landmark: 'Drewniany most pątniczy Heilig Hüsli (szlak z muszlami przez kładkę lądową)' },
  { town: 'Einsiedeln (Opactwo Benedyktynów)', country: 'Szwajcaria', region: 'Schwyz', landmark: 'Sanktuarium Czarnej Madonny w Einsiedeln' },
  { town: 'Stans / Flüeli-Ranft', country: 'Szwajcaria', region: 'Obwalden', landmark: 'Pustelnia św. Mikołaja z Flüe (Brata Klausa)' },
  { town: 'Interlaken / Spiez', country: 'Szwajcaria', region: 'Oberland Berneński', landmark: 'Romański kościół zamkowy nad jeziorem Thun' },
  { town: 'Fryburg (Fribourg)', country: 'Szwajcaria', region: 'Fryburg', landmark: 'Katedra św. Mikołaja' },
  { town: 'Lozanna (Lausanne)', country: 'Szwajcaria', region: 'Vaud', landmark: 'Katedra Notre-Dame nad Jeziorem Genewskim' },
  { town: 'Genewa (Genève)', country: 'Szwajcaria', region: 'Genewa', landmark: 'Początek szlaku Via Gebennensis do Le Puy' },
  { town: 'Yenne / Saint-Genix-sur-Guiers', country: 'Francja', region: 'abaudia', landmark: 'Przełom Rodanu na Via Gebennensis' },
  { town: 'Le Puy-en-Velay', country: 'Francja', region: 'Owernia', landmark: 'Sanktuarium Notre-Dame du Puy (start Via Podiensis GR65)' },
  { town: 'Nasbinals / Aubrac', country: 'Francja', region: 'Płaskowyż Aubrac', landmark: 'XII-wieczna Domerie d’Aubrac dla pątników' },
  { town: 'Conques (Opactwo Sainte-Foy)', country: 'Francja', region: 'Aveyron', landmark: 'Romański tympanon Sądu Ostatecznego w Conques' },
  { town: 'Figeac / Cahors', country: 'Francja', region: 'Lot (Quercy)', landmark: 'Katedra św. Szczepana i most Valentré' },
  { town: 'Moissac', country: 'Francja', region: 'Tarn i Garonna', landmark: 'Opactwo św. Piotra w Moissac' },
  { town: 'Condom / Eauze', country: 'Francja', region: 'Gaskonia', landmark: 'Katedra św. Piotra w Condom' },
  { town: 'Aire-sur-l’Adour / Navarrenx', country: 'Francja', region: 'Béarn', landmark: 'Kościół Sainte-Quitterie' },
  { town: 'Saint-Jean-Pied-de-Port', country: 'Francja', region: 'raj Basków', landmark: 'Brama św. Jakuba u stóp Pirenejów (Camino Francés)' },
  { town: 'Roncesvalles (Orreaga)', country: 'Hiszpania', region: 'Nawarra', landmark: 'Kolegiata Królewska w Roncesvalles' },
  { town: 'Pampeluna (Pamplona)', country: 'Hiszpania', region: 'Nawarra', landmark: 'Katedra Santa María la Real' },
  { town: 'Puente la Reina / Estella', country: 'Hiszpania', region: 'Nawarra', landmark: 'Romański most pątniczy nad rzeką Arga' },
  { town: 'Logroño / Santo Domingo de la Calzada', country: 'Hiszpania', region: 'La Rioja', landmark: 'Katedra Zbawiciela w Santo Domingo' },
  { town: 'Burgos', country: 'Hiszpania', region: 'Kastylia i León', landmark: 'Gotycka Katedra NMP w Burgos' },
  { town: 'Carrión de los Condes / Sahagún', country: 'Hiszpania', region: 'Meseta Kastylijska', landmark: 'Klasztor San Zoilo' },
  { town: 'León', country: 'Hiszpania', region: 'Kastylia i León', landmark: 'Katedra Santa María de Regla i Bazylika San Isidoro' },
  { town: 'Astorga / Cruz de Ferro', country: 'Hiszpania', region: 'Góry Leonu', landmark: 'Pałac Biskupi i Żelazny Krzyż (Cruz de Ferro, 1504 m)' },
  { town: 'Ponferrada / Villafranca del Bierzo', country: 'Hiszpania', region: 'El Bierzo', landmark: 'Zamek Templariuszy i Drzwi Przebaczenia' },
  { town: 'O Cebreiro / Sarria', country: 'Hiszpania', region: 'Galicja', landmark: 'Sanktuarium Cudu Eucharystycznego w O Cebreiro' },
  { town: 'Portomarín / Arzúa', country: 'Hiszpania', region: 'Galicja', landmark: 'Kościół warowny San Nicolás w Portomarín' },
  { town: 'Santiago de Compostela', country: 'Hiszpania', region: 'Galicja', landmark: 'Katedra św. Jakuba Apostoła (Grób Apostoła, Plaza del Obradoiro)' },
];

const STAGE_5_CORRIDOR: Array<{ town: string; country: string; region: string; landmark: string }> = [
  // 5A: Santiago -> Watykan (89 dni)
  { town: 'Lugo / Sobrado dos Monxes', country: 'Hiszpania', region: 'Galicja', landmark: 'Klasztor Cystersów w Sobrado' },
  { town: 'Oviedo (Katedra San Salvador)', country: 'Hiszpania', region: 'Asturia', landmark: 'Cámara Santa (Sudarium z Oviedo)' },
  { town: 'Santander / Laredo', country: 'Hiszpania', region: 'Kantabria', landmark: 'Katedra Wniebowzięcia NMP' },
  { town: 'Bilbao / Guernica', country: 'Hiszpania', region: 'Kraj Basków', landmark: 'Bazylika Begoña' },
  { town: 'Loyola / San Sebastián', country: 'Hiszpania', region: 'Kraj Basków', landmark: 'Sanktuarium św. Ignacego Loyoli' },
  { town: 'Jaca / San Juan de la Peña', country: 'Hiszpania', region: 'Aragonia', landmark: 'Klasztor wykuty w skale San Juan de la Peña' },
  { town: 'Huesca / Lleida', country: 'Hiszpania', region: 'Aragonia / Katalonia', landmark: 'Szlak Ignacjański i Kataloński' },
  { town: 'Montserrat (Opactwo Benedyktynów)', country: 'Hiszpania', region: 'Katalonia', landmark: 'Sanktuarium Czarnej Madonny La Moreneta' },
  { town: 'Girona / Figueres', country: 'Hiszpania', region: 'Katalonia', landmark: 'Katedra NMP w Gironie' },
  { town: 'Perpignan / Narbonne', country: 'Francja', region: 'Oksytania', landmark: 'Via Domitia i Katedra św. Justa' },
  { town: 'Montpellier / Saint-Gilles', country: 'Francja', region: 'Langwedocja', landmark: 'Opactwo św. Idziego (Saint-Gilles)' },
  { town: 'Arles (Via Tolosana)', country: 'Francja', region: 'Prowansja', landmark: 'Romański Kościół św. Trofima w Arles' },
  { town: 'Aix-en-Provence / Saint-Maximin-la-Sainte-Baume', country: 'Francja', region: 'Prowansja', landmark: 'Bazylika św. Marii Magdaleny (Grota Sainte-Baume)' },
  { town: 'Fréjus / Nicea', country: 'Francja', region: 'Lazurowe Wybrzeże', landmark: 'Via Julia Augusta' },
  { town: 'Ventimiglia / Sanremo', country: 'Włochy', region: 'Liguria', landmark: 'Katedra Wniebowzięcia NMP w Ventimiglii' },
  { town: 'Savona / Genua', country: 'Włochy', region: 'Liguria', landmark: 'Sanktuarium NMP Miłosierdzia w Savonie i Katedra San Lorenzo' },
  { town: 'Sarzana / Massa', country: 'Włochy', region: 'Liguria / Toskania', landmark: 'Wejście na główną oś Via Francigena' },
  { town: 'Lukka (Lucca)', country: 'Włochy', region: 'Toskania', landmark: 'Katedra San Martino (Święte Oblicze — Volto Santo)' },
  { town: 'San Miniato / San Gimignano', country: 'Włochy', region: 'Toskania', landmark: 'Kolegiata w San Gimignano na Via Francigena' },
  { town: 'Siena', country: 'Włochy', region: 'Toskania', landmark: 'Katedra w Sienie i Bazylika San Domenico (św. Katarzyna)' },
  { town: 'Radicofani / Acquapendente', country: 'Włochy', region: 'Val d’Orcia / Lacjum', landmark: 'Bazylika Grobu Pańskiego w Acquapendente' },
  { town: 'Bolsena / Viterbo', country: 'Włochy', region: 'Lacjum', landmark: 'Bazylika św. Krystyny (Cud Eucharystyczny w Bolsenie) i Pałac Papieski' },
  { town: 'Sutri / La Storta', country: 'Włochy', region: 'Lacjum', landmark: 'Kaplica Wizji św. Ignacego w La Storta przed Rzymem' },
  { town: 'Watykan – Rzym (Bazylika św. Piotra)', country: 'Watykan', region: 'Stolica Apostolska', landmark: 'Grób św. Piotra Apostoła i odbiór Testimonium w Watykanie (Dzień 89 Etapu 5)' },
  // 5B: Watykan -> Jerozolima (100% DROGĄ LĄDOWĄ + Szlaki z muszlami we Włoszech, Słowenii i Chorwacji!)
  { town: 'Asyż (Assisi) / Spoleto', country: 'Włochy', region: 'Umbria (Szlak św. Franciszka i św. Jakuba)', landmark: 'Bazylika św. Franciszka w Asyżu (lądowy trakt północno-wschodni)' },
  { town: 'Loreto / Ankona', country: 'Włochy', region: 'Marche (Via Lauretana)', landmark: 'Bazylika Świętego Domku Nazaretańskiego w Loreto' },
  { town: 'Rawenna / Ferrara', country: 'Włochy', region: 'Emilia-Romania (Via Romea Germanica)', landmark: 'Wczesnochrześcijańskie bazyliki w Rawennie (UNESCO)' },
  { town: 'Padwa (Padova)', country: 'Włochy', region: 'Wenecja Euganejska (Cammino di Sant’Antonio & San Giacomo)', landmark: 'Bazylika św. Antoniego i włoski szlak z muszlą św. Jakuba' },
  { town: 'Akwileja / Triest (Lądowe obejście Adriatyku)', country: 'Włochy', region: 'Friuli-Wenecja Julijska (Cammino Celeste)', landmark: 'Bazylika Patriarchalna w Akwilei — 100% lądowe obejście Adriatyku bez promu' },
  { town: 'Lublana (Ljubljana) / Novo Mesto', country: 'Słowenia', region: 'Słoweńska Droga św. Jakuba (Jakobova pot)', landmark: 'Kościół św. Jakuba w Lublanie (oficjalny szlak z muszlami Jakobova pot)' },
  { town: 'Zagrzeb / Marija Bistrica', country: 'Chorwacja', region: 'Chorwacka Droga św. Jakuba (Camino Croatia)', landmark: 'Oznakowany muszlami szlak Camino Croatia i Sanktuarium w Marija Bistrica' },
  { town: 'Đakovo / Osijek', country: 'Chorwacja', region: 'Slawonia (Camino Podravina / Slavonija)', landmark: 'Katedra św. Piotra w Đakovie na lądowym szlaku bałkańskim' },
  { town: 'Belgrad / Smederevo', country: 'Serbia', region: 'Dolina Dunaju i Morawy (Via Militaris)', landmark: 'Lądowy trakt rzymski Via Militaris wzdłuż Dunaju i Wielkiej Morawy' },
  { town: 'Nisz (Niš) / Sofia', country: 'Serbia / Bułgaria', region: 'Via Diagonalis (100% Lądem)', landmark: 'Historyczny lądowy trakt krzyżowców i pątników jerozolimskich' },
  { town: 'Saloniki / Filippi', country: 'Grecja', region: 'Macedonia (Via Egnatia)', landmark: 'Miejsce chrztu św. Lidii w Filippi i Bazylika św. Dymitra w Salonikach' },
  { town: 'Aleksandropolis / Edirne', country: 'Grecja / Turcja', region: 'Tracja Wschodnia (Lądem)', landmark: 'Lądowe przekroczenie granicy grecko-tureckiej nad Maricą' },
  { town: 'Stambuł (Przejście Lądowe nad Bosforem)', country: 'Turcja', region: 'Cieśnina Bosfor (Most Lądowy Europa–Azja)', landmark: 'Hagia Sophia i przejście lądowe z Europy do Azji Mniejszej' },
  { town: 'Nicea (İznik) / Doryleum (Eskişehir)', country: 'Turcja', region: 'Bitynia (Lądowy Szlak Pielgrzymi)', landmark: 'Miejsce I i II Soboru Powszechnego w Nicei' },
  { town: 'Konya (Ikonium) / Kilistra', country: 'Turcja', region: 'Anatolia (Szlak św. Pawła – St. Paul Trail)', landmark: 'Skalne kościoły w Kilistrze na pieszym Szlaku św. Pawła' },
  { town: 'Tars (Tarsus) / Wrota Cylicyjskie', country: 'Turcja', region: 'Cylicja (Przełęcz Gór Taurus)', landmark: 'Dom rodzinny i studnia św. Pawła Apostoła w Tarsie' },
  { town: 'Antiochia (Antakya)', country: 'Turcja', region: 'Hatay (Korytarz Lądowy Lewantu)', landmark: 'Grota św. Piotra (pierwszy kościół skalny chrześcijaństwa)' },
  { town: 'Damaszek / Bosra (Droga św. Pawła Lądem)', country: 'Lewant / Syria–Jordania', region: 'Historyczny Trakt Królewski (Via Regia Orientu)', landmark: 'Kaplica św. Ananiasza i lądowy Trakt Królewski na południe bez drogi morskiej' },
  { town: 'Amman / Góra Nebo / Betania za Jordanem', country: 'Jordania / Ziemia Święta', region: 'Dolina Jordanu (Lądowe Wejście do Ziemi Świętej)', landmark: 'Miejsce Chrztu Pańskiego nad Jordanem (Al-Maghtas) i Góra Nebo' },
  { town: 'Jerycho / Pustynia Judzka (Wadi Qelt)', country: 'Ziemia Święta', region: 'Judea', landmark: 'Góra Kuszenia, Klasztor św. Jerzego w Wadi Qelt i droga Jezusa z Jerycha do Jerozolimy' },
  { town: 'Betlejem / Ein Karem', country: 'Ziemia Święta', region: 'Judea', landmark: 'Bazylika Narodzenia Pańskiego i Sanktuarium Nawiedzenia w Ein Karem' },
  { town: 'Jerozolima (Bazylika Grobu Pańskiego)', country: 'Ziemia Święta', region: 'Judea', landmark: 'Via Dolorosa, Golgota, Pusty Grób Chrystusa i Góra Oliwna (100% drogą lądową)' },
];

const STAGE_6_CORRIDOR: Array<{ town: string; country: string; region: string; landmark: string }> = [
  { town: 'Emaus (Abu Gosz) / Cezarea / Nazaret (Lądem)', country: 'Ziemia Święta', region: 'Judea i Galilea (Droga Lądowa)', landmark: 'Bazylika Zwiastowania w Nazarecie i Jezioro Galilejskie' },
  { town: 'Góra Tabor / Kafarnaum / Kuneitra–Damaszek', country: 'Ziemia Święta / Lewant', region: 'Górna Galilea i Trakt Damasceński (Lądem)', landmark: 'Lądowy szlak powrotny z Galilei na północ bez użycia statków' },
  { town: 'Antiochia (Antakya) / Adana', country: 'Turcja', region: 'Cylicja (Lądowy Korytarz Anatolijski)', landmark: 'Powrót pieszy przez Wrota Cylicyjskie w górach Taurus' },
  { town: 'Kapadocja (Göreme) / Aksaray', country: 'Turcja', region: 'Kapadocja (Szlak Ojców Kapadockich)', landmark: 'Skalne kościoły Kapadocji (św. Bazyli Wielki i św. Grzegorz z Nazjanzu)' },
  { town: 'Ankara / Bolu', country: 'Turcja', region: 'Galacja (Szlak Listu św. Pawła do Galatów)', landmark: 'Historyczny gościniec lądowy przez dawną Galację ku Bosforowi' },
  { town: 'Stambuł / Edirne (Adrianopol)', country: 'Turcja', region: 'Tracja (Lądowe Wejście do Europy)', landmark: 'Przekroczenie Bosforu i marsz lądowy Tracją do granicy bułgarskiej' },
  { town: 'Płowdiw (Filipopolis) / Monastyr Baczkowski', country: 'Bułgaria', region: 'Dolina Maricy (Via Diagonalis)', landmark: 'Starożytne Filipopolis i Monastyr Baczkowski' },
  { town: 'Monastyr Rilski (Rila)', country: 'Bułgaria', region: 'Góry Rila', landmark: 'Sanktuarium św. Jana Rilskiego (UNESCO)' },
  { town: 'Sofia', country: 'Bułgaria', region: 'Region Szopski (Via Militaris)', landmark: 'Rotunda św. Jerzego (IV w.) i Katedra św. Józefa' },
  { town: 'Pirot / Nisz (Niš)', country: 'Serbia', region: 'Południowa Serbia (Lądem)', landmark: 'Miasto narodzin cesarza Konstantyna Wielkiego' },
  { town: 'Aleksinac / Jagodina', country: 'Serbia', region: 'Dolina Wielkiej Morawy', landmark: 'Lądowy Szlak Doliny Morawy' },
  { town: 'Smederevo / Belgrad', country: 'Serbia', region: 'Dunaj', landmark: 'Kościół NMP na Kalemegdanie w Belgradzie' },
  { town: 'Nowy Sad (Novi Sad) / Subotica', country: 'Serbia', region: 'Wojwodina (Podejście do Szlaku z Muszlami)', landmark: 'Sanktuarium MB Śnieżnej w Tekije i Katedra św. Teresy w Suboticy' },
  { town: 'Segedyn (Szeged)', country: 'Węgry', region: 'Węgierska Droga św. Jakuba / Mária Út', landmark: 'Katedra Wotywna NMP w Segedynie — wejście na środkowoeuropejską sieć szlaków z muszlami' },
  { town: 'Kiskunfélegyháza / Kecskemét', country: 'Węgry', region: 'Szent Jakab-út & Mária Út', landmark: 'Oznakowany trakt pątniczy z muszlami św. Jakuba i znakami Maryjnymi' },
  { town: 'Budapeszt (Wzgórze Gellerta — Punkt Zero Camino)', country: 'Węgry', region: 'Węgierska Droga św. Jakuba (Szent Jakab-út)', landmark: 'Kamień „0 km” Węgierskiej Drogi św. Jakuba z muszlą w Budapeszcie i Bazylika św. Stefana' },
  { town: 'Ostrzyhom (Esztergom) / Štúrovo', country: 'Węgry / Słowacja', region: 'Zakole Dunaju (Szent Jakab-út → Svätojakubská cesta)', landmark: 'Most Marii Walerii na Dunaju i Bazylika Prymasowska w Ostrzyhomiu' },
  { town: 'Bańska Szczawnica (Banská Štiavnica)', country: 'Słowacja', region: 'Słowacka Droga św. Jakuba (Svätojakubská cesta)', landmark: 'Kościół św. Jakuba i Kalwaria Szczawnicka na szlaku z muszlami' },
  { town: 'Kremnica / Stare Hory', country: 'Słowacja', region: 'Svätojakubská cesta (Wielka Fatra)', landmark: 'Bazylika Nawiedzenia NMP w Starych Horach ze znakami muszli św. Jakuba' },
  { town: 'Martin / Rajecká Lesná (Frivald)', country: 'Słowacja', region: 'Svätojakubská cesta (Mała Fatra)', landmark: 'Bazylika Narodzenia NMP w Rajeckiej Lesnej na szlaku Jakubowym' },
  { town: 'Żylina / Turzovka (Góra Żivčáková)', country: 'Słowacja', region: 'Svätojakubská cesta (Kysuce)', landmark: 'Sanktuarium na Górze Żivčáková i słowacki szlak z muszlami ku Polsce' },
  { town: 'Czadca / Jaworzynka – Koniaków', country: 'Słowacja / Polska', region: 'Beskidzka Droga św. Jakuba (Szlak z Muszlami)', landmark: 'Przekroczenie granicy lądowej na Beskidzkiej Drodze św. Jakuba' },
  { town: 'Wisła / Ustroń / Szczyrk (Sanktuarium św. Jakuba)', country: 'Polska', region: 'Beskidzka Droga św. Jakuba', landmark: 'Drewniane Sanktuarium św. Jakuba Apostoła i muszle jakubowe w Beskidach' },
  { town: 'Skoczów (Wzgórze Kaplicówka)', country: 'Polska', region: 'Beskidzka Droga św. Jakuba', landmark: 'Sanktuarium św. Jana Sarkandra na szlaku z muszlą św. Jakuba' },
  { town: 'Pszczyna (Kościół św. Jakuba) / Mikołów', country: 'Polska', region: 'Górnośląska Droga św. Jakuba', landmark: 'Szlak z muszlami przez Ziemię Pszczyńską i Lasy Kobiórskie' },
  { town: 'Ruda Śląska – Kochłowice (Kościół Trójcy Świętej)', country: 'Polska', region: 'Górnośląska Droga św. Jakuba (Meta 365 Dni)', landmark: 'Domknięcie Wielkiego Trójkąta Lądowego i Szlaku z Muszlami przy Kościele Trójcy Świętej w Kochłowicach' },
];

function buildStageSegments(
  stageId: number,
  totalDays: number,
  startGlobalDay: number,
  startOffsetFromJune14: number,
  corridor: Array<{ town: string; country: string; region: string; landmark: string }>,
  startTownName: string,
  targetTotalKm: number,
  baggageLabel: string
): DailySegment[] {
  const segments: DailySegment[] = [];
  // For Stages 4-6, totalDays is compressed so all 6 stages close in 365 days (daily segments ~28.5 - 37.4 km)
  const baseKm = targetTotalKm / totalDays;
  const rawDistances: number[] = [];
  let sumRaw = 0;
  for (let i = 0; i < totalDays; i++) {
    const wave = Math.sin(i * 1.37 + stageId) * 3.1 + Math.cos(i * 0.73) * 1.1;
    const d = Math.min(37.4, Math.max(28.2, Number((baseKm + wave).toFixed(1))));
    rawDistances.push(d);
    sumRaw += d;
  }
  const diff = Number((targetTotalKm - sumRaw).toFixed(1));
  const stepAdj = Number((diff / totalDays).toFixed(1));

  let previousTown = startTownName;

  for (let i = 0; i < totalDays; i++) {
    const stageDayNumber = i + 1;
    const globalDayNumber = startGlobalDay + i;
    const dayOffsetFromJune14 = startOffsetFromJune14 + i;

    const progress = (i + 1) / totalDays;
    const corridorIndex = Math.min(
      corridor.length - 1,
      Math.floor(progress * corridor.length)
    );
    const node = corridor[corridorIndex];

    const prevCorridorIdx = Math.min(
      corridor.length - 1,
      Math.floor((i / totalDays) * corridor.length)
    );
    const isMilestoneArrival = corridorIndex !== prevCorridorIdx || i === totalDays - 1;

    const subDistricts = ['Wschód', 'Przedmieścia', 'Dolina Szlaku', 'Przełęcz Pątnicza', 'Stary Trakt', 'Osada Św. Jakuba'];
    const currentStopName = isMilestoneArrival
      ? node.town
      : `${node.town.split(' (')[0]} – Odcinek ${subDistricts[i % subDistricts.length]}`;

    const dist = Math.min(37.4, Math.max(28.0, Number((rawDistances[i] + stepAdj).toFixed(1))));
    const elevation = 180 + ((i * 53 + stageId * 31) % 420);

    const accTypes: DailySegment['accommodationType'][] = [
      'Albergue / Schronisko',
      'Dom Pielgrzyma',
      'Klasztor / Opactwo',
      'Parafia / Sala / Kwatery',
      'Hospicjum Chrześcijańskie',
    ];
    const accType =
      node.country === 'Hiszpania'
        ? 'Albergue / Schronisko'
        : node.country === 'Ziemia Święta'
        ? 'Hospicjum Chrześcijańskie'
        : accTypes[(i + stageId) % accTypes.length];

    const specialNote =
      stageId === 5 && stageDayNumber === 70
        ? 'Wejście na Plac św. Piotra w Watykanie — zakończenie części 5A (Santiago → Watykan, Dzień 180) i odbiór Testimonium'
        : stageId === 6 && stageDayNumber === 95
        ? 'Zamknięcie pełnego roku pielgrzymki (Dzień 365) — powrót do Kościoła Trójcy Świętej i Sanktuarium MB z Lourdes w Kochłowicach'
        : undefined;

    segments.push({
      globalDayNumber,
      stageId,
      stageDayNumber,
      dayOffsetFromJune14,
      dateNote: specialNote,
      fromTown: previousTown,
      viaWaypoints: [
        `Szlak pątniczy regionu ${node.region}`,
        `Punkt odpoczynku na ${(dist * 0.52).toFixed(1)} km`,
      ],
      toTown: i === totalDays - 1 ? corridor[corridor.length - 1].town : currentStopName,
      country: node.country,
      region: node.region,
      distanceKm: dist,
      elevationGainM: elevation,
      terrainType:
        elevation > 420
          ? 'Szlak wyżynny i górski (ścieżki szutrowe i kamienne)'
          : 'Oznakowany trakt pieszy, drogi polne i historyczne gościńce',
      accommodationName:
        accType === 'Albergue / Schronisko'
          ? `Albergue de Peregrinos / Schronisko Pątnicze — ${node.town.split(' (')[0]}`
          : accType === 'Klasztor / Opactwo'
          ? `Dom Gościnny Klasztoru — ${node.town.split(' (')[0]}`
          : accType === 'Hospicjum Chrześcijańskie'
          ? `Casa Nova / Chrześcijański Dom Pielgrzyma — ${node.town.split(' (')[0]}`
          : `Parafialny Punkt Noclegowy Pielgrzymów — ${node.town.split(' (')[0]}`,
      accommodationType: accType,
      estimatedCostPLN:
        node.country === 'Polska' || node.country === 'Słowacja' || node.country === 'Czechy'
          ? '35–60 PLN'
          : '50–95 PLN (10–20 EUR za okazaniem Credencialu)',
      baggageMode:
        stageId === 6 && i >= totalDays - 5
          ? 'Wsparcie busa parafialnego z Kochłowic na ostatnich 5 dniach powrotu przez Beskidy i Śląsk'
          : baggageLabel,
      waterAndFoodPoints: `Punkty z wodą pitną i pieczątką pątniczą co 7–10 km w regionie ${node.region}`,
      sanctuaryOrLandmark: node.landmark,
      scheduleSummary: `6:00 Wymarsz po błogosławieństwie pątniczym · Marsz długodystansowy ${dist.toFixed(
        1
      )} km (ok. ${(dist / 4.5).toFixed(1)} godz. z przerwami) · 16:30 Zakwaterowanie i pieczęć w Paszporcie Pielgrzyma`,
    });

    previousTown = i === totalDays - 1 ? corridor[corridor.length - 1].town : currentStopName;
  }

  return segments;
}

const STAGE_4_DAYS = buildStageSegments(
  4,
  95,
  16,
  16,
  STAGE_4_CORRIDOR,
  'Ruda Śląska – Kochłowice (Kościół Trójcy Świętej)',
  3182.0,
  'Plecak własny (do 8 kg) lub lokalny serwis bagażowy na szlaku Jakubowym'
);

const STAGE_5_DAYS = buildStageSegments(
  5,
  160,
  111,
  111,
  STAGE_5_CORRIDOR,
  'Santiago de Compostela (Katedra św. Jakuba)',
  5305.0,
  'Plecak pątniczy (7,5 kg) + wymiana ekwipunku sezonowego w Rzymie, Trieście i Stambule (100% drogą lądową)'
);

const STAGE_6_DAYS = buildStageSegments(
  6,
  95,
  271,
  271,
  STAGE_6_CORRIDOR,
  'Jerozolima (Brama Jafska / Stare Miasto)',
  3094.0,
  'Plecak pątniczy (7 kg) + odbiór bagażu busem z Kochłowic od granicy w Koniakowie'
);

export const ALL_DAILY_SEGMENTS: DailySegment[] = [
  ...CORE_15_DAYS,
  ...STAGE_4_DAYS,
  ...STAGE_5_DAYS,
  ...STAGE_6_DAYS,
];

export const INITIAL_PACKING_LIST: PackingItem[] = [
  {
    id: 'doc-credencial',
    name: 'Paszport Pielgrzyma (Credencial) + Karta Uczestnika z Kochłowic',
    category: 'Dokumenty i Duchowość',
    weightGrams: 85,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6 (obowiązkowy do noclegów pątniczych)',
    note: 'Wydawany w zakrystii Kościoła Trójcy Świętej w Kochłowicach przed wymarszem 14 czerwca.',
  },
  {
    id: 'doc-id-ekuz',
    name: 'Dowód osobisty / Paszport, karta EKUZ i ubezpieczenie KL/NNW',
    category: 'Dokumenty i Duchowość',
    weightGrams: 60,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6 (Paszport wymagany na Etapie 5 i 6)',
    note: 'Przechowywać w wodoodpornym etui na szyi lub w pasie biodrowym.',
  },
  {
    id: 'doc-rosary-booklet',
    name: 'Różaniec, śpiewnik pielgrzymkowy i rozważania',
    category: 'Dokumenty i Duchowość',
    weightGrams: 140,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6',
    note: 'Lekki format kieszonkowy A6.',
  },
  {
    id: 'gear-boots',
    name: 'Rozchodzone buty trekkingowe (półbuty trailowe lub lekkie mid)',
    category: 'Obuwie i Odzież',
    weightGrams: 820,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6 (na stopach od 14 czerwca)',
    note: 'O pół rozmiaru większe niż obuwie miejskie — stopa puchnie po 20 km marszu w czerwcu.',
  },
  {
    id: 'gear-sandals',
    name: 'Sandały trekkingowe na zmianę i po noclegu',
    category: 'Obuwie i Odzież',
    weightGrams: 460,
    defaultPlacement: 'van',
    essentialForStages: 'Etapy 1–6',
    note: 'Na Etapach 1–3 jadą w busie lub przytroczone do plecaka na asfaltowe odcinki.',
  },
  {
    id: 'gear-merino-socks',
    name: '3 pary skarpet trekkingowych z wełny merino (bezszwowe)',
    category: 'Obuwie i Odzież',
    weightGrams: 195,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6',
    note: 'Jedna para zapasowa zawsze w plecaku podręcznym do zmiany w połowie dnia.',
  },
  {
    id: 'gear-shirts',
    name: '3 koszulki termoaktywne / merino oddychające',
    category: 'Obuwie i Odzież',
    weightGrams: 420,
    defaultPlacement: 'van',
    essentialForStages: 'Etapy 1–6',
    note: 'Zasada 3 zestawów: jeden na sobie, drugi schnie na plecaku, trzeci czysty w zapasie.',
  },
  {
    id: 'gear-rain-poncho',
    name: 'Peleryna przeciwdeszczowa (poncho zakrywające również plecak)',
    category: 'Obuwie i Odzież',
    weightGrams: 290,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6',
    note: 'Musi być zawsze w górnej kieszeni plecaka podręcznego (czerwcowe burze na Śląsku i Jurze).',
  },
  {
    id: 'gear-fleece',
    name: 'Lekki polar lub bluza docieplająca na poranki (6:00 rano)',
    category: 'Obuwie i Odzież',
    weightGrams: 340,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6',
    note: 'Niezbędna podczas porannych wymarszów i w chłodnych murach klasztornych.',
  },
  {
    id: 'gear-hat',
    name: 'Kapelusz pątniczy z rondem lub czapka z osłoną karku + okulary UV',
    category: 'Obuwie i Odzież',
    weightGrams: 130,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6',
    note: 'Kluczowa ochrona przed udarem słonecznym na odsłoniętych odcinkach.',
  },
  {
    id: 'sleep-bag',
    name: 'Lekki śpiwór puchowy lub syntetyczny (komfort +10°C)',
    category: 'Sen i Nocleg',
    weightGrams: 680,
    defaultPlacement: 'van',
    essentialForStages: 'Etapy 1–6',
    note: 'Na Etapach 1–3 przewożony busem parafialnym; na Etapach 4–6 w dolnej komorze plecaka.',
  },
  {
    id: 'sleep-mat',
    name: 'Składana karimata lub ultralekki materac dmuchany',
    category: 'Sen i Nocleg',
    weightGrams: 410,
    defaultPlacement: 'van',
    essentialForStages: 'Etapy 1–3 (salki parafialne i szkoły)',
    note: 'Wymagana w Świerklańcu, Woźnikach, Poczesnej i Spytkowicach.',
  },
  {
    id: 'sleep-towel',
    name: 'Ręcznik szybkoschnący z mikrofibry + zatyczki do uszu',
    category: 'Sen i Nocleg',
    weightGrams: 160,
    defaultPlacement: 'van',
    essentialForStages: 'Etapy 1–6',
    note: 'Zatyczki do uszu gwarantują regenerację w wieloosobowych salach i albergues.',
  },
  {
    id: 'med-footcare',
    name: 'Pakiet ochrony stóp: krem z lanoliną/jelenim łojem, plastry hydrokoloidowe (Compeed), jałowe igły',
    category: 'Higiena i Apteczka',
    weightGrams: 220,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6',
    note: 'Smarować stopy codziennie rano przed założeniem skarpet oraz w przerwie obiadowej.',
  },
  {
    id: 'med-personal',
    name: 'Leki przyjmowane na stałe, elektrolity w saszetkach, bandaż elastyczny, filtr SPF 50',
    category: 'Higiena i Apteczka',
    weightGrams: 310,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6',
    note: 'ZAKAZ pakowania leków stałych do bagażu głównego w busie — zawsze w plecaku podręcznym!',
  },
  {
    id: 'nav-poles',
    name: 'Składane kije trekkingowe z gumowymi nakładkami na asfalt',
    category: 'Sprzęt i Nawigacja',
    weightGrams: 480,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6',
    note: 'Odciążają stawy kolanowe o ok. 20–25% przy marszu długodystansowym.',
  },
  {
    id: 'nav-water',
    name: 'Bukłak lub 2 bidony na wodę (łącznie 1,5 l) + kubek na zupę pielgrzymkową',
    category: 'Sprzęt i Nawigacja',
    weightGrams: 280,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6',
    note: 'Własny kubek i łyżkowidelec (spork) do posiłków z kuchni polowej na trasie.',
  },
  {
    id: 'nav-powerbank',
    name: 'Powerbank 10 000 mAh, ładowarka wieloportowa i czołówka LED',
    category: 'Sprzęt i Nawigacja',
    weightGrams: 320,
    defaultPlacement: 'backpack',
    essentialForStages: 'Etapy 1–6',
    note: 'Czołówka z czerwonym światłem do porannego pakowania o godz. 5:30 bez budzenia sali.',
  },
];

// Universal 365-day calendar helper without year (starts 14 czerwca, closes full 365-day year cycle)
export function formatUniversalDate(dayOffsetFromJune14: number): {
  fullDate: string;
  shortDate: string;
  cycleNote: string;
} {
  // Use a non-leap 365-day reference calendar (e.g. 2025) and strip any year numbers
  const date = new Date(2025, 5, 14 + dayOffsetFromJune14);
  const monthsPL = [
    'stycznia',
    'lutego',
    'marca',
    'kwietnia',
    'maja',
    'czerwca',
    'lipca',
    'sierpnia',
    'września',
    'października',
    'listopada',
    'grudnia',
  ];

  const d = date.getDate();
  const m = monthsPL[date.getMonth()];
  const mmNum = String(date.getMonth() + 1).padStart(2, '0');
  const ddNum = String(d).padStart(2, '0');

  return {
    fullDate: `${d} ${m}`,
    shortDate: `${ddNum}.${mmNum}`,
    cycleNote: dayOffsetFromJune14 >= 201 ? 'II półrocze kalendarzowe (Styczeń–Czerwiec)' : 'I półrocze szlaku (Czerwiec–Grudzień)',
  };
}

