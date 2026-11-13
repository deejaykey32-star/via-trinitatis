import { ElevationPoint, GearPair, JournalEntry, PhaseId, PhaseInfo, StageDay } from '../types/expedition';

export const PHASES: PhaseInfo[] = [
  {
    id: 1,
    name: 'Faza I: Pętla Polska',
    shortName: 'Pętla Polska',
    dayStart: 1,
    dayEnd: 14,
    description: 'Kochłowice (Wizyta 1) → Jasna Góra → Pustynia Błędowska (21.06) → Ojców (23.06) → Łagiewniki → Kochłowice (Wizyta 2).',
    routeSummary: 'Kochłowice – Częstochowa – Ojców – Kraków – Kochłowice',
    accentColor: '#eab308',
  },
  {
    id: 2,
    name: 'Faza II: Via Regia & Camino',
    shortName: 'Camino de Santiago',
    dayStart: 15,
    dayEnd: 135,
    description: 'Kochłowice → Piekary Śląskie → szlak Via Regia przez Polskę, Niemcy i Francję → Camino Francés do Santiago de Compostela.',
    routeSummary: 'Piekary Śląskie – Görlitz – Paryż – Pireneje – Santiago',
    accentColor: '#1e3a8a',
  },
  {
    id: 3,
    name: 'Faza III: Via Francigena do Rzymu',
    shortName: 'Via Francigena',
    dayStart: 136,
    dayEnd: 225,
    description: 'Santiago de Compostela → Północna Hiszpania → Południowa Francja → Alpy → włoski szlak Via Francigena → Watykan.',
    routeSummary: 'Santiago – Pireneje – Arles – Alpy – Siena – Watykan',
    accentColor: '#2563eb',
  },
  {
    id: 4,
    name: 'Faza IV: Do Ziemi Świętej (100% lądem)',
    shortName: 'Rzym → Jerozolima',
    dayStart: 226,
    dayEnd: 290,
    description: 'Watykan → Asyż → Triest → Wybrzeże Adriatyku → Saloniki → Stambuł → Anatolia → Lewant → Jerozolima (0% promów, wyłącznie pieszo).',
    routeSummary: 'Watykan – Asyż – Triest – Dubrownik – Saloniki – Stambuł – Jerozolima',
    accentColor: '#ca8a04',
  },
  {
    id: 5,
    name: 'Faza V: Powrót Bałkanami do Domu',
    shortName: 'Powrót do Kochłowic',
    dayStart: 291,
    dayEnd: 365,
    description: 'Jerozolima → Dolina Jordanu → Ankara → Stambuł → Bułgaria → Serbia → Węgry → Słowacja → Kochłowice (Wizyta 3, Dzień 365).',
    routeSummary: 'Jerozolima – Ankara – Stambuł – Sofia – Budapeszt – Kochłowice',
    accentColor: '#0f766e',
  },
];

const MONTHS_PL = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
];

export function getDateForExpeditionDay(dayNumber: number): { dateLabel: string; fullDateLabel: string } {
  // Day 1 = June 14 (non-leap reference 2026-06-14 -> 2027-06-13 = 365 days)
  const start = new Date(Date.UTC(2026, 5, 14));
  const d = new Date(start.getTime() + (dayNumber - 1) * 86400000);
  const dd = d.getUTCDate();
  const mm = d.getUTCMonth();
  const padD = dd < 10 ? `0${dd}` : `${dd}`;
  const padM = mm + 1 < 10 ? `0${mm + 1}` : `${mm + 1}`;
  return {
    dateLabel: `${padD}.${padM}`,
    fullDateLabel: `${dd} ${MONTHS_PL[mm]}`,
  };
}

