export interface TrailAttraction {
  id: string;
  stageId: number;
  stageCode: string;
  name: string;
  location: string;
  country: string;
  dayReference: string;
  category: 'Sanktuarium i Kult' | 'Zabytek Architektury / UNESCO' | 'Przyroda i Krajobraz';
  stopType: 'Postój na trasie (30–90 min)' | 'Popołudnie po etapie' | 'Dzień wolny / Skupienia';
  description: string;
  mustSeeHighlights: string[];
  pilgrimPracticalTip: string;
}

export const TRAIL_ATTRACTIONS: TrailAttraction[] = [
  // ==================== ETAP 1: KOCHŁOWICE -> JASNA GÓRA ====================
  {
    id: 'att-1-kochlowice',
    stageId: 1,
    stageCode: 'Etap 1 · Dzień 1 (14.06)',
    name: 'Kościół Trójcy Świętej i Sanktuarium Matki Bożej z Lourdes w Kochłowicach',
    location: 'Ruda Śląska – Kochłowice (ul. Ks. Ludwika Tunkla)',
    country: 'Polska',
    dayReference: 'Dzień 1 (Start pielgrzymki, 0,0 km)',
    category: 'Sanktuarium i Kult',
    stopType: 'Postój na trasie (30–90 min)',
    description:
      'Punkt początkowy i końcowy całej pielgrzymki. Neoromańska świątynia Trójcy Świętej (1902 r.) sąsiaduje bezpośrednio z zabytkowym kościołem MB z Lourdes (1806 r.) z kamienną Grotą Lurdzką i cudowną figurą Niepokalanej sprowadzoną z Francji w 1904 roku.',
    mustSeeHighlights: [
      'Kamienna Grota Lurdzka w prezbiterium starego kościoła z 1806 roku',
      'Neoromańska bryła kościoła parafialnego Trójcy Świętej z polichromią i witrażami śląskimi',
      'Pomnik i tablice pamiątkowe ks. prałata Ludwika Tunkla — budowniczego duchowości Kochłowic',
    ],
    pilgrimPracticalTip:
      'W zakrystii przed Mszą Świętą o godz. 7:00 dnia 14 czerwca wydawane są Paszporty Pielgrzyma (Credencial) z pierwszą pieczęcią „Via Trinitatis – Kochłowice”.',
  },
  {
    id: 'att-1-piekary',
    stageId: 1,
    stageCode: 'Etap 1 · Dzień 1 (14.06)',
    name: 'Bazylika NMP i św. Bartłomieja oraz Kalwaria Piekarska',
    location: 'Piekary Śląskie',
    country: 'Polska',
    dayReference: 'Dzień 1 (18,0 km od startu)',
    category: 'Sanktuarium i Kult',
    stopType: 'Postój na trasie (30–90 min)',
    description:
      'Duchowa stolica Górnego Śląska z cudownym obrazem Matki Bożej Piekarskiej – Lekarki Chorych i Matki Sprawiedliwości i Miłości Społecznej, przed którym modlił się król Jan III Sobieski w drodze pod Wiedeń (1683 r.).',
    mustSeeHighlights: [
      'Cudowny wizerunek Matki Bożej Piekarskiej w ołtarzu głównym neoromańskiej bazyliki',
      'Wzgórze Kalwarii Piekarskiej z kościołem Zmartwychwstania Pańskiego i kaplicami Drogi Krzyżowej',
      'Kopiec Wyzwolenia (punkt widokowy na całą panoramę Górnego Śląska)',
    ],
    pilgrimPracticalTip:
      'Główny postój obiadowy pierwszego dnia. W krużgankach wokół bazyliki dostępne są krany z wodą pitną oraz punkt medyczny.',
  },
  {
    id: 'att-1-swierklaniec',
    stageId: 1,
    stageCode: 'Etap 1 · Dzień 1 (14.06)',
    name: 'Zespół Pałacowo-Parkowy Donnersmarcków („Mały Wersal”)',
    location: 'Świerklaniec',
    country: 'Polska',
    dayReference: 'Dzień 1 (25,4 km — meta 1. dnia)',
    category: 'Zabytek Architektury / UNESCO',
    stopType: 'Popołudnie po etapie',
    description:
      'Rozległy, 150-hektarowy park krajobrazowy w Świerklańcu z Pałacem Kawalera (1903 r.), neogotyckim kościołem Dobrego Pasterza z mauzoleum oraz rzeźbami Emmanuela Frémieta nad stawem parkowym.',
    mustSeeHighlights: [
      'Pałac Kawalera w stylu neobaroku francuskiego (wzniesiony na wizytę cesarza Wilhelma II)',
      'Rzeźby zwierząt autorstwa francuskiego mistrza Emmanuela Frémieta na tarasach wodnych',
      'Zabytkowy Kościół Dobrego Pasterza połączony krytym krużgankiem z kaplicą grobową',
    ],
    pilgrimPracticalTip:
      'Idealne miejsce na wieczorny spacer regeneracyjny po pierwszym dniu marszu w cieniu stuletnich dębów i nad brzegiem Zalewu Nakło-Chechło.',
  },
  {
    id: 'att-1-wozniki-kozieglowy',
    stageId: 1,
    stageCode: 'Etap 1 · Dzień 2–3 (15–16.06)',
    name: 'Drewniany Kościół św. Walentego w Woźnikach i Świątynie w Koziegłowach',
    location: 'Woźniki / Koziegłowy',
    country: 'Polska',
    dayReference: 'Dzień 2 i 3 (51,6 km – 64,0 km)',
    category: 'Zabytek Architektury / UNESCO',
    stopType: 'Postój na trasie (30–90 min)',
    description:
      'Cenne zabytki pogranicza śląsko-małopolskiego: modrzewiowy kościół pątniczy św. Walentego z 1696 r. na Szlaku Architektury Drewnianej w Woźnikach oraz XV-wieczny gotycki kościół Bożego Ciała w Koziegłowach.',
    mustSeeHighlights: [
      'Barokowe polichromie stropowe i ołtarz św. Walentego w modrzewiowym kościele w Woźnikach',
      'Gotyckie prezbiterium z ok. 1400 roku z cennymi freskami pasyjnymi w Koziegłowach',
      'Wzgórze zamkowe dawnej kasztelanii biskupów krakowskich w Koziegłowach',
    ],
    pilgrimPracticalTip:
      'W Koziegłowach w trzecim dniu pielgrzymki odprawiana jest tradycyjna Msza Święta polowa przed ostatnim podejściem pod Częstochowę.',
  },
  {
    id: 'att-1-jasna-gora',
    stageId: 1,
    stageCode: 'Etap 1 · Dzień 4 (17.06)',
    name: 'Klasztor Ojców Paulinów na Jasnej Górze w Częstochowie',
    location: 'Częstochowa – Jasna Góra',
    country: 'Polska',
    dayReference: 'Dzień 4 (96,0 km — Finał Etapu 1)',
    category: 'Sanktuarium i Kult',
    stopType: 'Dzień wolny / Skupienia',
    description:
      'Najważniejsze sanktuarium maryjne w Polsce (Pomnik Historii), założone w 1382 roku przez księcia Władysława Opolczyka dla zakonu Paulinów z Węgier. Cel pierwszego etapu pielgrzymki.',
    mustSeeHighlights: [
      'Kaplica Cudownego Obrazu Matki Bożej Częstochowskiej (Czarnej Madonny) i udział w Apelu Jasnogórskim o 21:00',
      'Barokowa Bazylika Jasnogórska Znalezienia Krzyża Świętego i Narodzenia NMP',
      'Skarbiec Jasnogórski, Arsenał, Sala Rycerska, Bastion św. Rocha oraz Wały Jasnogórskie z Drogą Krzyżową Stefana Stuligrosza / Piusa Welońskiego',
      'Wieża Jasnogórska (106 m wysokości — panorama Częstochowy i początku Jury Krakowsko-Częstochowskiej)',
    ],
    pilgrimPracticalTip:
      'Popołudnie 17 czerwca i poranek 18 czerwca dają czas na spowiedź, obchód Wałów na kolanach wokół Kaplicy oraz zwiedzenie Skarbca i Bastionu św. Rocha.',
  },

  // ==================== ETAP 2: JASNA GÓRA -> KRAKÓW-ŁAGIEWNIKI ====================
  {
    id: 'att-2-olsztyn-zloty-potok',
    stageId: 2,
    stageCode: 'Etap 2 · Dzień 5 (18.06)',
    name: 'Zamek Królewski w Olsztynie, Kościół św. Idziego w Zrębicach i Dolina Wiercicy',
    location: 'Olsztyn Jurajski / Zrębice / Złoty Potok',
    country: 'Polska',
    dayReference: 'Dzień 5 (Dzień 1 Etapu 2)',
    category: 'Przyroda i Krajobraz',
    stopType: 'Postój na trasie (30–90 min)',
    description:
      'Otwarcie jurajskiego Szlaku Orlich Gniazd: wapienne wzgórze zamku Kazimierza Wielkiego w Olsztynie, XVI-wieczny drewniany kościół św. Idziego w Zrębicach oraz rezerwat Parkowe z wywierzyskami krasowymi w Złotym Potoku.',
    mustSeeHighlights: [
      'Gotycka cylindryczna baszta zamku w Olsztynie górująca nad białymi ostańcami wapiennymi',
      'Modrzewiowy kościół św. Idziego w Zrębicach z krytym sobotami podcieniem dla pątników',
      'Źródła Zygmunta i Elżbiety, Pałac Raczyńskich i Dworek Krasińskiego w Złotym Potoku oraz pobliskie Sanktuarium MB Leśniowskiej Patronki Rodzin',
    ],
    pilgrimPracticalTip:
      'Przy Źródłach Zygmunta w Złotym Potoku płynie krystalicznie czysta, chłodna woda źródlana o stałej temperaturze 8°C — doskonała do obmycia zmęczonych stóp.',
  },
  {
    id: 'att-2-mirow-bobolice-zborow',
    stageId: 2,
    stageCode: 'Etap 2 · Dzień 6 (19.06)',
    name: 'Zamki Królewskie w Mirowie i Bobolicach oraz Rezerwat Góra Zborów',
    location: 'Mirów / Bobolice / Podlesice',
    country: 'Polska',
    dayReference: 'Dzień 6 (Dzień 2 Etapu 2)',
    category: 'Przyroda i Krajobraz',
    stopType: 'Postój na trasie (30–90 min)',
    description:
      'Najbardziej widowiskowy odcinek krajobrazowy Jury: dwukilometrowa skalna Grzęda Mirowsko-Bobolicka łącząca dwa średniowieczne zamki rycerskie oraz bezleśny szczyt Góry Zborów (462 m n.p.m.).',
    mustSeeHighlights: [
      'Zrekonstruowany Zamek Królewski w Bobolicach i romantyczne ruiny zamku w Mirowie',
      'Grań skalna Grzędy Mirowskiej ze spektakularną panoramą Wyżyny Krakowsko-Częstochowskiej',
      'Rezerwat przyrody nieożywionej Góra Zborów i Jaskinia Głęboka w Podlesicach',
    ],
    pilgrimPracticalTip:
      'Odcinek przez Grzędę Mirowską prowadzi po otwartej wapiennej skale — konieczne nakrycie głowy i zapas 1,5 l wody.',
  },
  {
    id: 'att-2-skarzyce-ogrodzieniec-pilica',
    stageId: 2,
    stageCode: 'Etap 2 · Dzień 7 (20.06)',
    name: 'Sanktuarium Trójcy Świętej w Skarżycach, Zamek Ogrodzieniec i Klasztor w Pilicy',
    location: 'Skarżyce / Podzamcze / Pilica',
    country: 'Polska',
    dayReference: 'Dzień 7 (Dzień 3 Etapu 2)',
    category: 'Zabytek Architektury / UNESCO',
    stopType: 'Popołudnie po etapie',
    description:
      'Szczególny dzień dla pielgrzymów z Kochłowic: nawiedzenie bliźniaczego wezwaniem Sanktuarium Trójcy Świętej w Skarżycach (z 1583 r.), przejście u stóp największej warowni Jury – Zamku Ogrodzieniec w Podzamczu – i nocleg w barokowym klasztorze Franciszkanów w Pilicy.',
    mustSeeHighlights: [
      'Trójlistny kościół Sanktuarium Trójcy Świętej w Skarżycach obok ostańca „Okiennik Wielki”',
      'Monumentalne ruiny zamku Bonerów na Górze Janowskiego (516 m n.p.m. — najwyższe wzniesienie Jury)',
      'Klasztor Ojców Franciszkanów w Pilicy-Biskupicach (1740 r.) z cudownym wizerunkiem Matki Bożej Śnieżnej',
    ],
    pilgrimPracticalTip:
      'W klasztorze w Pilicy bracia franciszkanie udostępniają wirydarz i ogrody klasztorne do wieczornej adoracji w ciszy.',
  },
  {
    id: 'att-2-pustynia-bledowska-olkusz',
    stageId: 2,
    stageCode: 'Etap 2 · Dzień 8 (21.06)',
    name: 'Pustynia Błędowska („Polska Sahara” — Róża Wiatrów i Czubatka) oraz Bazylika w Olkuszu',
    location: 'Chechło / Klucze / Olkusz',
    country: 'Polska',
    dayReference: 'Dzień 8 (21 czerwca · Dzień 4 Etapu 2)',
    category: 'Przyroda i Krajobraz',
    stopType: 'Postój na trasie (30–90 min)',
    description:
      'Unikalne w skali całej Europy Środkowej piesze przejście przez otwarte piaski Pustyni Błędowskiej pomiędzy Chechłem a Kluczami, połączone z medytacją pustyni (duchową zapowiedzią Pustyni Judzkiej w Etapie 5) oraz wejściem przez Zamek Rabsztyn do królewskiego Olkusza na szlaku św. Jakuba Via Regia.',
    mustSeeHighlights: [
      'Drewniany kompleks pomostów i altan „Róża Wiatrów” pośrodku wydm i muraw napiaskowych Pustyni Błędowskiej',
      'Wzgórze Czubatka (382 m n.p.m.) w Kluczach i Dąbrówka w Chechle — główne punkty widokowe na cały obszar pustyni',
      'Ruiny gotycko-renesansowego Zamku Rabsztyn oraz Bazylika św. Andrzeja Apostoła w Olkuszu z organami Hansa Hummla (1611 r.)',
    ],
    pilgrimPracticalTip:
      'Przed zejściem z Chechła na piaski Pustyni Błędowskiej należy uzupełnić zapas wody (min. 2 litry), założyć chustę Buff chroniącą przed piaskiem i stuptuty lub wyższe skarpety.',
  },
  {
    id: 'att-2-ojcow-dzien-ojca',
    stageId: 2,
    stageCode: 'Etap 2 · Dzień 9–10 (22–23.06 · Dzień Ojca)',
    name: 'Ojców i Ojcowski Park Narodowy — Uroczysty Pobyt w Dzień Ojca (23 czerwca)',
    location: 'Ojców / Pieskowa Skała / Dolina Prądnika',
    country: 'Polska',
    dayReference: 'Dzień 9 i 10 (22–23 czerwca · Dzień Ojca)',
    category: 'Sanktuarium i Kult',
    stopType: 'Dzień wolny / Skupienia',
    description:
      'Wyjątkowy, symboliczny punkt całej pielgrzymki: wejście 22 czerwca przez Pieskową Skałę i Maczugę Herkulesa do Ojcowa oraz uroczysty pobyt w Ojcowie dokładnie 23 czerwca — w Dzień Ojca. Według tradycji król Kazimierz Wielki nazwał zamek „Ojców” („Ojcowski Zamek”) na cześć swojego ojca, Władysława Łokietka, który ukrywał się w tutejszej grocie.',
    mustSeeHighlights: [
      'Kaplica „Na Wodzie” pw. św. Józefa Robotnika w Ojcowie (zbudowana w 1901 r. na betonowych podporach ponad korytem Prądnika) — Msza Św. w Dzień Ojca (23.06) u Patrona Ojców',
      'Ruiny Zamku Kazimierzowskiego w Ojcowie z XIV wieku oraz renesansowy Zamek w Pieskowej Skale z Maczugą Herkulesa',
      'Skalna Brama Krakowska, Źródło Miłości, Igła Deotymy oraz Jaskinia (Grota) Łokietka w Dolinie Prądnika',
    ],
    pilgrimPracticalTip:
      'Poranek i przedpołudnie 23 czerwca (Dzień Ojca) przeznaczone są na wspólną modlitwę za żyjących i zmarłych ojców w Kaplicy „Na Wodzie” św. Józefa, odpoczynek przy Źródle Miłości oraz zwiedzanie Zamku w Ojcowie i Groty Łokietka.',
  },
  {
    id: 'att-2-tyniec-lagiewniki',
    stageId: 2,
    stageCode: 'Etap 2 · Dzień 10–11 (23–25.06)',
    name: 'Opactwo Benedyktynów w Tyńcu oraz Sanktuarium Bożego Miłosierdzia w Krakowie-Łagiewnikach',
    location: 'Kraków – Tyniec i Kraków – Łagiewniki',
    country: 'Polska',
    dayReference: 'Dzień 10 i 11 (24–25 czerwca — Finał Etapu 2)',
    category: 'Sanktuarium i Kult',
    stopType: 'Dzień wolny / Skupienia',
    description:
      'Zwieńczenie drugiego etapu: ufundowane w 1044 r. Opactwo Benedyktynów na wapiennej skale nad Wisłą w Tyńcu, a następnie przejście przez Białe Morza (Sanktuarium św. Jana Pawła II) do światowego centrum kultu Bożego Miłosierdzia w krakowskich Łagiewnikach. Dzień 25 czerwca stanowi pełny dzień skupienia, modlitwy i zwiedzania Krakowa.',
    mustSeeHighlights: [
      'Kościół św. Piotra i Pawła, romański krużganek i muzeum opactwa w Tyńcu nad przełomem Wisły',
      'Kaplica klasztorna Zgromadzenia Sióstr Matki Bożej Miłosierdzia z łaskami słynącym obrazem „Jezu, ufam Tobie” i grobem św. Faustyny Kowalskiej',
      'Bazylika Bożego Miłosierdzia z 77-metrową wieżą widokową oraz Sanktuarium św. Jana Pawła II z mozaikami o. Marko Rupnika',
      'W dniu wolnym (25.06): Katedra Królewska na Wawelu (Konfesja św. Stanisława) i Kościół Mariacki z ołtarzem Wita Stwosza',
    ],
    pilgrimPracticalTip:
      'Dzień 25 czerwca jest dniem bez marszu liniowego — rano czas na regenerację i nawiedzenie Wawelu, a o godz. 15:00 wspólna Godzina Miłosierdzia w Łagiewnikach.',
  },

  // ==================== ETAP 3: KRAKÓW-ŁAGIEWNIKI -> KOCHŁOWICE ====================
  {
    id: 'att-3-oswiecim-harmeze',
    stageId: 3,
    stageCode: 'Etap 3 · Dzień 13 (27.06)',
    name: 'Centrum św. Maksymiliana w Harmężach oraz Miejsce Pamięci Auschwitz-Birkenau',
    location: 'Oświęcim / Harmęże',
    country: 'Polska',
    dayReference: 'Dzień 13 (Dzień 2 Etapu 3)',
    category: 'Sanktuarium i Kult',
    stopType: 'Popołudnie po etapie',
    description:
      'Miejsce głębokiej zadumy na szlaku powrotnym: franciszkańskie Centrum św. Maksymiliana Marii Kolbego w Harmężach oraz sąsiedni Oświęcim z Sanktuarium Matki Bożej Wspomożenia Wiernych i Państwowym Muzeum Auschwitz-Birkenau (UNESCO).',
    mustSeeHighlights: [
      'Poruszająca ekspozycja „Klisze Pamięci. Labirynty” autorstwa Mariana Kołodzieja (więźnia pierwszego transportu nr 432) w podziemiach kościoła w Harmężach',
      'Sanktuarium Salezjańskie MB Wspomożenia Wiernych i Zamek Książąt Oświęcimskich nad Sołą',
      'Cela męczeństwa św. Maksymiliana Kolbego (Blok 11) oraz Międzynarodowy Pomnik Ofiar w Brzezince',
    ],
    pilgrimPracticalTip:
      'Zwiedzanie wystawy „Klisze Pamięci” z oprowadzaniem franciszkańskim odbywa się wieczorem o godz. 18:30 po zakwaterowaniu w Domu Pielgrzyma w Harmężach.',
  },
  {
    id: 'att-3-bierun-mikolow',
    stageId: 3,
    stageCode: 'Etap 3 · Dzień 14–15 (28–29.06)',
    name: 'Sanktuarium św. Walentego w Bieruniu Starym i Bazylika św. Wojciecha w Mikołowie',
    location: 'Bieruń Stary / Mikołów / Kochłowice',
    country: 'Polska',
    dayReference: 'Dzień 14 i 15 (28–29 czerwca — Powrót do Kochłowic)',
    category: 'Sanktuarium i Kult',
    stopType: 'Postój na trasie (30–90 min)',
    description:
      'Ostatnie sanktuaria przed powrotem do Kochłowic: XVII-wieczny drewniany kościółek św. Walentego („Walencinek”) w Bieruniu Starym nad historyczną Wielką Groblą oraz neoromańska Bazylika św. Wojciecha w Mikołowie z cudownym obrazem Matki Bożej Mikołowskiej.',
    mustSeeHighlights: [
      'Drewniane Sanktuarium św. Walentego w Bieruniu Starym (z 1628 r.) — perła architektury zrębowej na Górnym Śląsku',
      'Bazylika św. Wojciecha oraz stary kościół MB Śnieżnej w Mikołowie',
      'Uroczyste domknięcie pętli polskiej przed Kościołem Trójcy Świętej i Sanktuarium MB z Lourdes w Kochłowicach (29 czerwca, w uroczystość św. Piotra i Pawła)',
    ],
    pilgrimPracticalTip:
      'W Bieruniu Starym pielgrzymi otrzymują pamiątkową pieczęć patrona archidiecezji i chorych — św. Walentego.',
  },

  // ==================== ETAP 4: KOCHŁOWICE -> SANTIAGO DE COMPOSTELA ====================
  {
    id: 'att-4-olomuniec-brno-telc',
    stageId: 4,
    stageCode: 'Etap 4 · Czechy (Dni 16–28)',
    name: 'Święty Kopeček w Ołomuńcu, Bazylika w Třebíču i Renesansowy Telč (UNESCO)',
    location: 'Ołomuniec / Brno / Třebíč / Telč',
    country: 'Czechy',
    dayReference: 'Dni 16–28 (Morawy i Wysoczyna)',
    category: 'Zabytek Architektury / UNESCO',
    stopType: 'Popołudnie po etapie',
    description:
      'Morawski odcinek Drogi św. Jakuba prowadzi przez perły architektury wpisane na listę UNESCO: barokową Bazylikę Nawiedzenia NMP na Świętym Kopečku nad Ołomuńcem, Katedrę św. Wacława, romańsko-gotycką Bazylikę św. Prokopa w Třebíču oraz arkadowy rynek w Telču.',
    mustSeeHighlights: [
      'Kolumna Trójcy Przenajświętszej w Ołomuńcu (UNESCO — bezpośrednio korespondująca z wezwaniem parafii w Kochłowicach!)',
      'Krypta XII-wieczna w Bazylice św. Prokopa w Třebíču i Katedra św. Piotra i Pawła w Brnie',
      'Zamek i renesansowe kamienice z podcieniami w Telču oraz Český Krumlov nad zakolem Wełtawy',
    ],
    pilgrimPracticalTip:
      'W Ołomuńcu warto zaplanować półdniowy odpoczynek przy Kolumnie Trójcy Świętej — monumentalnym barokowym pomniku dziękczynnym z 1754 roku.',
  },
  {
    id: 'att-4-ratyzbona-ulm-einsiedeln',
    stageId: 4,
    stageCode: 'Etap 4 · Niemcy i Szwajcaria (Dni 29–52)',
    name: 'Katedry w Pasawie, Ratyzbonie i Ulm oraz Opactwo Einsiedeln na Via Jacobi',
    location: 'Pasawa / Ratyzbona / Ulm / Einsiedeln / Flüeli-Ranft',
    country: 'Niemcy / Szwajcaria',
    dayReference: 'Dni 29–52 (Bawaria, Szwabia, Alpy Szwajcarskie)',
    category: 'Sanktuarium i Kult',
    stopType: 'Dzień wolny / Skupienia',
    description:
      'Przejście wzdłuż Dunaju przez Pasawę (największe organy katedralne świata), średniowieczną Ratyzbonę (UNESCO), Katedrę w Ulm z najwyższą kościelną wieżą w Europie (161,5 m) oraz przez Jezioro Bodeńskie do szwajcarskiego sanktuarium Czarnej Madonny w Einsiedeln.',
    mustSeeHighlights: [
      'Szkocki Kościół św. Jakuba (Schottenkirche) z romańskim portalem w Ratyzbonie oraz gotycka Katedra w Ulm',
      'Opactwo Benedyktynów w Einsiedeln z Kaplicą Łask Czarnej Madonny i codziennym śpiewem Salve Regina',
      'Wąwóz Ranft (Flüeli-Ranft) — pustelnia patrona Szwajcarii, św. Mikołaja z Flüe (Brata Klausa), oraz Katedra w Lozannie',
    ],
    pilgrimPracticalTip:
      'Opactwo Einsiedeln to tradycyjny punkt 1-dniowego odpoczynku przed alpejskimi podejściami szlaku Via Jacobi w kierunku Jeziora Genewskiego.',
  },
  {
    id: 'att-4-lepuy-conques-santiago',
    stageId: 4,
    stageCode: 'Etap 4 · Francja i Hiszpania (Dni 53–110)',
    name: 'Via Podiensis (Le Puy-en-Velay, Conques) i Camino Francés (Burgos, León, Santiago de Compostela)',
    location: 'Le Puy-en-Velay / Conques / Burgos / León / Santiago de Compostela',
    country: 'Francja / Hiszpania',
    dayReference: 'Dni 53–110 (Via Podiensis GR65 i Camino Francés · Meta 2 października)',
    category: 'Sanktuarium i Kult',
    stopType: 'Dzień wolny / Skupienia',
    description:
      'Historyczne serce szlaku Jakubowego: wulkaniczne iglice Le Puy-en-Velay, romańskie opactwo Sainte-Foy w Conques, przełęcz Roncesvalles w Pirenejach, gotyckie katedry w Burgos i León, Żelazny Krzyż (Cruz de Ferro) oraz meta Etapu 4 — Katedra św. Jakuba w Santiago de Compostela.',
    mustSeeHighlights: [
      'Katedra Notre-Dame w Le Puy-en-Velay oraz kaplica Saint-Michel d’Aiguilhe na 82-metrowej iglicy wulkanicznej',
      'Romański tympanon Sądu Ostatecznego i złoty relikwiarz św. Wiery w Conques oraz most Valentré w Cahors',
      'Gotycka Katedra w Burgos, witraże Katedry w León, Pałac Gaudiego w Astordze i kielich Cudu Eucharystycznego w O Cebreiro',
      'Pórtico de la Gloria, krypta z relikwiami św. Jakuba Apostoła i kadzielnica Botafumeiro w Katedrze w Santiago de Compostela',
    ],
    pilgrimPracticalTip:
      'W Biurze Pielgrzyma (Oficina del Peregrino przy Rúa das Carretas 33 w Santiago) na podstawie pieczątek z Kochłowic i całej trasy wydawany jest łaciński dokument „Compostela”.',
  },

  // ==================== ETAP 5: SANTIAGO -> WATYKAN -> JEROZOLIMA ====================
  {
    id: 'att-5-oviedo-montserrat-arles',
    stageId: 5,
    stageCode: 'Etap 5A · Hiszpania i Prowansja (Dni 111–145)',
    name: 'Cámara Santa w Oviedo, Opactwo Montserrat i Sanktuarium św. Marii Magdaleny w Prowansji',
    location: 'Oviedo / Loyola / Montserrat / Arles / Sainte-Baume',
    country: 'Hiszpania / Francja',
    dayReference: 'Dni 111–145 (Szlak do Italii)',
    category: 'Sanktuarium i Kult',
    stopType: 'Dzień wolny / Skupienia',
    description:
      'Trasa łącząca Atlantyk z Morzem Śródziemnym: Katedra San Salvador w Oviedo z relikwią Sudarium (Chusty z Oviedo), dom narodzin św. Ignacego w Loyoli, skalne sanktuarium w Montserrat oraz prowansalska Grota Sainte-Baume, gdzie ostatnie lata życia spędziła św. Maria Magdalena.',
    mustSeeHighlights: [
      'Cámara Santa w Oviedo (UNESCO) zgodnie z przysłowiem pątniczym: „Kto idzie do Santiago, a nie do Salwadora, odwiedza sługę, a pomija Pana”',
      'Opactwo Benedyktynów na górze Montserrat (chór chłopięcy Escolania i figura La Moreneta)',
      'Romański kościół św. Trofima i antyczny amfiteatr w Arles oraz skalna grota Sainte-Baume w Prowansji',
    ],
    pilgrimPracticalTip:
      'Montserrat jest idealnym miejscem na dzień skupienia po przejściu Pirenejów i Aragonii.',
  },
  {
    id: 'att-5-francigena-watykan',
    stageId: 5,
    stageCode: 'Etap 5A · Via Francigena i Watykan (Dni 146–180)',
    name: 'Lukka, San Gimignano, Siena, Bolsena oraz Bazylika św. Piotra w Watykanie',
    location: 'Lukka / Siena / Bolsena / Watykan (Rzym)',
    country: 'Włochy / Watykan',
    dayReference: 'Dzień 180 (11 grudnia · Finał Części 5A — Watykan)',
    category: 'Sanktuarium i Kult',
    stopType: 'Dzień wolny / Skupienia',
    description:
      'Włoska Via Francigena przez wzgórza Toskanii i Lacjum do progów Apostołów (Ad Limina Apostolorum): Katedra w Lukce z Volto Santo, średniowieczne wieże San Gimignano, Siena św. Katarzyny, Bolsena (Cud Eucharystyczny) oraz Rzym i Watykan.',
    mustSeeHighlights: [
      'Katedra w Sienie (Duomo), Piazza del Campo oraz Bazylika San Domenico z relikwiami św. Katarzyny ze Sieny',
      'Bazylika św. Krystyny w Bolsenie (miejsce Cudu Eucharystycznego z 1263 r., który zapoczątkował święto Bożego Ciała)',
      'Bazylika św. Piotra w Watykanie (Grób św. Piotra Apostoła i św. Jana Pawła II) oraz 4 Bazyliki Większe Rzymu (Lateran, Santa Maria Maggiore, św. Pawła za Murami) i Święte Schody (Scala Sancta)',
    ],
    pilgrimPracticalTip:
      'W zakrystii Bazyliki św. Piotra w Watykanie (Ufficio Accoglienza Pellegrini) pielgrzymi piesi otrzymują oficjalny certyfikat „Testimonium” potwierdzający dojście do grobu Księcia Apostołów.',
  },
  {
    id: 'att-5-montecassino-bari-egnatia',
    stageId: 5,
    stageCode: 'Etap 5B · Południowe Włochy, Grecja i Azja Mniejsza (Dni 181–252)',
    name: 'Monte Cassino, Bazylika św. Mikołaja w Bari, Meteory, Saloniki, Efez i Antiochia',
    location: 'Monte Cassino / Bari / Saloniki / Filippi / Efez / Tars / Antiochia',
    country: 'Włochy / Grecja / Turcja',
    dayReference: 'Dni 181–252 (Via Francigena del Sud, Via Egnatia i Szlak św. Pawła)',
    category: 'Zabytek Architektury / UNESCO',
    stopType: 'Dzień wolny / Skupienia',
    description:
      'Wielki szlak wschodni śladami Apostołów: Opactwo św. Benedykta i Polski Cmentarz Wojenny na Monte Cassino, Sanktuarium św. Michała Archanioła na Gargano, Bari, a następnie grecka Via Egnatia (Meteory, Saloniki, Filippi) oraz Azja Mniejsza (Dom Matki Bożej w Efezie, Tars i Grota św. Piotra w Antiochii).',
    mustSeeHighlights: [
      'Opactwo na Monte Cassino (grób św. Benedykta i św. Scholastyki) oraz Polski Cmentarz Wojenny żołnierzy 2. Korpusu gen. Andersa',
      'Grota Objawień św. Michała Archanioła w Monte Sant’Angelo oraz krypta św. Mikołaja i nagrobek królowej Bony Sforzy w Bari',
      'Klasztory zawieszone na skałach w Meteorach oraz Baptysterium św. Lidii w Filippi (pierwsze ochrzczone miejsce na kontynencie europejskim)',
      'Meryemana (Dom Matki Bożej) i Bazylika św. Jana Apostoła w Efezie, Studnia św. Pawła w Tarsie i Grota św. Piotra w Antiochii',
    ],
    pilgrimPracticalTip:
      'Monte Cassino, Saloniki oraz Efez to strategiczne punkty 1-dniowego odpoczynku i przepakowania ekwipunku.',
  },
  {
    id: 'att-5-ziemia-swieta-jerozolima',
    stageId: 5,
    stageCode: 'Etap 5B · Ziemia Święta i Jerozolima (Dni 253–270)',
    name: 'Góra Karmel, Nazaret, Jezioro Galilejskie, Betlejem i Bazylika Grobu Pańskiego w Jerozolimie',
    location: 'Hajfa / Nazaret / Kafarnaum / Betlejem / Jerozolima',
    country: 'Ziemia Święta',
    dayReference: 'Dni 253–270 (11 marca · Finał Etapu 5 w Jerozolimie)',
    category: 'Sanktuarium i Kult',
    stopType: 'Dzień wolny / Skupienia',
    description:
      'Kulminacja duchowa całej pielgrzymki — przejście piesze przez Galileę i Judeę do Świętego Miasta Jerozolimy: od Groty Eliasza na Górze Karmel, przez Nazaret, Górę Tabor i Kafarnaum, po Betlejem i Bazylikę Grobu Pańskiego w Jerozolimie.',
    mustSeeHighlights: [
      'Bazylika Zwiastowania w Nazarecie, Bazylika Przemienienia na Górze Tabor oraz Góra Ośmiu Błogosławieństw i Kafarnaum nad Jeziorem Galilejskim',
      'Bazylika Narodzenia Pańskiego i Grota Mleczna w Betlejem oraz Ein Karem (miejsce Nawiedzenia św. Elżbiety)',
      'Droga Krzyżowa (Via Dolorosa), Kalwaria (Golgota) i Boży Grób (Anastasis) w Bazylice Grobu Pańskiego w Jerozolimie',
      'Wieczernik na Syjonie Chrześcijańskim, Ogród Oliwny (Getsemani), Bazylika Wszystkich Narodów i Ściana Płaczu',
    ],
    pilgrimPracticalTip:
      'W Franciszkańskim Biurze Pielgrzyma Kustodii Ziemi Świętej (Christian Information Centre przy Bramie Jafskiej w Jerozolimie) pielgrzymi otrzymują „Testimonium Peregrinationis Peractae ad Sanctum Sepulchrum”.',
  },

  // ==================== ETAP 6: JEROZOLIMA -> KOCHŁOWICE (POWRÓT) ====================
  {
    id: 'att-6-ateny-rila-sofia',
    stageId: 6,
    stageCode: 'Etap 6 · Grecja i Bułgaria (Dni 271–312)',
    name: 'Areopag w Atenach, Delfy, Monastyr Rilski (UNESCO) i Rotunda św. Jerzego w Sofii',
    location: 'Ateny / Monastyr Rilski / Sofia',
    country: 'Grecja / Bułgaria',
    dayReference: 'Dni 271–312 (Szlak Bałkański)',
    category: 'Zabytek Architektury / UNESCO',
    stopType: 'Dzień wolny / Skupienia',
    description:
      'Droga powrotna na północ przez kolebkę chrześcijaństwa w Grecji i Bałkany: Wzgórze Areopagu w Atenach (miejsce słynnej mowy św. Pawła o „Nieznanym Bogu”), a następnie górski masyw Riły z najsłynniejszym klasztorem Bułgarii — Monastyrem Rilskim.',
    mustSeeHighlights: [
      'Wzgórze Areopagu i Akropol w Atenach oraz starożytny Korynt (Bema św. Pawła)',
      'Monastyr Rilski (X/XIX w., UNESCO) położony na wysokości 1147 m n.p.m. z pasiastymi arkadami, freskami i relikwiami św. Jana Rilskiego',
      'Wczesnochrześcijańska Rotunda św. Jerzego (IV w.) i Bazylika Mądrości Bożej (Hagia Sophia, miejsce Synodu w Serdyce 343 r.) w Sofii',
    ],
    pilgrimPracticalTip:
      'Monastyr Rilski przyjmuje pielgrzymów w swoich historycznych celach klasztornych — warto zaplanować tam dzień odpoczynku po przejściu gór Piryn.',
  },
  {
    id: 'att-6-wegry-maria-ut-esztergom',
    stageId: 6,
    stageCode: 'Etap 6 · Węgry – Szlak Mária Út (Dni 313–344)',
    name: 'Katedra Wotywna w Segedynie, Bazylika św. Stefana w Budapeszcie i Bazylika w Ostrzyhomiu',
    location: 'Segedyn / Budapeszt / Ostrzyhom (Esztergom)',
    country: 'Węgry',
    dayReference: 'Dni 313–344 (Środkowoeuropejski Szlak Maryjny Mária Út)',
    category: 'Sanktuarium i Kult',
    stopType: 'Popołudnie po etapie',
    description:
      'Węgierski odcinek prowadzi oznakowanym Szlakiem Maryjnym (Mária Út): od Katedry Wotywnej w Segedynie, przez Budapeszt (z relikwią Prawicy króla św. Stefana i Grotą Paulinów na Górze Gellerta — macierzystego zakonu Jasnej Góry!) po monumentalną Bazylikę Prymasowską w Ostrzyhomiu nad Dunajem.',
    mustSeeHighlights: [
      'Kościół Skalny Ojców Paulinów na Górze Gellerta w Budapeszcie (historyczna więź z Jasną Górą z 1382 roku) oraz Bazylika św. Stefana',
      'Bazylika NMP i św. Wojciecha w Ostrzyhomiu (Esztergom) — największa świątynia Węgier z renesansową kaplicą Bakócza i panoramą Zakola Dunaju',
    ],
    pilgrimPracticalTip:
      'Przejście Mostem Marii Walerii z Ostrzyhomia do Štúrova otwiera ostatni, karpacki etap powrotu przez Słowację do Polski.',
  },
  {
    id: 'att-6-slowacja-beskidy-kochlowice',
    stageId: 6,
    stageCode: 'Etap 6 · Słowacja, Beskid Śląski i Kochłowice (Dni 345–365)',
    name: 'Kalwaria w Bańskiej Szczawnicy, Turzovka, Kaplicówka w Skoczowie i Powrót do Kochłowic',
    location: 'Bańska Szczawnica / Stare Hory / Turzovka / Skoczów / Pszczyna / Kochłowice',
    country: 'Słowacja / Polska',
    dayReference: 'Dni 345–365 (Zamknięcie 365-dniowego roku pielgrzymki w Kochłowicach)',
    category: 'Sanktuarium i Kult',
    stopType: 'Postój na trasie (30–90 min)',
    description:
      'Ostatnie tygodnie powrotu prowadzą przez górnicze miasto Bańska Szczawnica (UNESCO), słowackie sanktuaria maryjne w Starych Horach, Rajeckiej Lesnej i na górze Żivčáková w Turzovce, a następnie przez Trójstyk w Jaworzynce, Wisłę, Wzgórze Kaplicówka w Skoczowie i Pszczynę prosto do Kościoła Trójcy Świętej i Sanktuarium MB z Lourdes w Kochłowicach.',
    mustSeeHighlights: [
      'Barokowa Kalwaria w Bańskiej Szczawnicy (UNESCO) wkomponowana w stożek wygasłego wulkanu Scharffenberg',
      'Ruchoma Drewniana Szopka Słowacka w Rajeckiej Lesnej oraz źródełka na górze Żivčáková w Turzovce',
      'Sanktuarium św. Jana Sarkandra na Kaplicówce w Skoczowie (miejsce pielgrzymki św. Jana Pawła II w 1995 r.) oraz Zamek w Pszczynie',
      'Uroczyste wejście dziękczynne do Kościoła Trójcy Świętej i Groty Lurdzkiej w Rudzie Śląskiej-Kochłowicach (zamknięcie pętli 11 947 km)',
    ],
    pilgrimPracticalTip:
      'Od granicy polsko-słowackiej w Koniakowie/Istebnej (ostatnie 5 dni trasy) pątników ponownie wspiera bus parafialny z Kochłowic.',
  },
];
