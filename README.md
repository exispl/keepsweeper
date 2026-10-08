# 🏰 Keepsweeper (v1.4.0)

> **Minesweeper & Sid Meier's Colonization Kingdom Defense**  
> Hybryda klasycznego Sapera (Windows 95/98), strategii *Sid Meier's Colonization* i *Civilization 1*, budowy osad oraz obrony przed smokami i rywalizującymi potęgami kolonialnymi.

![Keepsweeper Banner](https://img.shields.io/badge/Version-1.4.0-brightgreen.svg)
![HTML5](https://img.shields.io/badge/Stack-HTML5%20%7C%20Canvas%20%7C%20WebAudio-orange.svg)
![Retro](https://img.shields.io/badge/Style-Colonization%20%2B%20Windows%2095-blue.svg)
![License](https://img.shields.io/badge/License-MIT-purple.svg)

---

## 📖 O Grze / Game Overview

**Keepsweeper** to gra strategiczno-logiczna, łącząca precyzyjną dedukcję minową klasycznego Sapera z rozmachem *Sid Meier's Colonization* i *Civilization 1*.

Gracz ląduje na wybrzeżu niezbadanego kontynentu Nowego Świata. Zarządza **Królewskim Korpusem Saperów**, który fizycznie biegnie do wyznaczonych kafelków i odkopuje ziemię. Na bezpiecznych terenach zakłada i rozwija osadę (od Obozu Pionierów po Królewską Twierdzę), handluje odkopanymi skarbami z zamorskimi kupcami, odpiera smoki i ściga się z rywalami SI eksplorującymi przeciwną stronę lądu!

---

## ✨ Nowości w Wersji v1.4.0

### 1. 🌍 Kształty Kontynentów & Lądowanie na Wybrzeżu
* **Generowanie lądu o kształcie kontynentu**: mapa posiada naturalne linie brzegowe, zatoki, półwyspy, jeziora śródlądowe oraz otaczający ocean.
* **Start wyprawy przy brzegu**: Twoja ekspedycja ląduje na wybrzeżu kontynentu, tuż obok zacumowanej karaweli.

### 2. 🤖 Rywale SI (Hiszpania i Francja)
* **Konkwistadorzy i Francuscy Koloniści** zaczynają po drugiej stronie kontynentu.
* **Eksploracja w tempie gracza**: rywale powoli badają własną granicę, znajdują skarby i od czasu do czasu sami tracą saperów na minach!
* Statystyki rywali i porównanie wyników dostępne są w panelu rankingowym.

### 3. 🖱️ Płynne Sterowanie: Middle Mouse & Mini-Mapa
* **Przesuwanie kamery Środkowym Przyciskiem Myszy (ŚPM / MMB)**: wciśnij rolkę myszy i przeciągnij, aby płynnie sterować widokiem.
* **Interaktywna Mini-Mapa**: radar w prawym górnym rogu pokazuje cały kontynent; kliknięcie lub przeciąganie na minimapce natychmiast centruje kamerę.

### 4. ⛑️ Fizyczny Wykop przez Saperów & Śmiertelne Miny
* Kliknięcie zakrytego pola wysyła **najbliższego sapera biegiem do celu**.
* Jeśli pole jest bezpieczne — zostaje odkopane (+2💰 zasobów).
* Jeśli pod polem kryje się mina — **eksploduje bezpośrednio pod nogami sapera**, zabijając go i pozostawiając dymiący krater!

### 5. ⚡ 12 Talentów SuperBohatera Dowódcy
* 🔮 **Siódmy Zmysł**: 1% szansy co sekundę na samoodsłonięcie bezpiecznego pola.
* 🍀 **Szczęście Sapera**: 3% szansy, że trafiona mina okaże się niewybuchem.
* 👑 **Dotyk Midasa**: +50% więcej zasobów za każde odkryte pole i znalezione złoto.
* 🥾 **Skrzydlate Buty Hermesa**: Saperzy biegają o +80% szybciej.
* 💎 **Królewski Złotnik**: Podwaja liczbę skarbów na mapie.
* 🛡️ **Żelazna Skóra**: Start z darmowym ładunkiem Pancerza Ochronnego.
* 🦅 **Sokole Oko**, 🚩 **Mistrz Flag**, ⛪ **Błogosławieństwo Mnicha**, ⚔️ **Aura Wojownika**, ⚗️ **Alchemia Ziemi**, 🌟 **Niezłomny Duch**.

### 6. 📍 Inspektor Terenu (Prawy Dolny Róg)
* Po najechaniu myszą na dowolne pole w prawym dolnym rogu wyświetla się szczegółowa karta:
  * Tytuł prowincji i koordynaty `[X x Y]`,
  * Rodzaj terenu i poziom zagrożenia minowego,
  * Dokładne bonusy surowcowe (`💰 Złoto: +2`, `🌲 Drewno: +2`, `🛡️ Obrona: +25%`).

### 7. 📈 Wykres Pasma Meczów & Krzywa Skuch
* Dokładne zliczanie błędów (**Skuchy 💥**).
* Zasoby (💰 Skarbiec) są rozdzielone od Czasu (⏱️ Speedrun/Ranking).
* Interaktywny wykres na Canvasie pod profilami zawodników (Generał Jan, Królowa Jadwiga, Rycerz Zawisza, Lord Edward) pokazujący serię zwycięstw/porażek i krzywą popełnionych skuch.

### 8. 🔄 Podwójny Silnik & Dźwięk w Belce Tytułowej
* **Przełącznik Silnika**: błyskawiczna zmiana między trybem **Kolonizacji (Civ/RPG)** a **Klasycznym Saperem Windows 95**!
* **Dźwięk ON/OFF (`🔊` / `🔇`)**: dedykowany przycisk wyciszania bezpośrednio w belce tytułowej obok minimalizacji.
* **Oryginalne kolory Sapera 1-8**: wierna paleta klasycznego Windows 95 (1: Niebieski, 2: Zielony, 3: Czerwony, 4: Ciemnoniebieski, 5: Bordowy, 6: Turkusowy, 7: Czarny, 8: Szary).

---

## 🕹️ Sterowanie (Controls)

| Akcja | Klawisz / Mysz |
| :--- | :--- |
| **Rozkaz wykopu (Saper biegnie)** | **LPM (Lewy Przycisk Myszy)** |
| **Przesuwanie widoku kamery** | **ŚPM (Środkowy Przycisk Myszy / Rolka)** lub **Klik na Mini-Mapie** |
| **Postawienie / Zdjęcie Flagi** | **PPM (Prawy Przycisk Myszy - 1x klik)** |
| **Szybki Akord (Chording)** | **PPM / Podwójny klik** na odkrytą cyfrę |
| **Oddalenie / Przybliżenie (Zoom)** | **Rolka Myszy (Wheel Scroll)** |
| **Wyciszenie dźwięków** | **Przycisk `🔊` w prawym górnym rogu okna** |

---

## 🚀 Uruchomienie Lokalne

```bash
# Sklonuj repozytorium
git clone https://github.com/exispl/keepsweeper.git
cd keepsweeper

# Uruchom wbudowany lekki serwer Node.js
node server.js
```
Otwórz przeglądarkę pod adresem: `http://localhost:8795`

---

## 📜 Licencja
Projekt udostępniany na licencji MIT.