function generateElevationProfile(
  dayNumber: number,
  plannedKm: number,
  gainM: number,
  lossM: number,
  baseEle: number,
  fromName: string,
  toName: string
): ElevationPoint[] {
  const steps = 20;
  const pts: ElevationPoint[] = [];
  let currentEle = baseEle;
  const netDelta = gainM - lossM;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const km = Number((plannedKm * t).toFixed(2));
    // Deterministic terrain wave seeded by dayNumber
    const wave1 = Math.sin(t * Math.PI * (2 + (dayNumber % 3)) + dayNumber * 0.7);
    const wave2 = Math.cos(t * Math.PI * 5 + dayNumber * 1.3) * 0.35;
    const amplitude = Math.max(25, (gainM + lossM) * 0.16);
    const ele = Math.round(baseEle + netDelta * t + (wave1 + wave2) * amplitude * Math.sin(t * Math.PI));
    currentEle = Math.max(5, ele);

    let label: string | undefined;
    if (i === 0) label = fromName;
    else if (i === steps) label = toName;
    else if (i === Math.floor(steps / 2)) label = 'Półmetek etapu';

    pts.push({ km, ele: currentEle, label });
  }
  return pts;
}

interface RawWaypoint {
  day: number;
  name: string;
  coords: [number, number];
  ele: number;
  symbolism?: string;
}

