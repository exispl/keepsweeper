# 🏰 Keepsweeper (v1.3.0)

> **Minesweeper Kingdom Defense & 4X Retro Exploration**  
> Hybryda klasycznego Sapera (Windows 95/98), budowy królestwa, mechanik *Civilization 1* oraz obrony przed smokami i hordami goblinów.

![Keepsweeper Banner](https://img.shields.io/badge/Version-1.3.0-brightgreen.svg)
![HTML5](https://img.shields.io/badge/Stack-HTML5%20%7C%20Canvas%20%7C%20WebAudio-orange.svg)
![Retro](https://img.shields.io/badge/Style-Windows%2095%20%2B%20Civ%201-blue.svg)
![License](https://img.shields.io/badge/License-MIT-purple.svg)

---

## 📖 O Grze / Game Overview

**Keepsweeper** to gra strategiczno-logiczna, która rozwiązuje największą bolączkę klasycznego Sapera — **frustrującą natychmiastową śmierć przy jednej pomyłce**. 

Zamiast nagłego wybuchu całej planszy, gracz zarządza **Królewskim Korpusem Saperów**, rozwija osadę na bezpiecznych terenach (jak w *Civilization 1*), kontaktuje się z przyjaznymi plemionami tubylców, wznosi Cuda Świata i odpiera ataki latających smoków za pomocą wież strażniczych i armii!

---

## ✨ Kluczowe Mechaniki

### 1. ⛑️ System Skuch i Korpus Saperów (Brak natychmiastowej porażki)
* **Kliknięcie miny to skucha, a nie Game Over**: mina eksploduje ze wstrząsem ekranu (*screen-shake*) i tworzy dymiący krater, który odtąd jest bezpieczny i odsłania okoliczne liczby.
* **Straty w ludziach**: w wybuchu ginie 1 Saper z Twojej rezerwy (`3/3` ➔ `2/3`).
* **Zaciąg uzupełnień**: w każdej chwili możesz zrekrutować nowego sapera za 40 złota przyciskiem `+⛑️ 40💰`.
* Dopiero brak saperów i zniszczenie Zamku kończy grę porażką!

### 2. 🔮 Królewskie Moce (Trafianie w Ciemno & Likwidacja 50/50)
Pasek mocy (`✨ Moce`) oddaje do dyspozycji potężne narzędzia zwiadowcze:
* 🔮 **Boska Wyrocznia (Divine Oracle)**: Bezpiecznie bada dowolny zakryty kafel w ciemno. Jeśli to niebezpieczeństwo — stawia **Złotą Flagę Wyroczni**, neutralizując ryzyko!
* 🦅 **Sokoli Zwiad (Falcon Recon)**: Sokół przelatuje nad sektorem 3x3, odkrywa bezpieczną ziemię i oznacza zagrożenia.
* 🛡️ **Pancerz Saperski (Blast Shield)**: Pole siłowe chroniące przed skutkami kolejnej skuchy (saper nie ginie).
* 💣 **Ostrzał Katapulty (Catapult Bombard)**: Zdalna detonacja podejrzanego kafelka z dystansu bez ofiar w ludziach.
* 🧲 **Sonda Saperska (Sapper Probe)**: 80% szansy na rozbrojenie miny i pozyskanie +30 złota ze złomu!

### 3. 🏕️ Inspiracje Civilization 1 (Wioski Indian, Cuda i Drogi)
* **Wioski Tubylców (Wigwamy / Huts)**: Odkrycie wioski na mapie skutkuje kontaktem ze starszyzną i losowym darem:
  * 👑 *Mądrość Przodków*: +2 Królewskie Pieczęcie na badania,
  * 💰 *Złoty Skarb*: +80 zasobów,
  * 🏹 *Wojownicy Tubylczy*: sprzymierzony łucznik dołącza do armii,
  * 🗺️ *Zwiad Plemion*: Indianie oznaczają okoliczne miny złotymi flagami.
* **Cud Świata (Wonder of the World)**: Monumentalny Kolos/Obelisk co 15 sekund automatycznie rozświetla mgłę i odkrywa bezpieczne pole.
* **Wozy Osadników (Settlers)**: Wędrowni pionierzy kładący brukowane trakty i drogi łączące królestwo.

### 4. 🚶 Żywe Królestwo (Autonomiczny Ruch Ludzi)
* Mieszkańcy (Robotnicy, Saperzy, Rycerze, Osadnicy, Indianie) swobodnie **poruszają się po odkrytych łąkach i traktach planszy**.
* Saperzy patrolują krawędzie mgły wojny z wysuniętą lancą wykrywacza.
* Żołnierze i tubylcy automatycznie szarżują na pojawiające się gobliny i strzelają do smoków.

---

## 🕹️ Sterowanie (Controls)

| Akcja | Klawisz / Mysz |
| :--- | :--- |
| **Odkrycie pola / Budowa** | **LPM (Lewy Przycisk Myszy)** |
| **Postawienie / Zdjęcie Flagi** | **PPM (Prawy Przycisk Myszy)** *(niezawodny toggle)* |
| **Szybki Akord (Chording)** | **PPM / Podwójny klik** na odkrytą cyfrę |
| **Przesuwanie kamery** | **ŚPM (Kółko) / Przeciąganie z Shift / Dotyk** |
| **Przybliżanie / Oddalanie** | **Rolka myszy / Przyciski `[-]` `[+]`** |
| **Panel Budowy** | Przycisk **`🔨 Buduj`** na dolnym pasku |
| **Panel Mocy** | Przycisk **`✨ Moce`** na dolnym pasku |
| **Zaciąg Sapera** | Przycisk **`+⛑️ 40💰`** w nagłówku |

---

## 🏗️ Budynki w Królestwie

* 🏰 **Zamek (Keep)**: Serce państwa, generuje zasoby i robotników.
* 🏠 **Chata (House)**: +2 robotników i stały podatek co sekundę.
* 🛡️ **Koszary (Barracks)**: Szkolenie ciężkiej piechoty i rycerzy (+5 limit armii).
* 🏹 **Wieża Strażnicza (Watchtower)**: Zasięg 240px, automatyczny ostrzał smoków i goblinów.
* 🏪 **Targ (Market)**: +50% do zysku z sąsiadujących chat.
* 🌾 **Farma / Młyn (Farm)**: Produkcja żywności i surowców co 3 sekundy.
* 🧱 **Mur Kamienny (Wall)**: 300 HP, blokuje ruch potworów.
* 🏛️ **Cud Świata (Wonder)**: Odkrywa bezpieczne kafelki co 15 sekund.
* 🐎 **Wóz Osadników (Settler)**: Kładzie sieć dróg po odkrytym terenie.

---

## 🚀 Jak Uruchomić Grę (How to Run)

### Opcja 1: Z lokalnym serwerem Node.js (Zalecane)
```bash
# Uruchomienie serwera na porcie 8795
node server.js
```
Następnie otwórz przeglądarkę na:  
👉 **http://localhost:8795**

### Opcja 2: Bezpośrednio z pliku HTML
Możesz po prostu dwukrotnie kliknąć plik `index.html` w Eksploratorze Windows.

---

## 📁 Struktura Projektu

```
keepsweeper/
├── index.html        # Interfejs gry w stylu retro Windows 95
├── style.css         # Autentyczne ramki 3D bevel, diody LED, responsywność
├── game.js           # Główny silnik: Saper, AI jednostek, walka ze smokiem, Cuda Świata
├── sprites.js        # Proceduralny generator grafiki 40px (Canvas pixel-art)
├── audio.js          # Syntezator retro efektów 8-bit (Web Audio API)
├── i18n.js           # Moduł lokalizacji (Polski PL / English EN)
├── version.json      # Metadane wersji i changelog odczytywany na żywo
├── server.js         # Lekki serwer HTTP zero-dependency (port 8795)
└── README.md         # Pełna dokumentacja projektu
```

---

## 📜 Licencja
Projekt udostępniony na licencji **MIT**. Twórz, modyfikuj i baw się dobrze!
