import React, { useState, useEffect, useMemo } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  Navigation,
  Footprints,
  Route as RouteIcon,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { DailySegment } from '../data/pilgrimageData';

export interface StageGeoWaypoint {
  id: string;
  stageId: number;
  dayNumber: number;
  dateLabel: string;
  name: string;
  subtitle: string;
  caminoTrailName: string;
  lat: number;
  lng: number;
  distanceKm: number;
  accommodation: string;
  isTriangleVertex?: boolean;
  isSpecialHighlight?: boolean;
}

export interface NavigationPreset {
  id: string;
  stageId: number;
  label: string;
  shortLabel: string;
  caminoShellTrail: string;
  description: string;
  origin: string;
  destination: string;
  intermediates: string[];
  expectedDistanceKm: number;
  daysLabel: string;
  color: string;
  boundsCenter: { lat: number; lng: number };
  boundsZoom: number;
}

export const STAGE_COLORS: Record<
  number,
  { hex: string; badgeBg: string; badgeText: string; name: string; shellTrail: string }
> = {
  1: {
    hex: '#065F46',
    badgeBg: 'bg-emerald-900',
    badgeText: 'text-white',
    name: 'Etap 1: Kochłowice → Jasna Góra (Bok I Małego Trójkąta)',
    shellTrail: 'Górnośląska i Jasnogórska Droga św. Jakuba (przez Sączów)',
  },
  2: {
    hex: '#B45309',
    badgeBg: 'bg-amber-700',
    badgeText: 'text-white',
    name: 'Etap 2: Jasna Góra → Pustynia Błędowska → Ojców → Łagiewniki (Bok II)',
    shellTrail: 'Jurajska Droga św. Jakuba + Via Regia (Olkusz – Ojców – Giebułtów – Kraków)',
  },
  3: {
    hex: '#1D4ED8',
    badgeBg: 'bg-blue-700',
    badgeText: 'text-white',
    name: 'Etap 3: Kraków-Łagiewniki → Kochłowice (Bok III Małego Trójkąta)',
    shellTrail: 'Małopolska i Oświęcimska Droga św. Jakuba Via Regia (przez Bieruń Stary)',
  },
  4: {
    hex: '#047857',
    badgeBg: 'bg-emerald-700',
    badgeText: 'text-white',
    name: 'Etap 4: Kochłowice → Santiago de Compostela (Bok I Wielkiego Trójkąta)',
    shellTrail: '100% Szlak z Muszlami: Via Regia → Svatojakubská → Jakobsweg → Via Jacobi → GR65 → Camino Francés',
  },
  5: {
    hex: '#991B1B',
    badgeBg: 'bg-red-800',
    badgeText: 'text-white',
    name: 'Etap 5: Santiago → Watykan → Jerozolima (Bok II · 100% Drogą Lądową)',
    shellTrail: 'Camino del Norte / Via Tolosana → Via Francigena → Jakobova pot & Camino Croatia → Lądem przez Bosfor',
  },
  6: {
    hex: '#4338CA',
    badgeBg: 'bg-indigo-700',
    badgeText: 'text-white',
    name: 'Etap 6: Jerozolima → Kochłowice (Bok III · 100% Lądem i Szlakiem z Muszlami)',
    shellTrail: 'Korytarz Lądowy Anatolii i Bałkanów → Szent Jakab-út (Węgry) → Svätojakubská (Słowacja) → Beskidzka Droga św. Jakuba',
  },
};