// Detailed first 15 days (14.06 – 28.06)
const DETAILED_DAYS_1_TO_15: Array<{
  day: number;
  phaseId: PhaseId;
  fromName: string;
  toName: string;
  fromCoords: [number, number];
  toCoords: [number, number];
  plannedKm: number;
  gainM: number;
  lossM: number;
  baseEle: number;
  symbolism?: string;
  milestone?: boolean;
}> = [
  {
    day: 1,
    phaseId: 1,
    fromName: 'Kochłowice (Kościół Trójcy Świętej)',
    toName: 'Tarnowskie Góry',
    fromCoords: [50.2547, 18.8936],
    toCoords: [50.4442, 18.8556],
    plannedKm: 24.5,
    gainM: 185,
    lossM: 145,
    baseEle: 268,
    symbolism: 'Triada Kochłowicka – Wizyta I (Wielki Start 365-dniowej wyprawy)',
    milestone: true,
  },
  {
    day: 2,
    phaseId: 1,
    fromName: 'Tarnowskie Góry',
    toName: 'Koszęcin',
    fromCoords: [50.4442, 18.8556],
    toCoords: [50.6317, 18.8553],
    plannedKm: 23.0,
    gainM: 175,
    lossM: 165,
    baseEle: 305,
  },
  {
    day: 3,
    phaseId: 1,
    fromName: 'Koszęcin',
    toName: 'Herby',
    fromCoords: [50.6317, 18.8553],
    toCoords: [50.7425, 18.8594],
    plannedKm: 19.5,
    gainM: 160,
    lossM: 145,
    baseEle: 295,
  },
  {
    day: 4,
    phaseId: 1,
    fromName: 'Herby',
    toName: 'Wręczyca Wielka',
    fromCoords: [50.7425, 18.8594],
    toCoords: [50.8389, 18.9261],
    plannedKm: 18.0,
    gainM: 150,
    lossM: 135,
    baseEle: 280,
  },
  {
    day: 5,
    phaseId: 1,
    fromName: 'Wręczyca Wielka',
    toName: 'Częstochowa – Jasna Góra',
    fromCoords: [50.8389, 18.9261],
    toCoords: [50.8125, 19.0972],
    plannedKm: 17.5,
    gainM: 185,
    lossM: 155,
    baseEle: 270,
    symbolism: 'Pokłon na Jasnej Górze (18.06) – Królowej Polski',
    milestone: true,
  },
  {
    day: 6,
    phaseId: 1,
    fromName: 'Częstochowa – Jasna Góra',
    toName: 'Olsztyn – Złoty Potok',
    fromCoords: [50.8125, 19.0972],
    toCoords: [50.7069, 19.4352],
    plannedKm: 28.5,
    gainM: 310,
    lossM: 255,
    baseEle: 295,
    symbolism: 'Wejście na Szlak Orlich Gniazd',
  },
  {
    day: 7,
    phaseId: 1,
    fromName: 'Złoty Potok',
    toName: 'Mirów – Bobolice – Ogrodzieniec',
    fromCoords: [50.7069, 19.4352],
    toCoords: [50.4533, 19.5528],
    plannedKm: 31.0,
    gainM: 420,
    lossM: 345,
    baseEle: 365,
    symbolism: 'Góra Janowskiego i zamki Orlich Gniazd',
  },
  {
    day: 8,
    phaseId: 1,
    fromName: 'Podzamcze – Ogrodzieniec',
    toName: 'Pustynia Błędowska (Róża Wiatrów)',
    fromCoords: [50.4533, 19.5528],
    toCoords: [50.3439, 19.5150],
    plannedKm: 22.0,
    gainM: 260,
    lossM: 315,
    baseEle: 455,
    symbolism: 'Przesilenie Letnie (21.06) na Pustyni Błędowskiej – najdłuższy dzień roku',
    milestone: true,
  },
  {
    day: 9,
    phaseId: 1,
    fromName: 'Pustynia Błędowska',
    toName: 'Olkusz – Sułoszowa',
    fromCoords: [50.3439, 19.5150],
    toCoords: [50.2672, 19.7347],
    plannedKm: 24.5,
    gainM: 310,
    lossM: 250,
    baseEle: 330,
  },
  {
    day: 10,
    phaseId: 1,
    fromName: 'Sułoszowa (Pieskowa Skała)',
    toName: 'Ojców (Dolina Prądnika)',
    fromCoords: [50.2672, 19.7347],
    toCoords: [50.2108, 19.8286],
    plannedKm: 18.5,
    gainM: 225,
    lossM: 295,
    baseEle: 390,
    symbolism: 'Dzień Ojca w Ojcowie! (23.06) – Dolina Prądnika i Brama Krakowska',
    milestone: true,
  },
  {
    day: 11,
    phaseId: 1,
    fromName: 'Ojców',
    toName: 'Kraków – Wawel',
    fromCoords: [50.2108, 19.8286],
    toCoords: [50.0540, 19.9354],
    plannedKm: 22.0,
    gainM: 195,
    lossM: 295,
    baseEle: 315,
    symbolism: 'Katedra Wawelska i Stare Miasto w Krakowie',
  },
  {
    day: 12,
    phaseId: 1,
    fromName: 'Kraków – Wawel',
    toName: 'Kraków – Łagiewniki (Sanktuarium)',
    fromCoords: [50.0540, 19.9354],
    toCoords: [50.0203, 19.9369],
    plannedKm: 16.5,
    gainM: 145,
    lossM: 135,
    baseEle: 215,
    symbolism: 'Sanktuarium Bożego Miłosierdzia w Krakowie-Łagiewnikach (25.06)',
    milestone: true,
  },
  {
    day: 13,
    phaseId: 1,
    fromName: 'Kraków – Łagiewniki',
    toName: 'Tyniec – Alwernia – Chrzanów',
    fromCoords: [50.0203, 19.9369],
    toCoords: [50.1386, 19.4022],
    plannedKm: 34.5,
    gainM: 320,
    lossM: 280,
    baseEle: 220,
    symbolism: 'Opactwo Benedyktynów w Tyńcu i klasztor w Alwerni',
  },
  {
    day: 14,
    phaseId: 1,
    fromName: 'Chrzanów – Jaworzno',
    toName: 'Kochłowice (Kościół Trójcy Świętej)',
    fromCoords: [50.1386, 19.4022],
    toCoords: [50.2547, 18.8936],
    plannedKm: 33.5,
    gainM: 240,
    lossM: 260,
    baseEle: 275,
    symbolism: 'Triada Kochłowicka – Wizyta II (Zamknięcie Pętli Polskiej 27.06)',
    milestone: true,
  },
  {
    day: 15,
    phaseId: 2,
    fromName: 'Kochłowice (Kościół Trójcy Świętej)',
    toName: 'Piekary Śląskie (Bazylika)',
    fromCoords: [50.2547, 18.8936],
    toCoords: [50.3806, 18.9478],
    plannedKm: 21.0,
    gainM: 195,
    lossM: 175,
    baseEle: 268,
    symbolism: 'Start Fazy II – Sanktuarium Matki Sprawiedliwości w Piekarach Śląskich',
    milestone: true,
  },
];

