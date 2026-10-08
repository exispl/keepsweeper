# 🏰 Keepsweeper — Architektura Gry & Rekomendacje Nowoczesnych Silników

Niniejszy dokument przedstawia obecną strukturę techniczną **Keepsweeper** oraz wytyczne architektoniczne i rekomendacje dla przyszłego rozwoju projektu z wykorzystaniem nowoczesnych silników animacji, bibliotek komponentowych i frameworków graficznych (GSAP, Framer Motion, shadcn/ui, Pixi.js, Three.js, React/Vite, Node.js).

---

## 1. Aktualna Architektura Systemu (Wersja v1.5.0)

Keepsweeper działa obecnie jako zero-dependency, ultra-wydajny silnik HTML5 Canvas + Web Audio API + natywny JavaScript ES6:

```
keepsweeper/
├── index.html         # Struktura DOM: okno Win95 / Kolonizacja, paski stanu, modale, canvas
├── style.css          # Wysokokontrastowe motywy (Pergamin, Łąka, Błękit, Win95, Drewno), 340px sidebar
├── game.js            # Główny silnik: pętla gry (requestAnimationFrame), stan, logika sapera, AI
├── sprites.js         # Proceduralny generator grafiki retro i pixel-art (48x48) z pamięcią podręczną
├── audio.js           # Syntezator efektów dźwiękowych Web Audio API (wybuchy, fanfary, marsz, dzwonki)
├── i18n.js            # Pełna wielojęzyczność (PL / EN) przełączana w czasie rzeczywistym
├── server.js          # Lekki serwer HTTP w Node.js (port 8795) serwujący zasoby statyczne
└── version.json       # Wersjonowanie semantyczne i kronika aktualizacji
```

### Kluczowe komponenty silnika:
1. **Proceduralny Generator Lądów (`generateContinentalMap`)**:
   - Geometria wielokątów (Ray-casting `isPointInPolygon`) odwzorowująca kontury kontynentów oraz realny kształt **Polski 🇵🇱** (wybrzeże Bałtyku, Mazury, Karpaty, puszcze).
   - Generowanie min, skrzyń ze złotem (5.5%+ szansy), wiosek tubylców i jaskiń smoków.
   - Naturalne odsłonięcie plaży lądowania z widocznymi cyframi granicznymi.
2. **Korpus Saperów & Jednostki Lądowe**:
   - Ruch z prędkością 850–1400 px/s z omijaniem głębokiej wody morskiej (`terrain === 'water'`).
   - Czuwanie saperów na odkrytych kafelkach po zakończeniu prac wykopowych.
3. **Żyjący Ocean (Living Ocean)**:
   - Karawele żeglujące wzdłuż morskich szlaków z animacją falowania i smugą kilwateru.
   - Skaczące delfiny (`🐬`) o trajektorii parabolicznej z kropelkami wody (`💦`).
4. **Strategia & Plemiona Indian**:
   - 6 historycznych nacji (Irokezi, Siuksowie, Komancze, Majowie, Algonkini, Apacze) periodycznie odkrywających bezpieczne sektory.
   - Budynki z palety: Chata, Koszary, Wieża Strażnicza, Targ, Farma, Mur, Cud Świata.
5. **System Flag Anti-Cheat**:
   - Usunięto natychmiastowe przyznawanie punktów za postawienie flagi; dokładność i premie naliczane są dopiero po zakończeniu misji.
   - Flagi wyśrodkowane w kafelkach 48x48.
6. **Profil Dowódcy**:
   - Wybór 8 unikalnych awatarów (3 męskie, 3 żeńskie, 2 roboty) oraz wprowadzanie własnego imienia.

---

## 2. Rekomendacje Nowoczesnych Silników & Ekosystemu Frontendowego

Zgodnie z planem dalszego rozwoju projektu, Keepsweeper może zostać rozbudowany o dedykowany stos technologiczny gwarantujący płynne animacje 60/120 FPS, kinowe przejścia oraz nowoczesne komponenty interfejsu użytkownika.

### A. GSAP (GreenSock Animation Platform)
**Zastosowanie:** Kinowe osie czasu (Timelines), animacje sekwencji, choreografia jednostek, efekty cząsteczkowe.

- **Dlaczego GSAP?**
  - Niezrównana wydajność i zero spadków klatek podczas intensywnych wybuchów na planszy.
  - Wtyczka **Flip Plugin**: Płynne animacje transformacji elementów DOM (np. powiększanie kart dowódcy, rozwijanie palety budynków, płynny zoom minimapy).
  - Wtyczka **ScrollTrigger & MotionPath**: Możliwość zdefiniowania krętych szlaków żeglugi karawel i karawan handlowych po rzekach i oceanach wzdłuż ścieżek krzywych Beziera (SVG).
- **Przykład integracji w Node.js / Vite:**
  ```javascript
  import { gsap } from 'gsap';
  import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
  gsap.registerPlugin(MotionPathPlugin);

  // Animacja skoku delfina w łuku:
  gsap.to(dolphin, {
    duration: 1.2,
    motionPath: {
      path: [{x: startX, y: startY}, {x: midX, y: midY - 30}, {x: endX, y: endY}],
      curviness: 1.5,
      autoRotate: true
    },
    ease: "power2.inOut",
    onComplete: () => spawnWaterSplash(endX, endY)
  });
  ```