export const STAGE_POLYLINE_PATHS: Record<number, Array<{ lat: number; lng: number }>> = {
  // ETAP 1: Kochłowice -> Jasna Góra (Górnośląska i Jasnogórska Droga św. Jakuba z muszlami, 100% lądem)
  1: [
    { lat: 50.2584, lng: 18.9752 }, // Kochłowice - Kościół Trójcy Świętej
    { lat: 50.3052, lng: 18.9615 }, // Chorzów Stary
    { lat: 50.3792, lng: 18.9461 }, // Piekary Śląskie - Bazylika NMP (węzeł Drogi św. Jakuba)
    { lat: 50.4314, lng: 18.9482 }, // Świerklaniec
    { lat: 50.4278, lng: 19.0631 }, // Sączów - Kościół św. Jakuba Apostoła (Szlak z muszlami!)
    { lat: 50.5882, lng: 19.0594 }, // Woźniki
    { lat: 50.7281, lng: 19.1492 }, // Poczesna
    { lat: 50.8122, lng: 19.0971 }, // Częstochowa - Jasna Góra (i kościół św. Jakuba)
  ],
  // ETAP 2: Jasna Góra -> Pustynia Błędowska -> Ojców (Dzień Ojca) -> Kraków-Łagiewniki (Jurajska Droga św. Jakuba + Via Regia)
  2: [
    { lat: 50.8122, lng: 19.0971 }, // Jasna Góra
    { lat: 50.7511, lng: 19.2694 }, // Olsztyn k. Częstochowy
    { lat: 50.7051, lng: 19.4352 }, // Złoty Potok / Żarki (Jurajska Droga św. Jakuba)
    { lat: 50.6143, lng: 19.4791 }, // Mirów / Bobolice
    { lat: 50.5682, lng: 19.5664 }, // Kroczyce
    { lat: 50.4671, lng: 19.6562 }, // Pilica
    { lat: 50.3548, lng: 19.5214 }, // Chechło - Pustynia Błędowska (Róża Wiatrów)
    { lat: 50.3389, lng: 19.5612 }, // Klucze (Czubatka - Pustynia Błędowska)
    { lat: 50.2791, lng: 19.5598 }, // Olkusz - Bazylika św. Andrzeja (Szlak z muszlami Via Regia!)
    { lat: 50.2442, lng: 19.7801 }, // Sułoszowa / Pieskowa Skała (Droga św. Jakuba Via Regia)
    { lat: 50.2114, lng: 19.8302 }, // Ojców - Kaplica Na Wodzie (Pobyt w Dzień Ojca 23.06 na szlaku z muszlami)
    { lat: 50.1419, lng: 19.8742 }, // Giebułtów - kościół św. Idziego (Małopolska Droga św. Jakuba)
    { lat: 50.0192, lng: 19.8021 }, // Opactwo Benedyktynów w Tyńcu
    { lat: 50.0201, lng: 19.9372 }, // Kraków-Łagiewniki - Sanktuarium Bożego Miłosierdzia
  ],
  // ETAP 3: Kraków-Łagiewniki -> Kochłowice (Południowy szlak z muszlami Via Regia / Oświęcimska i Górnośląska Droga św. Jakuba)
  3: [
    { lat: 50.0201, lng: 19.9372 }, // Kraków-Łagiewniki
    { lat: 49.9751, lng: 19.8284 }, // Skawina (Droga św. Jakuba)
    { lat: 49.9912, lng: 19.5071 }, // Spytkowice
    { lat: 50.0341, lng: 19.2102 }, // Oświęcim-Harmęże (Oświęcimska Droga św. Jakuba)
    { lat: 50.0904, lng: 19.0928 }, // Bieruń Stary (Sanktuarium św. Walentego ze znakami muszli Via Regia)
    { lat: 50.1692, lng: 18.9031 }, // Mikołów (Bazylika św. Wojciecha)
    { lat: 50.2584, lng: 18.9752 }, // Kochłowice - Kościół Trójcy Świętej
  ],
  // ETAP 4: Kochłowice -> Santiago de Compostela (100% Szlak z Muszlami św. Jakuba i 100% Drogą Lądową)
  4: [
    { lat: 50.2584, lng: 18.9752 }, // Kochłowice (Górnośląska Droga św. Jakuba)
    { lat: 50.2945, lng: 18.6714 }, // Gliwice (Via Regia)
    { lat: 50.0914, lng: 18.2192 }, // Racibórz
    { lat: 49.9387, lng: 17.9026 }, // Opawa (Svatojakubská cesta)
    { lat: 49.5938, lng: 17.2509 }, // Ołomuniec (Czechy - Svatojakubská cesta)
    { lat: 49.1951, lng: 16.6068 }, // Brno
    { lat: 49.1842, lng: 15.4528 }, // Telč (Kościół św. Jakuba)
    { lat: 48.8127, lng: 14.3175 }, // Český Krumlov
    { lat: 48.5667, lng: 13.4319 }, // Pasawa (Niemcy - Ostbayerischer Jakobsweg)
    { lat: 49.0134, lng: 12.1016 }, // Ratyzbona (Kościół Szkocki św. Jakuba)
    { lat: 48.4011, lng: 9.9876 },  // Ulm (Oberschwäbischer Jakobsweg)
    { lat: 47.6593, lng: 8.8592 },  // Stein am Rhein (100% lądowe obejście Jeziora Bodeńskiego)
    { lat: 47.6603, lng: 9.1758 },  // Konstancja (Via Jacobi)
    { lat: 47.2266, lng: 8.8184 },  // Rapperswil (kładka pątnicza Heilig Hüsli)
    { lat: 47.1281, lng: 8.7512 },  // Einsiedeln (Szwajcaria - Via Jacobi)
    { lat: 46.8065, lng: 7.1620 },  // Fryburg
    { lat: 46.5197, lng: 6.6323 },  // Lozanna
    { lat: 46.2044, lng: 6.1432 },  // Genewa (Via Gebennensis)
    { lat: 45.0428, lng: 3.8831 },  // Le Puy-en-Velay (Francja - Via Podiensis GR65)
    { lat: 44.5992, lng: 2.3968 },  // Conques
    { lat: 44.1053, lng: 1.0844 },  // Moissac
    { lat: 43.1631, lng: -1.2381 }, // Saint-Jean-Pied-de-Port
    { lat: 42.8125, lng: -1.6458 }, // Pampeluna (Hiszpania - Camino Francés)
    { lat: 42.3439, lng: -3.6969 }, // Burgos
    { lat: 42.5987, lng: -5.5671 }, // León
    { lat: 42.4589, lng: -6.0560 }, // Astorga / Cruz de Ferro
    { lat: 42.8805, lng: -8.5456 }, // Santiago de Compostela (Katedra św. Jakuba)
  ],
  // ETAP 5: Santiago -> Watykan -> Jerozolima (100% DROGĄ LĄDOWĄ bez promów + Szlaki z muszlami!)
  5: [
    // 5A: Santiago -> Watykan (Camino del Norte / Via Tolosana GR653 / Via Francigena)
    { lat: 42.8805, lng: -8.5456 }, // Santiago de Compostela
    { lat: 43.3619, lng: -5.8494 }, // Oviedo (Camino del Norte / Primitivo)
    { lat: 43.3183, lng: -1.9812 }, // San Sebastián
    { lat: 43.0951, lng: -0.0457 }, // Lourdes (Voie du Piémont Pyrénéen z muszlami)
    { lat: 43.6047, lng: 1.4442 },  // Tuluza (Via Tolosana GR653)
    { lat: 43.6108, lng: 3.8767 },  // Montpellier
    { lat: 43.6768, lng: 4.6278 },  // Arles (Via Tolosana)
    { lat: 43.7102, lng: 7.2620 },  // Nicea
    { lat: 44.4056, lng: 8.9463 },  // Genua
    { lat: 43.8430, lng: 10.5027 }, // Lukka (Włochy - Via Francigena)
    { lat: 43.3188, lng: 11.3308 }, // Siena
    { lat: 42.4207, lng: 12.1077 }, // Viterbo
    { lat: 41.9022, lng: 12.4539 }, // Watykan - Bazylika św. Piotra (Rzym)
    // 5B: Watykan -> Jerozolima (100% LĄDEM wokół Adriatyku przez Padwę, Triest, Lublanę [Jakobova pot], Zagrzeb [Camino Croatia], Saloniki, Stambuł i Antiochię!)
    { lat: 43.0707, lng: 12.6196 }, // Asyż (Assisi)
    { lat: 43.4404, lng: 13.6074 }, // Loreto
    { lat: 44.4184, lng: 12.2035 }, // Rawenna
    { lat: 45.4064, lng: 11.8768 }, // Padwa (Cammino di Sant'Antonio & San Giacomo)
    { lat: 45.6495, lng: 13.7768 }, // Triest / Akwileja (100% lądowe obejście Adriatyku bez promu!)
    { lat: 46.0569, lng: 14.5058 }, // Lublana (Słoweńska Droga św. Jakuba - Jakobova pot z muszlami!)
    { lat: 45.8150, lng: 15.9819 }, // Zagrzeb (Chorwacka Droga św. Jakuba - Camino Croatia z muszlami!)
    { lat: 45.5550, lng: 18.6955 }, // Osijek / Đakovo (Camino Podravina)
    { lat: 44.7866, lng: 20.4489 }, // Belgrad (Via Militaris lądem)
    { lat: 42.6977, lng: 23.3219 }, // Sofia
    { lat: 40.6401, lng: 22.9444 }, // Saloniki (Grecja - Via Egnatia)
    { lat: 41.0131, lng: 24.2872 }, // Filippi
    { lat: 40.8457, lng: 25.8739 }, // Aleksandropolis
    { lat: 41.0082, lng: 28.9784 }, // Stambuł (Przejście lądowe nad Bosforem z Europy do Azji)
    { lat: 40.4286, lng: 29.7211 }, // Nicea (İznik)
    { lat: 37.8714, lng: 32.4846 }, // Konya (Ikonium - Szlak św. Pawła)
    { lat: 36.9165, lng: 34.8952 }, // Tars (Tarsus)
    { lat: 36.2021, lng: 36.1601 }, // Antiochia (Antakya)
    { lat: 33.5138, lng: 36.2765 }, // Damaszek (Trakt Królewski lądem - bez morza!)
    { lat: 31.9539, lng: 35.9106 }, // Amman / Betania za Jordanem
    { lat: 31.8611, lng: 35.4618 }, // Jerycho
    { lat: 31.7784, lng: 35.2296 }, // Jerozolima - Bazylika Grobu Pańskiego
  ],
  // ETAP 6: Jerozolima -> Kochłowice (100% DROGĄ LĄDOWĄ + Węgierski, Słowacki i Beskidzki Szlak z Muszlami św. Jakuba!)
  6: [
    { lat: 31.7784, lng: 35.2296 }, // Jerozolima
    { lat: 32.7021, lng: 35.2978 }, // Nazaret / Galilea (lądem)
    { lat: 33.5138, lng: 36.2765 }, // Damaszek
    { lat: 36.2021, lng: 36.1601 }, // Antiochia (Antakya)
    { lat: 37.0000, lng: 35.3213 }, // Adana / Wrota Cylicyjskie
    { lat: 38.6431, lng: 34.8289 }, // Kapadocja (Göreme)
    { lat: 39.9334, lng: 32.8597 }, // Ankara (Galacja)
    { lat: 41.0082, lng: 28.9784 }, // Stambuł (Przejście lądowe nad Bosforem)
    { lat: 41.6771, lng: 26.5557 }, // Edirne
    { lat: 42.1354, lng: 24.7453 }, // Płowdiw (Bułgaria)
    { lat: 42.1334, lng: 23.3402 }, // Monastyr Rilski
    { lat: 42.6977, lng: 23.3219 }, // Sofia
    { lat: 43.3209, lng: 21.8958 }, // Nisz (Serbia)
    { lat: 44.7866, lng: 20.4489 }, // Belgrad
    { lat: 45.2671, lng: 19.8335 }, // Nowy Sad
    { lat: 46.2530, lng: 20.1414 }, // Segedyn (Węgry - Węgierska Droga św. Jakuba / Mária Út)
    { lat: 47.4979, lng: 19.0402 }, // Budapeszt (Kamień 0 km Szent Jakab-út z muszlą!)
    { lat: 47.7928, lng: 18.7364 }, // Ostrzyhom (Esztergom)
    { lat: 48.4589, lng: 18.8931 }, // Bańska Szczawnica (Słowacka Droga św. Jakuba - Svätojakubská cesta z muszlami!)
    { lat: 49.2231, lng: 18.7394 }, // Żylina (Svätojakubská cesta)
    { lat: 49.4384, lng: 18.7883 }, // Czadca / Jaworzynka (Beskidzka Droga św. Jakuba z muszlami!)
    { lat: 49.6552, lng: 18.8591 }, // Wisła / Szczyrk (Sanktuarium św. Jakuba)
    { lat: 49.9781, lng: 18.9419 }, // Pszczyna (Górnośląska Droga św. Jakuba)
    { lat: 50.2584, lng: 18.9752 }, // Kochłowice - Kościół Trójcy Świętej (Domknięcie 365 dni)
  ],
};