// Anchor waypoints for Days 15 to 365 across Europe, Mediterranean, and Levant
const MACRO_WAYPOINTS: RawWaypoint[] = [
  // Phase II: Piekary Śląskie -> Via Regia -> Camino de Santiago (Days 15-135)
  { day: 15, name: 'Piekary Śląskie', coords: [50.3806, 18.9478], ele: 290 },
  { day: 21, name: 'Góra Świętej Anny', coords: [50.4567, 18.1672], ele: 380, symbolism: 'Sanktuarium na Górze Świętej Anny' },
  { day: 27, name: 'Wrocław (Ostrów Tumski)', coords: [51.1144, 17.0462], ele: 120, symbolism: 'Katedra Wrocławska – Szlak Via Regia' },
  { day: 34, name: 'Zgorzelec / Görlitz', coords: [51.1528, 14.9872], ele: 210, symbolism: 'Przekroczenie granicy na Nysie Łużyckiej' },
  { day: 39, name: 'Drezno', coords: [51.0504, 13.7373], ele: 115 },
  { day: 44, name: 'Lipsk', coords: [51.3397, 12.3731], ele: 118 },
  { day: 50, name: 'Erfurt', coords: [50.9848, 11.0299], ele: 205 },
  { day: 56, name: 'Fulda', coords: [50.5558, 9.6808], ele: 265, symbolism: 'Grób św. Bonifacego w Fuldzie' },
  { day: 61, name: 'Frankfurt nad Menem', coords: [50.1109, 8.6821], ele: 112 },
  { day: 67, name: 'Metz', coords: [49.1193, 6.1757], ele: 175, symbolism: 'Wejście do Francji – Lotaryngia' },
  { day: 74, name: 'Reims', coords: [49.2583, 4.0317], ele: 90, symbolism: 'Katedra w Reims' },
  { day: 81, name: 'Paryż (Wieża św. Jakuba)', coords: [48.8579, 2.3489], ele: 42, symbolism: 'Tour Saint-Jacques – Via Turonensis' },
  { day: 90, name: 'Tours', coords: [47.3941, 0.6848], ele: 55 },
  { day: 98, name: 'Poitiers', coords: [46.5802, 0.3404], ele: 115 },
  { day: 106, name: 'Bordeaux', coords: [44.8378, -0.5792], ele: 20 },
  { day: 114, name: 'Saint-Jean-Pied-de-Port', coords: [43.1631, -1.2381], ele: 170, symbolism: 'Brama Pirenejów – start Camino Francés' },
  { day: 116, name: 'Roncesvalles / Pampeluna', coords: [42.8125, -1.6458], ele: 450, symbolism: 'Przejście przez Pireneje (1430 m n.p.m.)' },
  { day: 123, name: 'Burgos', coords: [42.3439, -3.6969], ele: 856, symbolism: 'Katedra w Burgos i Meseta' },
  { day: 129, name: 'León', coords: [42.5987, -5.5671], ele: 837 },
  { day: 135, name: 'Santiago de Compostela', coords: [42.8806, -8.5444], ele: 260, symbolism: 'Katedra św. Jakuba – Koniec Fazy II!' },

  // Phase III: Santiago -> Via Francigena -> Rzym / Watykan (Days 135-225)
  { day: 144, name: 'Oviedo (Camino Primitivo)', coords: [43.3619, -5.8494], ele: 230 },
  { day: 152, name: 'Bilbao', coords: [43.2630, -2.9350], ele: 25 },
  { day: 160, name: 'Lourdes', coords: [43.0915, -0.0457], ele: 410, symbolism: 'Sanktuarium w Lourdes u podnóża Pirenejów' },
  { day: 168, name: 'Tuluza', coords: [43.6047, 1.4442], ele: 145 },
  { day: 176, name: 'Montpellier', coords: [43.6108, 3.8767], ele: 35 },
  { day: 181, name: 'Arles (Via Aurelia)', coords: [43.6766, 4.6278], ele: 18 },
  { day: 190, name: 'Przełęcz Montgenèvre (Alpy)', coords: [44.9311, 6.7239], ele: 1850, symbolism: 'Przekroczenie Alp pieszo – wejście do Włoch' },
  { day: 195, name: 'Turyn', coords: [45.0703, 7.6869], ele: 240 },
  { day: 202, name: 'Piacenza (Via Francigena)', coords: [45.0526, 9.6930], ele: 61 },
  { day: 210, name: 'Lukka', coords: [43.8429, 10.5027], ele: 19 },
  { day: 215, name: 'Siena', coords: [43.3188, 11.3308], ele: 322, symbolism: 'Piazza del Campo – Serce Toskanii na Via Francigena' },
  { day: 220, name: 'Viterbo', coords: [42.4207, 12.1077], ele: 326 },
  { day: 225, name: 'Watykan – Plac św. Piotra', coords: [41.9022, 12.4539], ele: 35, symbolism: 'Bazylika św. Piotra w Watykanie – Koniec Fazy III!' },

  // Phase IV: Watykan -> Asyż -> Bałkany -> Anatolia -> Jerozolima (100% pieszo lądem, Days 225-290)
  { day: 230, name: 'Asyż (Bazylika św. Franciszka)', coords: [43.0707, 12.6196], ele: 424, symbolism: 'Umbria – szlak św. Franciszka w drodze na wschód' },
  { day: 235, name: 'Rimini', coords: [44.0678, 12.5695], ele: 10 },
  { day: 241, name: 'Triest', coords: [45.6495, 13.7768], ele: 20, symbolism: 'Wejście na Półwysep Bałkański pieszo wzdłuż Adriatyku' },
  { day: 248, name: 'Split', coords: [43.5081, 16.4402], ele: 15 },
  { day: 253, name: 'Dubrownik', coords: [42.6507, 18.0944], ele: 25, symbolism: 'Dalmacja – pieszo wzdłuż wybrzeża Adriatyku' },
  { day: 259, name: 'Tirana', coords: [41.3275, 19.8187], ele: 110 },
  { day: 265, name: 'Saloniki', coords: [40.6401, 22.9444], ele: 25, symbolism: 'Via Egnatia – szlak apostoła Pawła' },
  { day: 272, name: 'Stambuł (Przejście Bosforskie)', coords: [41.0082, 28.9784], ele: 40, symbolism: 'Piesze przejście z Europy do Azji' },
  { day: 278, name: 'Konya', coords: [37.8746, 32.4932], ele: 1016 },
  { day: 282, name: 'Adana', coords: [37.0000, 35.3213], ele: 25 },
  { day: 287, name: 'Nazaret', coords: [32.6996, 35.3035], ele: 350, symbolism: 'Bazylika Zwiastowania w Nazarecie – Ziemia Święta pieszo!' },
  { day: 290, name: 'Jerozolima (Bazylika Grobu Pańskiego)', coords: [31.7785, 35.2296], ele: 750, symbolism: 'Święte Miasto Jerozolima – 100% pieszo osiągnięte!' },

  // Phase V: Jerozolima -> Anatolia -> Bałkany -> Węgry -> Słowacja -> Kochłowice (Days 290-365)
  { day: 296, name: 'Tyberiada (Jezioro Galilejskie)', coords: [32.7922, 35.5312], ele: -200 },
  { day: 303, name: 'Gaziantep', coords: [37.0662, 37.3833], ele: 850, symbolism: 'Powrotny szlak lądowy przez południową Anatolię' },
  { day: 312, name: 'Ankara', coords: [39.9334, 32.8597], ele: 938 },
  { day: 322, name: 'Stambuł (Cieśnina Bosfor)', coords: [41.0082, 28.9784], ele: 40, symbolism: 'Powrót pieszo na kontynent europejski' },
  { day: 332, name: 'Sofia', coords: [42.6977, 23.3219], ele: 550 },
  { day: 340, name: 'Belgrad', coords: [44.7866, 20.4489], ele: 117 },
  { day: 349, name: 'Budapeszt', coords: [47.4979, 19.0402], ele: 102, symbolism: 'Bazylika św. Stefana nad Dunajem' },
  { day: 356, name: 'Bańska Bystrzyca (Słowacja)', coords: [48.7363, 19.1462], ele: 362 },
  { day: 361, name: 'Żylina', coords: [49.2231, 18.7394], ele: 342 },
  { day: 363, name: 'Cieszyn (Most Przyjaźni)', coords: [49.7493, 18.6332], ele: 270, symbolism: 'Powrót do Polski na ostatnią prostą!' },
  { day: 365, name: 'Kochłowice (Kościół Trójcy Świętej)', coords: [50.2547, 18.8936], ele: 268, symbolism: 'Triada Kochłowicka – Wizyta III (Wielki Finał 365 Dni Marszu! 13.06)' },
];