---

### B. Framer Motion
**Zastosowanie:** Mikrointerakcje UI, dynamiczne okna dialogowe (modale), karty talentów, tooltipy i paski stanu.

- **Dlaczego Framer Motion?**
  - Naturalna fizyka sprężyn (Spring Physics) — okna modalne otwierają się miękko i dynamicznie reagują na interakcję.
  - `AnimatePresence`: Gwarantuje płynne animacje wygaszania komunikatów event ticker, powiadomień o awansie bohatera i dymków zysku złota (+10 💰).
  - Wsparcie dla gestów przeciągania (drag & drop) przy planowaniu pozycji budynków.
- **Wzorzec w React:**
  ```tsx
  <motion.div
    initial={{ scale: 0.8, opacity: 0, y: 20 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0.8, opacity: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="commander-profile-modal"
  >
    {/* Zawartość profilu dowódcy */}
  </motion.div>
  ```

---

### C. shadcn/ui & Tailwind CSS
**Zastosowanie:** Standaryzacja komponentów, ergonomia, responsywność i modularność stylów.

- **Dlaczego shadcn/ui?**
  - Komponenty bazujące na **Radix UI** — w pełni dostępne (WCAG/a11y), z obsługą klawiatury (Tab, Enter, Escape, strzałki).
  - Wygodne komponenty:
    - `Dialog` & `Sheet`: dla paneli bocznych kolonizacji, handlu i badań.
    - `Command` (Palette `Ctrl+K`): szybkie wyszukiwanie prowincji, budynków i komend dowódcy.
    - `Tooltip` & `HoverCard`: zaawansowane dymki inspektora kafelków ze statystykami.
    - `Tabs`: czyste przełączanie między misjami (Smok, Odzyskanie, Skarbiec, Oblężenie).
    - `Select` & `DropdownMenu`: estetyczny wybór kontynentu, trudności i motywów.
- **Tailwind Tokens:**
  - Zdefiniowanie palety kolorów dla motywów: Win95 Teal, Colonization Wood, Azure Blue, Meadow Green, Parchment Light.

---

### D. Pixi.js lub Three.js (Akceleracja WebGL)
**Zastosowanie:** Renderowanie tysięcy elementów graficznych, cieniowanie wody i mgły wojny z akceleracją sprzętową karty graficznej.

- **Dlaczego Pixi.js?**
  - Błyskawiczny silnik 2D WebGL z automatycznym batchingiem sprajtów.
  - Shadery fragmentów (GLSL):
    - Realistyczne refleksy słońca na tafli wody i falowanie oceanu.
    - Płynne rozpływanie się mgły wojny (Fog of War) z miękkimi krawędziami wokół saperów.
    - Dynamiczne oświetlenie pochodni obozowisk i ognia w jaskiniach smoków.
- **Dlaczego Three.js (opcja 2.5D / 3D)?**
  - Możliwość przejścia w izometryczną perspektywę 3D (styl Civilization IV / Heroes III), z modelami 3D budynków, żaglowców i falującej wody.

---

### E. Architektura Backendowa (Node.js / Express / Socket.io)
**Zastosowanie:** Tryb wieloosobowy (Multiplayer), rankingi globalne w chmurze i synchronizacja stanu.

1. **Współdzielona Kolonizacja (Co-Op Keepsweeping)**:
   - Kilku graczy jednocześnie eksploruje wielką mapę kontynentu (np. Polska 100x100), każdy kontroluje swój zespół saperów.
2. **Globalny Ranking & Replay System**:
   - Zapis przebiegu meczów (sekwencja kliknięć i czasów) z możliwością odtworzenia speedruna.
3. **Pokoje PVP**:
   - Rywalizacja dwóch kolonii: kto szybciej i z mniejszą liczbą skuch oczyści swój sektor kontynentu.

---

## 3. Plan Wdrożenia (Roadmap Migracji)

| Etap | Zakres prac | Stos technologiczny |
| :--- | :--- | :--- |
| **Krok 1 (Zrealizowano)** | Nowy silnik procedur lądowych (Polska 🇵🇱, Afryka, itp.), 8 awatarów, żyjący ocean (karawele, delfiny), 6 plemion Indian, budowa obiektów, fair anti-cheat flagi. | HTML5 Canvas, Vanilla JS, CSS3, Web Audio API |
| **Krok 2** | Integracja GSAP dla płynnych animacji marszu saperów, trajektorii delfinów i wybuchów cząsteczkowych. | GSAP 3.x, MotionPath |
| **Krok 3** | Przebudowa interfejsu UI na komponenty shadcn/ui i Tailwind CSS (React + Vite). | React 19, Vite, Tailwind CSS, Radix UI |
| **Krok 4** | Zastąpienie Canvas 2D silnikiem Pixi.js (shadery wody, zaawansowane cząsteczki dymu i ognia). | Pixi.js v8, WebGL, GLSL Shaders |
| **Krok 5** | Wdrożenie modułu wieloosobowego (Multiplayer Co-Op / PvP). | Node.js, Express, Socket.io, Redis / SQLite |

---

*Keepsweeper Engine Architecture Document — v1.5.0 (2026)*