export const KEY_MAP_WAYPOINTS: StageGeoWaypoint[] = [
  // Etap 1
  {
    id: 'wp-kochlowice',
    stageId: 1,
    dayNumber: 1,
    dateLabel: '14 czerwca (Start) / 29.06 / 14.06 (Dzień 365)',
    name: 'Kochłowice – Kościół Trójcy Świętej i Sanktuarium MB z Lourdes',
    subtitle: 'Wspólny Wierzchołek I Obu Trójkątów Pątniczych (Ruda Śląska)',
    caminoTrailName: 'Górnośląska i Jasnogórska Droga św. Jakuba (Szlak z muszlami)',
    lat: 50.2584,
    lng: 18.9752,
    distanceKm: 0,
    accommodation: 'Parafia Trójcy Świętej w Kochłowicach (punkt startu i mety)',
    isTriangleVertex: true,
  },
  {
    id: 'wp-piekary-saczow',
    stageId: 1,
    dayNumber: 1,
    dateLabel: '14–15 czerwca (Dzień 1–2)',
    name: 'Piekary Śląskie, Świerklaniec i Sączów (Kościół św. Jakuba)',
    subtitle: 'Bazylika NMP w Piekarach oraz romańsko-gotycki kościół św. Jakuba w Sączowie',
    caminoTrailName: 'Jasnogórska Droga św. Jakuba (żółta muszla na niebieskim tle)',
    lat: 50.4278,
    lng: 19.0631,
    distanceKm: 25.4,
    accommodation: 'Baza parafialna w Świerklańcu / Sączowie (25 PLN)',
  },
  {
    id: 'wp-wozniki',
    stageId: 1,
    dayNumber: 2,
    dateLabel: '15 czerwca (Dzień 2)',
    name: 'Woźniki Śląskie',
    subtitle: 'Kościół św. Katarzyny i drewniany kościół św. Walentego na szlaku jakubowym',
    caminoTrailName: 'Jasnogórska Droga św. Jakuba',
    lat: 50.5882,
    lng: 19.0594,
    distanceKm: 26.2,
    accommodation: 'Sala gimnastyczna SP i kwatery w Woźnikach (25 PLN)',
  },
  {
    id: 'wp-jasnagora',
    stageId: 1,
    dayNumber: 4,
    dateLabel: '17 czerwca (Dzień 4)',
    name: 'Częstochowa – Jasna Góra (i Kościół św. Jakuba)',
    subtitle: 'Wierzchołek II Małego Trójkąta Polskiego · Klasztor Ojców Paulinów',
    caminoTrailName: 'Węzeł Jasnogórskiej i Jurajskiej Drogi św. Jakuba',
    lat: 50.8122,
    lng: 19.0971,
    distanceKm: 96.0,
    accommodation: 'Dom Pielgrzyma im. św. Jana Pawła II na Jasnej Górze (70–95 PLN)',
    isTriangleVertex: true,
  },
  // Etap 2 (z Pustynią Błędowską i Dniem Ojca w Ojcowie)
  {
    id: 'wp-zlotypotok',
    stageId: 2,
    dayNumber: 5,
    dateLabel: '18 czerwca (Dzień 5)',
    name: 'Złoty Potok & Leśniów',
    subtitle: 'Szlak Orlich Gniazd i Jurajska Droga św. Jakuba · Sanktuarium MB Leśniowskiej',
    caminoTrailName: 'Jurajska Droga św. Jakuba (muszle pątnicze)',
    lat: 50.7051,
    lng: 19.4352,
    distanceKm: 26.8,
    accommodation: 'Szkolne Schronisko Młodzieżowe / Dom Pielgrzyma Leśniów (50 PLN)',
  },
  {
    id: 'wp-pilica',
    stageId: 2,
    dayNumber: 7,
    dateLabel: '20 czerwca (Dzień 7)',
    name: 'Ogrodzieniec & Pilica',
    subtitle: 'Zamek Ogrodzieniec i Klasztor OO. Franciszkanów w Pilicy',
    caminoTrailName: 'Jurajski trakt pątniczy ku Via Regia',
    lat: 50.4671,
    lng: 19.6562,
    distanceKm: 23.8,
    accommodation: 'Dom Zakonny OO. Franciszkanów w Pilicy-Biskupicach (45 PLN)',
  },
  {
    id: 'wp-pustynia-bledowska',
    stageId: 2,
    dayNumber: 8,
    dateLabel: '21 czerwca (Dzień 8)',
    name: 'Pustynia Błędowska (Róża Wiatrów – Klucze) → Olkusz (Via Regia)',
    subtitle: 'Piesze przejście przez Polską Saharę i wejście na główny szlak z muszlami w Olkuszu',
    caminoTrailName: 'Droga św. Jakuba Via Regia (Bazylika św. Andrzeja w Olkuszu)',
    lat: 50.3485,
    lng: 19.5382,
    distanceKm: 27.4,
    accommodation: 'Dom Parafialny przy Bazylice św. Andrzeja w Olkuszu na szlaku Via Regia (45 PLN)',
    isSpecialHighlight: true,
  },
  {
    id: 'wp-ojcow-dzien-ojca',
    stageId: 2,
    dayNumber: 9,
    dateLabel: '22–23 czerwca (Dzień 9–10 · Dzień Ojca)',
    name: 'Ojców – Pobyt w Dzień Ojca (23 czerwca) na Szlaku z Muszlami',
    subtitle: 'Kaplica „Na Wodzie” św. Józefa, Zamek w Ojcowie, Dolina Prądnika i Giebułtów',
    caminoTrailName: 'Droga św. Jakuba Via Regia / Małopolska Droga św. Jakuba',
    lat: 50.2114,
    lng: 19.8302,
    distanceKm: 22.8,
    accommodation: 'Dom Wycieczkowy PTTK „Zosia” i kwatery pątnicze w Ojcowie (65 PLN)',
    isSpecialHighlight: true,
  },
  {
    id: 'wp-tyniec',
    stageId: 2,
    dayNumber: 10,
    dateLabel: '23 czerwca wieczorem (Dzień 10)',
    name: 'Kraków-Tyniec (Opactwo Benedyktynów)',
    subtitle: 'Najstarszy klasztor benedyktyński w Polsce (1044 r.) na szlaku jakubowym',
    caminoTrailName: 'Małopolska Droga św. Jakuba (Tyniec – Kraków)',
    lat: 50.0192,
    lng: 19.8021,
    distanceKm: 24.2,
    accommodation: 'Dom Gościnny Opactwa Benedyktynów w Tyńcu (90 PLN)',
  },
  {
    id: 'wp-lagiewniki',
    stageId: 2,
    dayNumber: 11,
    dateLabel: '24–25 czerwca (Dzień 11)',
    name: 'Kraków-Łagiewniki (Sanktuarium Bożego Miłosierdzia)',
    subtitle: 'Wierzchołek III Małego Trójkąta Polskiego · Centrum Jana Pawła II',
    caminoTrailName: 'Węzeł Małopolskiej Drogi św. Jakuba i Via Regia',
    lat: 50.0201,
    lng: 19.9372,
    distanceKm: 16.5,
    accommodation: 'Dom Duszpasterski Sanktuarium Bożego Miłosierdzia w Łagiewnikach (95 PLN)',
    isTriangleVertex: true,
  },
  // Etap 3
  {
    id: 'wp-oswiecim',
    stageId: 3,
    dayNumber: 13,
    dateLabel: '27 czerwca (Dzień 13)',
    name: 'Oświęcim-Harmęże',
    subtitle: 'Centrum św. Maksymiliana Marii Kolbego na szlaku z muszlami w Dolinie Wisły',
    caminoTrailName: 'Oświęcimska Droga św. Jakuba (Via Regia – wariant południowy)',
    lat: 50.0341,
    lng: 19.2102,
    distanceKm: 26.8,
    accommodation: 'Dom Pielgrzyma OO. Franciszkanów w Harmężach (55 PLN)',
  },
  {
    id: 'wp-mikolow',
    stageId: 3,
    dayNumber: 14,
    dateLabel: '28 czerwca (Dzień 14)',
    name: 'Bieruń Stary (Kościół św. Walentego) & Mikołów',
    subtitle: 'Drewniane sanktuarium w Bieruniu ze znakami muszli św. Jakuba i Bazylika w Mikołowie',
    caminoTrailName: 'Górnośląska Droga św. Jakuba (Via Regia)',
    lat: 50.1692,
    lng: 18.9031,
    distanceKm: 25.9,
    accommodation: 'Salki przy Bazylice św. Wojciecha w Mikołowie (30 PLN)',
  },
  // Etap 4 (Bok I Wielkiego Trójkąta - 100% Szlak z Muszlami i Lądem)
  {
    id: 'wp-olomuniec',
    stageId: 4,
    dayNumber: 22,
    dateLabel: '6 lipca (Dzień 22)',
    name: 'Ołomuniec – Svatý Kopeček & Telč (Czechy)',
    subtitle: 'Kolumna Trójcy Świętej (UNESCO) i Kościół św. Jakuba w Telču',
    caminoTrailName: 'Czeska Droga św. Jakuba (Svatojakubská cesta)',
    lat: 49.5938,
    lng: 17.2509,
    distanceKm: 33.4,
    accommodation: 'Dom Pielgrzyma Matice Svatohostýnské / Svatý Kopeček (~60 PLN)',
  },
  {
    id: 'wp-einsiedeln',
    stageId: 4,
    dayNumber: 49,
    dateLabel: '2 sierpnia (Dzień 49)',
    name: 'Einsiedeln (Szwajcaria – lądem przez Stein am Rhein i Rapperswil)',
    subtitle: 'Opactwo Benedyktynów Czarnej Madonny na głównym szlaku jakubowym w Szwajcarii',
    caminoTrailName: 'Szwajcarska Droga św. Jakuba (Via Jacobi · szlak nr 4)',
    lat: 47.1281,
    lng: 8.7512,
    distanceKm: 34.0,
    accommodation: 'Pilgerherberge Einsiedeln (~90 PLN / Donativo)',
  },
  {
    id: 'wp-lepuy',
    stageId: 4,
    dayNumber: 67,
    dateLabel: '20 sierpnia (Dzień 67)',
    name: 'Le Puy-en-Velay (Francja)',
    subtitle: 'Historyczna stolica szlaku z muszlami Via Podiensis (GR65) do Pirenejów',
    caminoTrailName: 'Via Podiensis (GR65 · Chemin de Saint-Jacques)',
    lat: 45.0428,
    lng: 3.8831,
    distanceKm: 33.8,
    accommodation: 'Gîte d’étape Saint-François w Le Puy (~75 PLN)',
  },
  {
    id: 'wp-santiago',
    stageId: 4,
    dayNumber: 110,
    dateLabel: '2 października (Dzień 110)',
    name: 'Santiago de Compostela (Katedra św. Jakuba Apostoła)',
    subtitle: 'Wierzchołek II Wielkiego Trójkąta Kontynentalnego (Meta Etapu 4 · 3182 km)',
    caminoTrailName: 'Camino Francés (Główny Szlak z Muszlami św. Jakuba)',
    lat: 42.8805,
    lng: -8.5456,
    distanceKm: 33.5,
    accommodation: 'Seminario Menor de Belvís / Albergue de Peregrinos Santiago (~75 PLN)',
    isTriangleVertex: true,
  },
  // Etap 5 (Bok II Wielkiego Trójkąta - 100% Drogą Lądową + Szlaki z muszlami)
  {
    id: 'wp-lourdes',
    stageId: 5,
    dayNumber: 132,
    dateLabel: '24 października (Dzień 132)',
    name: 'Sanktuarium Matki Bożej w Lourdes (Francja)',
    subtitle: 'Duchowe bliźniacze sanktuarium Groty Lurdzkiej w Kochłowicach na szlaku z muszlami',
    caminoTrailName: 'Voie du Piémont Pyrénéen & Via Tolosana (GR653)',
    lat: 43.0951,
    lng: -0.0457,
    distanceKm: 33.2,
    accommodation: 'Village des Jeunes / Accueil Marie Saint-Frai w Lourdes (~85 PLN)',
    isSpecialHighlight: true,
  },
  {
    id: 'wp-watykan',
    stageId: 5,
    dayNumber: 180,
    dateLabel: '11 grudnia (Dzień 180)',
    name: 'Watykan – Bazylika św. Piotra w Rzymie',
    subtitle: 'Centralny punkt południowego boku Wielkiego Trójkąta (Via Francigena)',
    caminoTrailName: 'Via Francigena & Włoskie Drogi św. Jakuba (Cammino di San Giacomo)',
    lat: 41.9022,
    lng: 12.4539,
    distanceKm: 33.0,
    accommodation: 'Spedale della Provvidenza di San Giacomo i San Benedetto w Rzymie (Donativo)',
    isTriangleVertex: true,
  },
  {
    id: 'wp-lublana-zagrzeb',
    stageId: 5,
    dayNumber: 198,
    dateLabel: '29 grudnia (Dzień 198)',
    name: 'Triest → Lublana → Zagrzeb (Lądowe Obejście Adriatyku Szlakiem z Muszlami)',
    subtitle: '100% lądowe przejście bez promów morskich przez Słowenię i Chorwację',
    caminoTrailName: 'Słoweńska i Chorwacka Droga św. Jakuba (Jakobova pot & Camino Croatia)',
    lat: 45.8150,
    lng: 15.9819,
    distanceKm: 33.4,
    accommodation: 'Dom Pielgrzyma przy Kościele św. Jakuba w Lublanie / Marija Bistrica (~75 PLN)',
    isSpecialHighlight: true,
  },
  {
    id: 'wp-saloniki',
    stageId: 5,
    dayNumber: 218,
    dateLabel: '18 stycznia (Dzień 218)',
    name: 'Saloniki & Filippi (Grecja) → Stambuł (Przejście Lądowe nad Bosforem)',
    subtitle: 'Via Egnatia i lądowe wejście do Azji Mniejszej bez promów morskich',
    caminoTrailName: 'Lądowy trakt pątniczy Via Egnatia & St. Paul Trail',
    lat: 40.6401,
    lng: 22.9444,
    distanceKm: 33.4,
    accommodation: 'Dom Gościnny Parafii Niepokalanego Poczęcia w Salonikach (~90 PLN)',
  },
  {
    id: 'wp-jerozolima',
    stageId: 5,
    dayNumber: 270,
    dateLabel: '11 marca (Dzień 270)',
    name: 'Jerozolima – Bazylika Grobu Pańskiego (Wejście 100% Drogą Lądową)',
    subtitle: 'Wierzchołek III Wielkiego Trójkąta Kontynentalnego przez Antiochię, Damaszek i Jerycho',
    caminoTrailName: 'Historyczny Korytarz Lądowy Pielgrzymów Jerozolimskich (bez drogi morskiej)',
    lat: 31.7784,
    lng: 35.2296,
    distanceKm: 33.2,
    accommodation: 'Dom Polski Sióstr Elżbietanek / Austrian Hospice w Jerozolimie (~140 PLN)',
    isTriangleVertex: true,
  },
  // Etap 6 (Bok III Wielkiego Trójkąta - 100% Lądem + Szlak z Muszlami od Węgier do Kochłowic)
  {
    id: 'wp-rila',
    stageId: 6,
    dayNumber: 312,
    dateLabel: '22 kwietnia (Dzień 312)',
    name: 'Monastyr Rilski & Sofia (Bułgaria – Powrót Lądem przez Anatolię i Bosfor)',
    subtitle: 'Największy klasztor prawosławny w górach Riła na lądowym szlaku powrotnym',
    caminoTrailName: 'Lądowy trakt Via Diagonalis / Via Militaris ku szlakom Jakubowym',
    lat: 42.1334,
    lng: 23.3402,
    distanceKm: 32.6,
    accommodation: 'Cele gościnne Monastyru Rilskiego (~80 PLN)',
  },
  {
    id: 'wp-budapeszt',
    stageId: 6,
    dayNumber: 342,
    dateLabel: '22 maja (Dzień 342)',
    name: 'Segedyn → Budapeszt → Ostrzyhom (Węgierski Szlak z Muszlami)',
    subtitle: 'Kamień „0 km” Camino na Wzgórzu Gellerta w Budapeszcie i Bazylika w Ostrzyhomiu',
    caminoTrailName: 'Węgierska Droga św. Jakuba (Szent Jakab-út) & Mária Út',
    lat: 47.7928,
    lng: 18.7364,
    distanceKm: 32.5,
    accommodation: 'Dom Pielgrzyma Szent Jakab-út / Mária Út w Ostrzyhomiu (~70 PLN)',
  },
  {
    id: 'wp-zylina-beskidy',
    stageId: 6,
    dayNumber: 358,
    dateLabel: '7 czerwca (Dzień 358)',
    name: 'Bańska Szczawnica → Żylina → Wisła / Pszczyna (Słowacki i Beskidzki Szlak z Muszlami)',
    subtitle: 'Ostatni odcinek lądowy za znakami żółtej muszli św. Jakuba prosto do Kochłowic',
    caminoTrailName: 'Svätojakubská cesta (Słowacja) + Beskidzka i Górnośląska Droga św. Jakuba',
    lat: 49.4384,
    lng: 18.7883,
    distanceKm: 31.8,
    accommodation: 'Dom Pielgrzyma na Górze Żivčáková / Sanktuarium św. Jakuba w Szczyrku (~60 PLN)',
  },
];