function getPhaseForDay(day: number): PhaseId {
  if (day <= 14) return 1;
  if (day <= 135) return 2;
  if (day <= 225) return 3;
  if (day <= 290) return 4;
  return 5;
}

export function buildInitialStages(currentDayNumber = 10): StageDay[] {
  const stages: StageDay[] = [];

  // 1. Add Days 1..15 in full hand-crafted precision
  for (const d of DETAILED_DAYS_1_TO_15) {
    const dates = getDateForExpeditionDay(d.day);
    const status =
      d.day < currentDayNumber
        ? 'completed'
        : d.day === currentDayNumber
        ? 'current'
        : 'planned';

    const completedMainKm =
      status === 'completed'
        ? d.plannedKm
        : status === 'current'
        ? Number((d.plannedKm * 0.42).toFixed(1))
        : 0;
    const completedExploreKm = status === 'completed' ? 1.8 : status === 'current' ? 0.6 : 0;

    stages.push({
      dayNumber: d.day,
      dateLabel: dates.dateLabel,
      fullDateLabel: dates.fullDateLabel,
      phaseId: d.phaseId,
      fromName: d.fromName,
      toName: d.toName,
      fromCoords: d.fromCoords,
      toCoords: d.toCoords,
      plannedKm: d.plannedKm,
      completedMainKm,
      completedExploreKm,
      elevationGainM: d.gainM,
      elevationLossM: d.lossM,
      stepsCount: Math.round((completedMainKm + completedExploreKm) * 1350),
      status,
      symbolism: d.symbolism,
      milestone: d.milestone,
      elevationProfile: generateElevationProfile(
        d.day,
        d.plannedKm,
        d.gainM,
        d.lossM,
        d.baseEle,
        d.fromName,
        d.toName
      ),
    });
  }

  // 2. Interpolate Days 16..365 between MACRO_WAYPOINTS
  for (let day = 16; day <= 365; day++) {
    // Find surrounding anchor points
    let prevAnchor = MACRO_WAYPOINTS[0];
    let nextAnchor = MACRO_WAYPOINTS[MACRO_WAYPOINTS.length - 1];

    for (let i = 0; i < MACRO_WAYPOINTS.length - 1; i++) {
      if (day > MACRO_WAYPOINTS[i].day && day <= MACRO_WAYPOINTS[i + 1].day) {
        prevAnchor = MACRO_WAYPOINTS[i];
        nextAnchor = MACRO_WAYPOINTS[i + 1];
        break;
      }
    }

    const spanDays = Math.max(1, nextAnchor.day - prevAnchor.day);
    const tPrev = (day - 1 - prevAnchor.day) / spanDays;
    const tNext = (day - prevAnchor.day) / spanDays;

    const fromCoords: [number, number] = [
      Number((prevAnchor.coords[0] + (nextAnchor.coords[0] - prevAnchor.coords[0]) * tPrev).toFixed(4)),
      Number((prevAnchor.coords[1] + (nextAnchor.coords[1] - prevAnchor.coords[1]) * tPrev).toFixed(4)),
    ];
    const toCoords: [number, number] = [
      Number((prevAnchor.coords[0] + (nextAnchor.coords[0] - prevAnchor.coords[0]) * tNext).toFixed(4)),
      Number((prevAnchor.coords[1] + (nextAnchor.coords[1] - prevAnchor.coords[1]) * tNext).toFixed(4)),
    ];

    const isStartOfSegment = day - 1 === prevAnchor.day;
    const isEndOfSegment = day === nextAnchor.day;

    const fromName = isStartOfSegment
      ? prevAnchor.name
      : `Odcinek ${prevAnchor.name.split(' ')[0]} → ${nextAnchor.name.split(' ')[0]} (km ${(day - prevAnchor.day - 1) * 26})`;
    const toName = isEndOfSegment
      ? nextAnchor.name
      : `Punkt etapowy ${nextAnchor.name.split(' ')[0]} #${day - prevAnchor.day}`;

    // Realistic daily walking distance ~24–31 km (slightly lower in high mountains)
    const baseKm = 24 + ((day * 7) % 8) + ((day % 3) * 0.5);
    const plannedKm = Number(baseKm.toFixed(1));

    const fromEle = Math.round(prevAnchor.ele + (nextAnchor.ele - prevAnchor.ele) * tPrev);
    const toEle = Math.round(prevAnchor.ele + (nextAnchor.ele - prevAnchor.ele) * tNext);
    const isMountain = Math.max(fromEle, toEle) > 700;
    const gainM = (isMountain ? 580 : 210) + ((day * 37) % 190);
    const lossM = Math.max(30, gainM - (toEle - fromEle));

    const dates = getDateForExpeditionDay(day);
    const status =
      day < currentDayNumber
        ? 'completed'
        : day === currentDayNumber
        ? 'current'
        : 'planned';

    const completedMainKm = status === 'completed' ? plannedKm : 0;
    const completedExploreKm = status === 'completed' ? 1.2 : 0;

    stages.push({
      dayNumber: day,
      dateLabel: dates.dateLabel,
      fullDateLabel: dates.fullDateLabel,
      phaseId: getPhaseForDay(day),
      fromName,
      toName,
      fromCoords,
      toCoords,
      plannedKm,
      completedMainKm,
      completedExploreKm,
      elevationGainM: gainM,
      elevationLossM: lossM,
      stepsCount: Math.round((completedMainKm + completedExploreKm) * 1350),
      status,
      symbolism: isEndOfSegment ? nextAnchor.symbolism : undefined,
      milestone: isEndOfSegment && Boolean(nextAnchor.symbolism),
      elevationProfile: generateElevationProfile(day, plannedKm, gainM, lossM, fromEle, fromName, toName),
    });
  }

  return stages;
}