export const NAVIGATION_PRESETS: NavigationPreset[] = [
  {
    id: 'nav-stage-1',
    stageId: 1,
    label: 'Etap 1 (Szlak z Muszlami · Lądem): Kochłowice → Piekary Śl. → Sączów (św. Jakuba) → Woźniki → Jasna Góra',
    shortLabel: 'Etap 1: Kochłowice → Sączów → Jasna Góra (4 dni)',
    caminoShellTrail: 'Górnośląska i Jasnogórska Droga św. Jakuba (przez kościół św. Jakuba w Sączowie)',
    description:
      'Czterodniowy marsz lądowy za znakami muszli św. Jakuba z Kościoła Trójcy Świętej w Kochłowicach przez Piekary Śląskie, Sączów (kościół św. Jakuba Apostoła) i Woźniki na Jasną Górę.',
    origin: 'Kościół Trójcy Świętej, Ruda Śląska Kochłowice, Polska',
    destination: 'Jasna Góra, Częstochowa, Polska',
    intermediates: [
      'Bazylika Piekary Śląskie, Polska',
      'Kościół św. Jakuba Apostoła, Sączów, Polska',
      'Woźniki, Polska',
      'Poczesna, Polska',
    ],
    expectedDistanceKm: 96.0,
    daysLabel: 'Dni 1–4 (14.06 – 17.06)',
    color: '#065F46',
    boundsCenter: { lat: 50.535, lng: 19.035 },
    boundsZoom: 9,
  },
  {
    id: 'nav-stage-2-full',
    stageId: 2,
    label: 'Etap 2 (Jurajska Droga św. Jakuba + Via Regia): Jasna Góra → Pustynia Błędowska → Ojców (Dzień Ojca) → Łagiewniki',
    shortLabel: 'Etap 2: Jasna Góra → Pustynia Błędowska → Ojców → Łagiewniki',
    caminoShellTrail: 'Jurajska Droga św. Jakuba + Główny Szlak z Muszlami Via Regia (od Olkusza przez Ojców i Giebułtów)',
    description:
      'Siedmiodniowy szlak lądowy łączący Jurajską Drogę św. Jakuba, przejście przez Pustynię Błędowską (21.06) oraz szlak z muszlami Via Regia z Olkusza przez Ojców (pobyt w Dzień Ojca 23.06) i Giebułtów do Łagiewnik.',
    origin: 'Jasna Góra, Częstochowa, Polska',
    destination: 'Sanktuarium Bożego Miłosierdzia, Kraków-Łagiewniki, Polska',
    intermediates: [
      'Złoty Potok, Polska',
      'Pilica, Polska',
      'Róża Wiatrów Pustynia Błędowska, Klucze, Polska',
      'Bazylika św. Andrzeja, Olkusz, Polska',
      'Ojców, Polska',
      'Giebułtów, Polska',
      'Opactwo Benedyktynów w Tyńcu, Kraków, Polska',
    ],
    expectedDistanceKm: 166.0,
    daysLabel: 'Dni 5–11 (18.06 – 25.06)',
    color: '#B45309',
    boundsCenter: { lat: 50.415, lng: 19.55 },
    boundsZoom: 9,
  },
  {
    id: 'nav-stage-2-desert-ojcow',
    stageId: 2,
    label: 'Etap 2 (Szlak z Muszlami Via Regia): Pustynia Błędowska → Olkusz → Ojców w Dzień Ojca (21–23.06)',
    shortLabel: 'Pustynia Błędowska + Ojców (Szlak Via Regia)',
    caminoShellTrail: 'Droga św. Jakuba Via Regia (Olkusz – Sułoszowa – Pieskowa Skała – Ojców – Giebułtów)',
    description:
      'Szczegółowa nawigacja piesza przez Pustynię Błędowską do Olkusza, skąd szlak podąża za znakami żółtej muszli św. Jakuba (Via Regia) przez Pieskową Skałę do Ojcowa na Dzień Ojca (23.06).',
    origin: 'Pilica, Polska',
    destination: 'Ojców, Polska',
    intermediates: [
      'Chechło, Pustynia Błędowska, Polska',
      'Róża Wiatrów, Klucze, Polska',
      'Bazylika św. Andrzeja, Olkusz, Polska',
      'Zamek Pieskowa Skała, Polska',
    ],
    expectedDistanceKm: 50.2,
    daysLabel: 'Dni 8–9 (21.06 – 23.06 · Dzień Ojca)',
    color: '#D97706',
    boundsCenter: { lat: 50.31, lng: 19.67 },
    boundsZoom: 11,
  },
  {
    id: 'nav-stage-3',
    stageId: 3,
    label: 'Etap 3 (Szlak z Muszlami Via Regia): Kraków-Łagiewniki → Oświęcim-Harmęże → Bieruń Stary → Kochłowice',
    shortLabel: 'Etap 3: Łagiewniki → Bieruń → Kochłowice (4 dni)',
    caminoShellTrail: 'Małopolska, Oświęcimska i Górnośląska Droga św. Jakuba (Via Regia przez Bieruń Stary)',
    description:
      'Czterodniowy powrót drogą lądową wzdłuż południowego wariantu Drogi św. Jakuba (Via Regia) przez Skawinę, Spytkowice, Oświęcim-Harmęże, drewniany kościół św. Walentego w Bieruniu Starym i Mikołów do Kochłowic.',
    origin: 'Sanktuarium Bożego Miłosierdzia, Kraków-Łagiewniki, Polska',
    destination: 'Kościół Trójcy Świętej, Ruda Śląska Kochłowice, Polska',
    intermediates: ['Spytkowice, Polska', 'Harmęże, Oświęcim, Polska', 'Bieruń Stary, Polska', 'Mikołów, Polska'],
    expectedDistanceKm: 100.0,
    daysLabel: 'Dni 12–15 (26.06 – 29.06)',
    color: '#1D4ED8',
    boundsCenter: { lat: 50.11, lng: 19.42 },
    boundsZoom: 9,
  },
  {
    id: 'nav-stage-4',
    stageId: 4,
    label: 'Etap 4 (100% Szlak z Muszlami i Lądem): Kochłowice → Ołomuniec → Einsiedeln → Le Puy → Santiago de Compostela',
    shortLabel: 'Etap 4: Kochłowice → Santiago (95 dni · Szlak z Muszlami)',
    caminoShellTrail:
      'Górnośląska Via Regia → Svatojakubská cesta (CZ) → Jakobsweg (DE) → Via Jacobi (CH) → Via Podiensis GR65 (FR) → Camino Francés (ES)',
    description:
      'Pierwsze ramię Wielkiego Trójkąta prowadzące w 100% drogą lądową (z obejściem Jeziora Bodeńskiego przez Stein am Rhein) i w 100% oficjalnymi europejskimi szlakami z muszlą św. Jakuba do Katedry w Santiago.',
    origin: 'Ruda Śląska Kochłowice, Polska',
    destination: 'Catedral de Santiago de Compostela, España',
    intermediates: [
      'Olomouc, Czechia',
      'Regensburg, Germany',
      'Stein am Rhein, Switzerland',
      'Einsiedeln, Switzerland',
      'Le Puy-en-Velay, France',
      'Saint-Jean-Pied-de-Port, France',
      'Burgos, Spain',
    ],
    expectedDistanceKm: 3182.0,
    daysLabel: 'Dni 16–110 (30.06 – 02.10 · 95 dni)',
    color: '#047857',
    boundsCenter: { lat: 46.5, lng: 5.2 },
    boundsZoom: 5,
  },
  {
    id: 'nav-stage-5a',
    stageId: 5,
    label: 'Etap 5A (Szlak z Muszlami + Lądem): Santiago de Compostela → Lourdes → Arles (GR653) → Siena → Watykan',
    shortLabel: 'Etap 5A: Santiago → Lourdes → Watykan (70 dni)',
    caminoShellTrail: 'Camino del Norte / Voie du Piémont (Lourdes) → Via Tolosana (GR653 z muszlami) → Via Francigena',
    description:
      'Zachodnia połowa podstawy Wielkiego Trójkąta w 100% drogą lądową przez szlaki z muszlami w Hiszpanii i południowej Francji (Lourdes, Tuluza, Arles – GR653) oraz włoską Via Francigena przez Lukkę i Sienę do Watykanu.',
    origin: 'Catedral de Santiago de Compostela, España',
    destination: 'Piazza San Pietro, Città del Vaticano',
    intermediates: ['Sanctuaire de Lourdes, France', 'Toulouse, France', 'Arles, France', 'Lucca, Italy', 'Siena, Italy'],
    expectedDistanceKm: 2330.0,
    daysLabel: 'Dni 111–180 (03.10 – 11.12 · 70 dni)',
    color: '#991B1B',
    boundsCenter: { lat: 42.9, lng: 2.5 },
    boundsZoom: 5,
  },
  {
    id: 'nav-stage-5b',
    stageId: 5,
    label: 'Etap 5B (100% Drogą Lądową + Szlaki z Muszlami): Watykan → Padwa → Lublana → Zagrzeb → Stambuł → Antiochia → Jerozolima',
    shortLabel: 'Etap 5B: Watykan → Lublana/Zagrzeb → Stambuł → Jerozolima (Lądem)',
    caminoShellTrail:
      'Cammino di San Giacomo (Padwa/Triest) → Jakobova pot (Słowenia) → Camino Croatia (Zagrzeb) → Via Egnatia & St. Paul Trail (100% Lądem)',
    description:
      'Wschodnia połowa podstawy Wielkiego Trójkąta wytyczona w 100% drogą lądową (bez promów przez Adriatyk i Morze Śródziemne!): przez Padwę, Triest, Słoweńską i Chorwacką Drogę św. Jakuba (Lublana, Zagrzeb), Belgrad, Saloniki, Stambuł (Bosfor), Konyę, Antiochię i Dolinę Jordanu do Jerozolimy.',
    origin: 'Piazza San Pietro, Città del Vaticano',
    destination: 'Old City, Jerusalem',
    intermediates: [
      'Padova, Italy',
      'Trieste, Italy',
      'Ljubljana, Slovenia',
      'Zagreb, Croatia',
      'Thessaloniki, Greece',
      'Istanbul, Türkiye',
      'Antakya, Türkiye',
    ],
    expectedDistanceKm: 2975.0,
    daysLabel: 'Dni 181–270 (12.12 – 11.03 · 90 dni)',
    color: '#991B1B',
    boundsCenter: { lat: 40.5, lng: 24.5 },
    boundsZoom: 5,
  },
  {
    id: 'nav-stage-6',
    stageId: 6,
    label: 'Etap 6 (100% Lądem + Szlak z Muszlami): Jerozolima → Stambuł → Rila → Budapeszt (Szent Jakab-út) → Żylina → Kochłowice',
    shortLabel: 'Etap 6: Jerozolima → Stambuł → Budapeszt → Kochłowice (95 dni)',
    caminoShellTrail:
      'Korytarz Lądowy Anatolii i Bałkanów → Węgierska Droga św. Jakuba (Szent Jakab-út) → Słowacka (Svätojakubská cesta) → Beskidzka i Górnośląska Droga św. Jakuba',
    description:
      'Powrót z Jerozolimy w 100% drogą lądową (przez Antiochię, Kapadocję, Stambuł, Monastyr Rilski, Sofię i Belgrad), a od Segedynu i Budapesztu nieprzerwanie szlakami z muszlą św. Jakuba przez Ostrzyhom, Bańską Szczawnicę, Żylinę, Wisłę i Pszczynę do Kochłowic.',
    origin: 'Old City, Jerusalem',
    destination: 'Kościół Trójcy Świętej, Ruda Śląska Kochłowice, Polska',
    intermediates: [
      'Antakya, Türkiye',
      'Istanbul, Türkiye',
      'Sofia, Bulgaria',
      'Belgrade, Serbia',
      'Budapest, Hungary',
      'Esztergom, Hungary',
      'Žilina, Slovakia',
      'Pszczyna, Polska',
    ],
    expectedDistanceKm: 3094.0,
    daysLabel: 'Dni 271–365 (12.03 – 14.06 · 95 dni)',
    color: '#4338CA',
    boundsCenter: { lat: 42.5, lng: 25.0 },
    boundsZoom: 5,
  },
];