export function buildInitialJournalEntries(): Record<number, JournalEntry> {
  return {
    1: {
      dayNumber: 1,
      updatedAt: '2026-06-14T20:15:00.000Z',
      stampTitle: 'Parafia Trójcy Świętej',
      stampLocation: 'Ruda Śląska – Kochłowice',
      trailPhotos: [],
      spiritualNote: 'Rozpoczęcie 365-dniowej pielgrzymki wyłącznie pieszo. Pierwsze błogosławieństwo przed wyjściem na szlak.',
      shelterName: 'Dom Pielgrzyma Tarnowskie Góry',
      shelterRating: 5,
      footCondition: 5,
      recoveryNote: 'Stopy w świetnej formie, profilaktyczne plastrowanie pięt.',
      expenseAmount: 65,
      expenseCurrency: 'PLN',
    },
    5: {
      dayNumber: 5,
      updatedAt: '2026-06-18T21:00:00.000Z',
      stampTitle: 'Sanktuarium Jasna Góra',
      stampLocation: 'Częstochowa',
      trailPhotos: [],
      spiritualNote: 'Wejście na Jasną Górę przed Apelem Jasnogórskim 18 czerwca. Ogromna wdzięczność za bezpieczne pierwsze 102 km.',
      shelterName: 'Dom Pielgrzyma im. św. Jana Pawła II',
      shelterRating: 5,
      footCondition: 4,
      recoveryNote: 'Lekkie zmęczenie łydek po asfalcie przed Częstochową, chłodzenie w zimnej wodzie.',
      expenseAmount: 95,
      expenseCurrency: 'PLN',
    },
    8: {
      dayNumber: 8,
      updatedAt: '2026-06-21T21:40:00.000Z',
      stampTitle: 'Róża Wiatrów – Pustynia Błędowska',
      stampLocation: 'Klucze',
      trailPhotos: [],
      spiritualNote: 'Przesilenie Letnie na piaskach Pustyni Błędowskiej! Marsz w słońcu wymagał 4 litrów wody, ale zachód słońca był niezapomniany.',
      shelterName: 'Gościniec u Leśnika, Klucze',
      shelterRating: 4,
      footCondition: 4,
      recoveryNote: 'Piasek w butach – dokładne mycie stóp i smarowanie kremem regenerującym.',
      expenseAmount: 110,
      expenseCurrency: 'PLN',
    },
  };
}

export function buildInitialGear(): GearPair[] {
  return [
    {
      id: 'gear-1',
      name: 'Altra Lone Peak 8 (Para #1)',
      brand: 'Altra Running',
      loggedKm: 234.0,
      maxRecommendedKm: 800,
      active: true,
      startedDay: 1,
    },
    {
      id: 'gear-2',
      name: 'Salomon X Ultra 4 GTX (Zapas na Alpy)',
      brand: 'Salomon',
      loggedKm: 0,
      maxRecommendedKm: 950,
      active: false,
      startedDay: 150,
    },
  ];
}