interface ComputedRouteStats {
  distanceText: string;
  durationText: string;
  modeLabel: string;
  legsSummary: Array<{ startAddress: string; endAddress: string; distanceKm: string }>;
  isLiveRoutesApi: boolean;
}

interface MapCanvasControllerProps {
  visibleStageIds: number[];
  activePreset: NavigationPreset;
  customDaySegment: DailySegment | null;
  onRouteComputed: (stats: ComputedRouteStats | null, loading: boolean, errorMsg: string | null) => void;
}

interface MapPolylineHandle {
  setMap: (map: unknown) => void;
  setOptions: (opts: Record<string, unknown>) => void;
}

function MapCanvasController({
  visibleStageIds,
  activePreset,
  customDaySegment,
  onRouteComputed,
}: MapCanvasControllerProps) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const routesLib = useMapsLibrary('routes');

  // 1. Draw the 6 stages 100% overland Camino polylines on the Google Map
  useEffect(() => {
    if (!map || !mapsLib) return;

    const polylines: MapPolylineHandle[] = [];

    visibleStageIds.forEach((stageId) => {
      const path = STAGE_POLYLINE_PATHS[stageId];
      const colorInfo = STAGE_COLORS[stageId];
      if (!path || !colorInfo) return;

      const isFocusedStage = customDaySegment
        ? customDaySegment.stageId === stageId
        : activePreset.stageId === stageId;

      const poly = new mapsLib.Polyline({
        path,
        map,
        geodesic: false, // Follow exact overland waypoint chain without curving across seas
        strokeColor: colorInfo.hex,
        strokeOpacity: isFocusedStage ? 0.94 : 0.58,
        strokeWeight: isFocusedStage ? 5 : 3.2,
        zIndex: isFocusedStage ? 20 : 10,
      });

      polylines.push(poly as unknown as MapPolylineHandle);
    });

    return () => {
      polylines.forEach((p) => p.setMap(null));
    };
  }, [map, mapsLib, visibleStageIds, activePreset, customDaySegment]);

  // 2. Pan/zoom map when activePreset changes (if no customDaySegment overrides)
  useEffect(() => {
    if (!map || customDaySegment) return;
    map.panTo(activePreset.boundsCenter);
    map.setZoom(activePreset.boundsZoom);
  }, [map, activePreset, customDaySegment]);

  // 3. Compute 100% Overland Walking Navigation Route via Google Maps Routes API (`Route.computeRoutes`)
  useEffect(() => {
    if (!map || !routesLib) return;

    let activeRoutePolylines: MapPolylineHandle[] = [];
    let isCancelled = false;

    const originStr = customDaySegment
      ? `${customDaySegment.fromTown.split(' (')[0]}, ${customDaySegment.country}`
      : activePreset.origin;
    const destinationStr = customDaySegment
      ? `${customDaySegment.toTown.split(' (')[0]}, ${customDaySegment.country}`
      : activePreset.destination;
    const intermediatesList = customDaySegment
      ? customDaySegment.viaWaypoints.slice(0, 3).map((w) => `${w.split(' (')[0]}, ${customDaySegment.country}`)
      : activePreset.intermediates;

    const fallbackKm = customDaySegment ? customDaySegment.distanceKm : activePreset.expectedDistanceKm;
    const fallbackHours = Math.round(fallbackKm / 4.5);

    async function calculateWalkingRoute() {
      onRouteComputed(null, true, null);

      try {
        const RouteClass = (routesLib as unknown as { Route?: { computeRoutes?: (req: unknown) => Promise<{ routes?: Array<Record<string, unknown>> }> } }).Route;

        if (RouteClass && typeof RouteClass.computeRoutes === 'function') {
          const request: Record<string, unknown> = {
            origin: originStr,
            destination: destinationStr,
            travelMode: 'WALKING',
            fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
          };

          if (intermediatesList.length > 0) {
            request.intermediates = intermediatesList.map((loc) => ({ location: loc }));
          }

          const response = await RouteClass.computeRoutes(request);
          if (isCancelled) return;

          const primaryRoute = response?.routes?.[0] as
            | {
                distanceMeters?: number;
                durationMillis?: number;
                viewport?: Parameters<typeof map.fitBounds>[0];
                legs?: Array<{
                  startLocation?: unknown;
                  endLocation?: unknown;
                  distanceMeters?: number;
                }>;
                createPolylines?: () => MapPolylineHandle[];
              }
            | undefined;

          if (primaryRoute) {
            if (typeof primaryRoute.createPolylines === 'function') {
              activeRoutePolylines = primaryRoute.createPolylines();
              activeRoutePolylines.forEach((poly) => {
                poly.setOptions({
                  strokeColor: '#059669',
                  strokeWeight: 6,
                  strokeOpacity: 0.95,
                  zIndex: 50,
                });
                poly.setMap(map);
              });
            }

            if (primaryRoute.viewport) {
              map.fitBounds(primaryRoute.viewport, 48);
            }

            const distKm = primaryRoute.distanceMeters
              ? (primaryRoute.distanceMeters / 1000).toFixed(1)
              : fallbackKm.toFixed(1);
            const durHours = primaryRoute.durationMillis
              ? Math.max(1, Math.round(primaryRoute.durationMillis / 3600000))
              : fallbackHours;

            onRouteComputed(
              {
                distanceText: `${distKm} km`,
                durationText: `~${durHours} godz. marszu`,
                modeLabel: 'Nawigacja Piesza Lądowa (Routes API · WALKING · Szlak z Muszlami)',
                legsSummary: [
                  {
                    startAddress: originStr,
                    endAddress: destinationStr,
                    distanceKm: `${distKm} km`,
                  },
                ],
                isLiveRoutesApi: true,
              },
              false,
              null
            );
            return;
          }
        }

        // Fallback if trans-continental border crossing returns empty routes
        onRouteComputed(
          {
            distanceText: `${fallbackKm.toFixed(1)} km`,
            durationText: `~${fallbackHours} godz. marszu`,
            modeLabel: 'Lądowy Szlak z Muszlami św. Jakuba na Mapie Google',
            legsSummary: [
              {
                startAddress: originStr,
                endAddress: destinationStr,
                distanceKm: `${fallbackKm.toFixed(1)} km`,
              },
            ],
            isLiveRoutesApi: false,
          },
          false,
          null
        );
      } catch (err: unknown) {
        if (isCancelled) return;
        const msg = String((err as { message?: string })?.message || err || '');
        const code = String((err as { code?: string })?.code || '');
        if (/OVER_QUERY_LIMIT|RESOURCE_EXHAUSTED|quota|429/i.test(msg + ' ' + code)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }

        onRouteComputed(
          {
            distanceText: `${fallbackKm.toFixed(1)} km`,
            durationText: `~${fallbackHours} godz. marszu`,
            modeLabel: 'Lądowy Szlak z Muszlami św. Jakuba (100% Drogą Lądową)',
            legsSummary: [
              {
                startAddress: originStr,
                endAddress: destinationStr,
                distanceKm: `${fallbackKm.toFixed(1)} km`,
              },
            ],
            isLiveRoutesApi: false,
          },
          false,
          null
        );
      }
    }

    calculateWalkingRoute();

    return () => {
      isCancelled = true;
      activeRoutePolylines.forEach((p) => p.setMap(null));
    };
  }, [map, routesLib, activePreset, customDaySegment]);

  return null;
}

interface PilgrimageGoogleMapProps {
  selectedDaySegment: DailySegment | null;
  onClearDaySegment: () => void;
  onSelectStageForSchedule: (stageId: number) => void;
}

export default function PilgrimageGoogleMap({
  selectedDaySegment,
  onClearDaySegment,
  onSelectStageForSchedule,
}: PilgrimageGoogleMapProps) {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (typeof process !== 'undefined' && (process.env as Record<string, string | undefined>)?.GOOGLE_MAPS_PLATFORM_KEY) ||
    '';

  const [stageVisibilityMode, setStageVisibilityMode] = useState<'all' | 'poland' | 'continental' | number>('all');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('nav-stage-2-full');
  const [selectedWaypoint, setSelectedWaypoint] = useState<StageGeoWaypoint | null>(
    KEY_MAP_WAYPOINTS.find((w) => w.id === 'wp-ojcow-dzien-ojca') || KEY_MAP_WAYPOINTS[0]
  );
  const [routeStats, setRouteStats] = useState<ComputedRouteStats | null>(null);
  const [isComputingRoute, setIsComputingRoute] = useState<boolean>(false);

  const visibleStageIds = useMemo(() => {
    if (stageVisibilityMode === 'all') return [1, 2, 3, 4, 5, 6];
    if (stageVisibilityMode === 'poland') return [1, 2, 3];
    if (stageVisibilityMode === 'continental') return [4, 5, 6];
    return [stageVisibilityMode];
  }, [stageVisibilityMode]);

  const activePreset = useMemo(() => {
    return NAVIGATION_PRESETS.find((p) => p.id === selectedPresetId) || NAVIGATION_PRESETS[0];
  }, [selectedPresetId]);

  const visibleWaypoints = useMemo(() => {
    return KEY_MAP_WAYPOINTS.filter((wp) => visibleStageIds.includes(wp.stageId));
  }, [visibleStageIds]);

  // Build external Google Maps Walking Turn-by-Turn URL (100% overland waypoints)
  const googleMapsExternalWalkingUrl = useMemo(() => {
    const origin = selectedDaySegment
      ? `${selectedDaySegment.fromTown.split(' (')[0]}, ${selectedDaySegment.country}`
      : activePreset.origin;
    const destination = selectedDaySegment
      ? `${selectedDaySegment.toTown.split(' (')[0]}, ${selectedDaySegment.country}`
      : activePreset.destination;
    const waypoints = selectedDaySegment
      ? selectedDaySegment.viaWaypoints.map((w) => `${w.split(' (')[0]}, ${selectedDaySegment.country}`).join('|')
      : activePreset.intermediates.join('|');

    const params = new URLSearchParams({
      api: '1',
      origin,
      destination,
      travelmode: 'walking',
    });
    if (waypoints) {
      params.set('waypoints', waypoints);
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }, [selectedDaySegment, activePreset]);

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
      {/* Top Control Header: Stage Filters & Navigation Preset Selector */}
      <div className="p-5 lg:p-6 bg-stone-50 border-b border-stone-200 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-900">
              <Navigation className="w-3.5 h-3.5" />
              <span>MAPA GOOGLE Z NAWIGACJĄ PIESZĄ · SZLAK Z MUSZLAMI ŚW. JAKUBA · 100% DROGĄ LĄDOWĄ</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-stone-900">
              Wszystkie 6 Etapów Pielgrzymki (365 Dni) Wytyczone Drogą Lądową i Szlakami Jakubowymi (Camino)
            </h3>
          </div>

          {/* Layer Visibility Switcher */}
          <div className="flex flex-wrap items-center gap-1 bg-stone-200/80 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setStageVisibilityMode('all')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                stageVisibilityMode === 'all'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Wszystkie Etapy 1–6
            </button>
            <button
              type="button"
              onClick={() => {
                setStageVisibilityMode('poland');
                onClearDaySegment();
                setSelectedPresetId('nav-stage-2-full');
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                stageVisibilityMode === 'poland'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Mały Trójkąt E1–3 (Polska)
            </button>
            <button
              type="button"
              onClick={() => {
                setStageVisibilityMode('continental');
                onClearDaySegment();
                setSelectedPresetId('nav-stage-4');
              }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                stageVisibilityMode === 'continental'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Wielki Trójkąt E4–6 (100% Lądem)
            </button>
            {[1, 2, 3, 4, 5, 6].map((stNum) => (
              <button
                key={stNum}
                type="button"
                onClick={() => {
                  setStageVisibilityMode(stNum);
                  onClearDaySegment();
                  const matchingPreset = NAVIGATION_PRESETS.find((p) => p.stageId === stNum);
                  if (matchingPreset) setSelectedPresetId(matchingPreset.id);
                }}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  stageVisibilityMode === stNum
                    ? 'bg-emerald-900 text-white font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                E{stNum}
              </button>
            ))}
          </div>
        </div>

        {/* Walking Navigation Route Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-2 border-t border-stone-200/80">
          <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-center gap-2">
            <label
              htmlFor="google-maps-route-preset"
              className="text-xs font-semibold text-stone-700 whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <RouteIcon className="w-3.5 h-3.5 text-emerald-900" />
              <span>Aktywna nawigacja lądowa:</span>
            </label>
            <select
              id="google-maps-route-preset"
              value={selectedDaySegment ? 'custom-day' : selectedPresetId}
              onChange={(e) => {
                if (e.target.value !== 'custom-day') {
                  onClearDaySegment();
                  setSelectedPresetId(e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-xs font-medium bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            >
              {selectedDaySegment && (
                <option value="custom-day">
                  Dzień {selectedDaySegment.globalDayNumber} (Etap {selectedDaySegment.stageId}.
                  {selectedDaySegment.stageDayNumber}): {selectedDaySegment.fromTown} → {selectedDaySegment.toTown} (
                  {selectedDaySegment.distanceKm.toFixed(1)} km)
                </option>
              )}
              {NAVIGATION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-5 flex flex-wrap items-center justify-between lg:justify-end gap-2">
            {selectedDaySegment && (
              <button
                type="button"
                onClick={onClearDaySegment}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                Pokaż cały etap
              </button>
            )}

            <a
              href={googleMapsExternalWalkingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Uruchom Nawigację Pieszą GPS (Google Maps)</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Split: Google Map Canvas (Left 8 cols) + Active Navigation & Stages Legend (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Google Map Canvas Container with explicit height */}
        <div className="lg:col-span-8 w-full h-[580px] relative bg-stone-100">
          <APIProvider apiKey={apiKey} language="pl" region="PL">
            <GoogleMap
              defaultCenter={{ lat: 50.415, lng: 19.55 }}
              defaultZoom={9}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              <MapCanvasController
                visibleStageIds={visibleStageIds}
                activePreset={activePreset}
                customDaySegment={selectedDaySegment}
                onRouteComputed={(stats, loading) => {
                  setRouteStats(stats);
                  setIsComputingRoute(loading);
                }}
              />

              {/* Render AdvancedMarkers for all visible waypoints across Stages 1-6 */}
              {visibleWaypoints.map((wp) => {
                const stageColor = STAGE_COLORS[wp.stageId]?.hex || '#065F46';
                const isSelected = selectedWaypoint?.id === wp.id;

                return (
                  <AdvancedMarker
                    key={wp.id}
                    position={{ lat: wp.lat, lng: wp.lng }}
                    title={`Etap ${wp.stageId}: ${wp.name}`}
                    onClick={() => setSelectedWaypoint(wp)}
                  >
                    <Pin
                      background={wp.isSpecialHighlight ? '#D97706' : wp.isTriangleVertex ? '#065F46' : stageColor}
                      borderColor={isSelected ? '#1C1917' : '#FFFFFF'}
                      glyphColor="#FFFFFF"
                      scale={wp.isTriangleVertex || wp.isSpecialHighlight ? 1.2 : 0.95}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for selected waypoint */}
              {selectedWaypoint && (
                <InfoWindow
                  position={{ lat: selectedWaypoint.lat, lng: selectedWaypoint.lng }}
                  onCloseClick={() => setSelectedWaypoint(null)}
                >
                  <div className="max-w-[270px] p-1 space-y-1.5 text-stone-900">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono font-semibold text-emerald-900">
                      <span>ETAP {selectedWaypoint.stageId} · DZIEŃ {selectedWaypoint.dayNumber}</span>
                      <span>{selectedWaypoint.dateLabel.split(' ')[0]}</span>
                    </div>
                    <div className="text-xs font-bold leading-snug">{selectedWaypoint.name}</div>
                    <div className="text-[11px] font-semibold text-amber-800">
                      🐚 {selectedWaypoint.caminoTrailName}
                    </div>
                    <div className="text-[11px] text-stone-600 leading-normal">{selectedWaypoint.subtitle}</div>
                    <div className="pt-1 border-t border-stone-200 text-[11px] text-stone-700">
                      <span className="font-semibold">Nocleg: </span>
                      <span>{selectedWaypoint.accommodation}</span>
                    </div>
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectStageForSchedule(selectedWaypoint.stageId)}
                        className="text-[11px] font-semibold text-emerald-900 hover:underline cursor-pointer"
                      >
                        Pokaż w harmonogramie →
                      </button>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedWaypoint.lat},${selectedWaypoint.lng}&travelmode=walking`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-blue-800 hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Nawiguj tu</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </APIProvider>
        </div>

        {/* Right 4 Columns: Live Walking Navigation Inspector & 6-Stage Legend */}
        <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-stone-200 p-5 flex flex-col justify-between bg-white space-y-4">
          <div className="space-y-4">
            {/* Active Walking Route Card */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono font-semibold text-emerald-900 uppercase tracking-wider">
                  {selectedDaySegment
                    ? `Nawigacja Dnia ${selectedDaySegment.globalDayNumber} / 365`
                    : activePreset.daysLabel}
                </span>
                <span className="text-[11px] font-mono text-stone-600 flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-emerald-800" />
                  <span>100% Lądem (WALKING)</span>
                </span>
              </div>

              <h4 className="text-sm font-bold text-stone-900 leading-snug">
                {selectedDaySegment
                  ? `${selectedDaySegment.fromTown} → ${selectedDaySegment.toTown}`
                  : activePreset.shortLabel}
              </h4>

              {/* Scallop-Shell Camino Trail Badge */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-lg px-2.5 py-2 text-[11px] text-amber-950 space-y-0.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>Szlak z Muszlą św. Jakuba (Camino) & Korytarz Lądowy:</span>
                </div>
                <div className="text-amber-900 leading-snug">
                  {selectedDaySegment
                    ? `${STAGE_COLORS[selectedDaySegment.stageId]?.shellTrail || 'Szlak Jakubowy'} (${selectedDaySegment.region})`
                    : activePreset.caminoShellTrail}
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {selectedDaySegment
                  ? `Przebieg lądowy: ${selectedDaySegment.fromTown} → ${selectedDaySegment.viaWaypoints.join(' → ')} → ${selectedDaySegment.toTown}. ${selectedDaySegment.sanctuaryOrLandmark}`
                  : activePreset.description}
              </p>

              {/* Computed Route Metrics */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-stone-200">
                <div className="bg-white border border-stone-200 rounded-lg p-2.5">
                  <div className="text-[10px] text-stone-500">Dystans trasy lądowej</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-stone-900 mt-0.5">
                    {isComputingRoute
                      ? 'Obliczanie...'
                      : routeStats?.distanceText || `${activePreset.expectedDistanceKm.toFixed(1)} km`}
                  </div>
                </div>
                <div className="bg-white border border-stone-200 rounded-lg p-2.5">
                  <div className="text-[10px] text-stone-500">Szacowany czas marszu</div>
                  <div className="text-sm font-bold font-mono tabular-nums text-emerald-900 mt-0.5">
                    {isComputingRoute
                      ? 'Wyznaczanie...'
                      : routeStats?.durationText || `~${Math.round(activePreset.expectedDistanceKm / 4.5)} godz.`}
                  </div>
                </div>
              </div>

              {/* Intermediate Stops List */}
              <div className="pt-1 space-y-1">
                <div className="text-[11px] font-semibold text-stone-700">
                  Kluczowe punkty lądowe i jakubowe na trasie:
                </div>
                <div className="text-[11px] text-stone-600 font-mono leading-relaxed">
                  {selectedDaySegment
                    ? [
                        selectedDaySegment.fromTown.split(' (')[0],
                        ...selectedDaySegment.viaWaypoints.map((w) => w.split(' (')[0]),
                        selectedDaySegment.toTown.split(' (')[0],
                      ].join(' → ')
                    : [
                        activePreset.origin.split(',')[0],
                        ...activePreset.intermediates.map((i) => i.split(',')[0]),
                        activePreset.destination.split(',')[0],
                      ].join(' → ')}
                </div>
              </div>
            </div>

            {/* Quick Highlights: Pustynia Błędowska, Ojców (Via Regia) & Lądowe Obejście Adriatyku */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                <span>Szybki wybór kluczowych odcinków lądowych i jakubowych:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearDaySegment();
                    setStageVisibilityMode('poland');
                    setSelectedPresetId('nav-stage-2-desert-ojcow');
                    const desertWp = KEY_MAP_WAYPOINTS.find((w) => w.id === 'wp-pustynia-bledowska');
                    if (desertWp) setSelectedWaypoint(desertWp);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-amber-800 text-white rounded-md hover:bg-amber-700 cursor-pointer"
                >
                  Pustynia Błędowska + Via Regia (21.06)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearDaySegment();
                    setStageVisibilityMode('poland');
                    setSelectedPresetId('nav-stage-2-desert-ojcow');
                    const ojcowWp = KEY_MAP_WAYPOINTS.find((w) => w.id === 'wp-ojcow-dzien-ojca');
                    if (ojcowWp) setSelectedWaypoint(ojcowWp);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-900 text-white rounded-md hover:bg-emerald-800 cursor-pointer"
                >
                  Ojców – Dzień Ojca na Via Regia (23.06)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearDaySegment();
                    setStageVisibilityMode('continental');
                    setSelectedPresetId('nav-stage-5b');
                    const sloWp = KEY_MAP_WAYPOINTS.find((w) => w.id === 'wp-lublana-zagrzeb');
                    if (sloWp) setSelectedWaypoint(sloWp);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-red-800 text-white rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Watykan → Jerozolima (100% Lądem)
                </button>
              </div>
            </div>

            {/* Interactive 6 Stages Legend & Quick Focus */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-stone-900">
                Wszystkie 6 Etapów (Szlak z Muszlami + Droga Lądowa):
              </div>
              <div className="space-y-1">
                {[
                  { stageId: 1, presetId: 'nav-stage-1', dist: '96 km · 4 dni' },
                  { stageId: 2, presetId: 'nav-stage-2-full', dist: '166 km · 7 dni' },
                  { stageId: 3, presetId: 'nav-stage-3', dist: '100 km · 4 dni' },
                  { stageId: 4, presetId: 'nav-stage-4', dist: '3182 km · 95 dni' },
                  { stageId: 5, presetId: 'nav-stage-5b', dist: '5305 km · 160 dni' },
                  { stageId: 6, presetId: 'nav-stage-6', dist: '3094 km · 95 dni' },
                ].map((item) => {
                  const stColor = STAGE_COLORS[item.stageId];
                  const isCurrent = !selectedDaySegment && activePreset.stageId === item.stageId;
                  return (
                    <button
                      key={item.stageId}
                      type="button"
                      onClick={() => {
                        onClearDaySegment();
                        setSelectedPresetId(item.presetId);
                        setStageVisibilityMode('all');
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                        isCurrent
                          ? 'bg-stone-100 border-stone-400 font-semibold text-stone-900'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: stColor.hex }}
                          />
                          <span className="truncate">{stColor.name}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 truncate pl-4">
                          🐚 {stColor.shellTrail}
                        </div>
                      </div>
                      <span className="font-mono tabular-nums text-[11px] text-stone-500 whitespace-nowrap shrink-0">
                        {item.dist}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
            <span>100% drogą lądową (bez promów morskich) · Szlak z muszlami</span>
            <span className="font-mono font-semibold text-stone-700">365 dni · 11 943 km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
