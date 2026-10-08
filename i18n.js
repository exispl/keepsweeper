// Keepsweeper Localization System (i18n)
// Supports multiple languages, easy to extend with new languages

const translations = {
  pl: {
    // Top Bar & Menu
    gameTitle: "Keepsweeper",
    menuPlay: "Graj",
    menuEditor: "Edytor",
    menuResearch: "Badania",
    menuAchievements: "Osiągnięcia",
    menuSettings: "Ustawienia",
    menuHelp: "Pomoc",

    // Status Bar
    resources: "Zasoby",
    workers: "Robotnicy",
    sappers: "Saperzy",
    soldiers: "Żołnierze",
    uncovered: "Odkryte",
    slain: "pokonano",
    time: "Czas",

    // Action Bar Buttons
    btnBuild: "Buduj",
    btnPowers: "Moce Królewskie",
    btnUpgrades: "Ulepszenia",
    btnTreasures: "Skarby",
    btnFlagMode: "Tryb Flagi",
    btnDigMode: "Tryb Odkrywania",
    btnRecruitSapper: "Zaciąg Sapera (+1)",

    // Royal Powers / Moce do trafiania w ciemno
    powersTitle: "Królewskie Zaklęcia i Narzędzia Zwiadu",
    powerOracle: "Boska Wyrocznia",
    powerOracleDesc: "Ujawnia wybrane pole w ciemno bez ryzyka detonacji! Jeśli to mina – stawia złotą flagę.",
    powerFalcon: "Sokoli Zwiad",
    powerFalconDesc: "Królewski sokół bada obszar 3x3 – bezpiecznie odkrywa wolne pola i wskazuje zagrożenia.",
    powerShield: "Pancerz Saperski",
    powerShieldDesc: "Zakłada pole siłowe na następną skuchę! Jeśli trafisz na minę, saper nie odniesie ran.",
    powerBombard: "Ostrzał Katapulty",
    powerBombardDesc: "Zdalnie detonuje wybrane pole z dystansu. Niszczy miny i potwory bez ofiar w ludziach!",
    powerProbe: "Sonda Saperska",
    powerProbeDesc: "Ostrożnie bada pole – 80% szansy na bezpieczne rozbrojenie miny i pozyskanie +30 złota!",
    powerCooldown: "Odnawia się ({sec}s)",
    powerReady: "Gotowa!",
    powerActiveHint: "Kliknij na pole na planszy, aby użyć mocy: ",

    // Casualties & Skuchy
    sapperCasualty: "💥 SKUCHA! Mina eksplodowała pod nogami sapera! Stracono 1 Sapera (Pozostało: {remaining}).",
    sapperSavedByArmor: "🛡️ PANCERZ ZADZIAŁAŁ! Saper przetrwał eksplozję bez żadnego uszczerbku na zdrowiu!",
    sapperDefused: "🧲 ROZBROJONO PUŁAPKĘ! Saperzy bezpiecznie zdemontowali minę! +{gold} zasobów.",
    sapperRecruited: "⛑️ Zrekrutowano nowego Sapera do Królewskiego Korpusu Inżynierów! (Koszt: {cost} 💰)",
    noSappersWarning: "⚠️ Uwaga: Brak wolnych saperów! Kolejne pomyłki mogą uszkodzić Zamek!",
    noSappersDefeat: "💀 Wszyscy saperzy polegli, a Zamek został odcięty przez potwory...",

    // Buildings
    buildingKeep: "Zamek (Keep)",
    buildingKeepDesc: "Serce królestwa. Generuje zasoby, robotników i szkoli saperów. Nie dopuść do jego upadku!",
    buildingHouse: "Chata",
    buildingHouseDesc: "Daje +2 robotników i regularny dochód podatkowy.",
    buildingBarracks: "Koszary",
    buildingBarracksDesc: "Szkoli żołnierzy broniących królestwa przed potworami, goblinami i smokami.",
    buildingWatchtower: "Wieża Strażnicza",
    buildingWatchtowerDesc: "Automatycznie strzela salwami strzał do wrogów i latających smoków w zasięgu.",
    buildingMarket: "Targ",
    buildingMarketDesc: "Zwiększa dochód ze wszystkich sąsiadujących chat o +50%.",
    buildingFarm: "Farma",
    buildingFarmDesc: "Dostarcza stały napływ pożywienia i zasobów co 3 sekundy.",
    buildingWall: "Mur Kamienny",
    buildingWallDesc: "Blokuje ruch potworów i osłania kluczowe budynki.",
    buildingWonder: "Cud Świata",
    buildingWonderDesc: "Monumentalny Obelisk / Kolos. Co 15 sekund automatycznie odkrywa 1 bezpieczne pole!",
    buildingSettler: "Wóz Osadników",
    buildingSettlerDesc: "Wysyła pionierów zakładających nową osadę i budujących drogi.",

    // Civilization 1 Native Tribal Village
    nativeVillageFound: "🏕️ Odkryto Wioskę Indian! Starszyzna plemienna wita Cię darem: {gift}!",
    giftSeals: "Mądrość Przodków (+2 Pieczęcie 👑)",
    giftGold: "Skarb Złota (+80 Zasobów 💰)",
    giftWarriors: "Dar Przymierza (Wojownicy Tubylczy 🏹)",
    giftMap: "Zwiad Plemion (Wskazano 4 ukryte miny 🗺️)",

    // Modes & Quests
    tabQuests: "Zadania",
    tabWilds: "Bezdroża",
    tabSiege: "Oblężenie",
    tabMultiplayer: "Własna Gra",

    questDragonHunt: "Polowanie na Smoka",
    questDragonHuntDesc: "Odszukaj legowiska smoków na planszy i zgładź bestie wieżami oraz armią.",
    questReclaimRealm: "Odzyskanie Królestwa",
    questReclaimRealmDesc: "Zbadaj i oczyść zamglone ziemie z potworów, odkrywając bezpieczne tereny.",
    questRoyalTreasury: "Królewski Skarbiec",
    questRoyalTreasuryDesc: "Odszukaj ukryte w ziemi skrzynie ze złotem i starożytnymi pieczęciami.",
    questRivalKingdoms: "Rywalizujące Królestwa",
    questRivalKingdomsDesc: "Broń granic przed falami wrogich najeźdźców i zniszcz ich portale.",

    levelLabel: "Poziom",
    levelGoalDragon: "Znajdź i zgładź smoków: {count}.",
    levelGoalReclaim: "Odkryj bezpieczne pola: {target}.",
    levelGoalTreasury: "Zbierz skrzynie skarbów: {target}.",
    levelGoalSiege: "Przetrwaj fale wrogów i zniszcz portale.",
    btnStartMission: "Rozpocznij Misję",
    btnReplayMission: "Zagraj Ponownie",

    // Research / Tech Tree
    researchTitle: "Drzewo Badań Królewskich",
    researchSubtitle: "Wydawaj Królewskie Pieczęcie na nowe Budynki, Ulepszenia i stałe Premie.",
    royalSeals: "Królewskie Pieczęcie",
    unlockCost: "Odblokuj: {cost} Pieczęci",
    alreadyUnlocked: "Odblokowane",
    locked: "Zablokowane (wymaga poprzednich)",
    setAsGoal: "Ustaw jako cel",
    returnToBoard: "Powrót do gry",

    // Research Nodes
    resKeepUpgrade: "Wzmocniony Zamek",
    resKeepUpgradeDesc: "+50% punktów życia zamku i +2 startowych robotników.",
    resScout: "Zwiadowcy",
    resScoutDesc: "Ostrzega przed smokami i pułapkami na sąsiednich polach.",
    resSapperAcademy: "Akademia Saperska",
    resSapperAcademyDesc: "+2 do maksymalnej liczby Saperów (z 3 do 5) i -25% tańszy zaciąg.",
    resFlakArmor: "Pancerze Przeciwodłamkowe",
    resFlakArmorDesc: "Daje 50% szansy, że eksplozja miny przy skusze nie zabije Sapera!",
    resMarket: "Gildia Kupiecka (Targ)",
    resMarketDesc: "Odblokowuje budynek Targu generujący dodatkowe zasoby.",
    resBarracks: "Koszary Wojenne",
    resBarracksDesc: "Odblokowuje Koszary i szkolenie rycerzy oraz łuczników.",
    resBallista: "Balisty Wieżowe",
    resBallistaDesc: "Wieże zadają podwójne obrażenia latającym smokom.",
    resFortifications: "Kamienne Mury",
    resFortificationsDesc: "Odblokowuje odporne na ogień kamienne umocnienia.",
    resAlchemy: "Królewska Alchemia",
    resAlchemyDesc: "Zwiększa zysk ze skrzyń i odkrytych pól o +25%.",
    resFocusRegen: "Królewska Koncentracja",
    resFocusRegenDesc: "Skraca czas odnawiania wszystkich mocy (Wyrocznia, Sokół, Katapulta) o 35%.",

    // Game Events & Notifications
    dragonAwakened: "⚠️ SMOK SIĘ PRZEBUDZIŁ! Atakuje królestwo!",
    dragonSlain: "🎉 Smok został pokonany! Królestwo ocalone!",
    portalSpawning: "Portal potworów otworzy się za {sec}s!",
    portalSpawned: "Goblini wybiegli z portalu! Do broni!",
    buildingDestroyed: "Budynek został zniszczony!",
    chestFound: "Odnaleziono skarb! +{gold} zasobów i +{seals} Pieczęć!",
    victoryTitle: "ZWYCIĘSTWO!",
    victoryDesc: "Cel misji został osiągnięty! Królestwo rośnie w siłę.",
    defeatTitle: "PORAŻKA!",
    defeatDesc: "Twój Zamek padł pod ciosami bestii...",
    btnContinue: "Kontynuuj",
    btnRetry: "Spróbuj ponownie",

    // Settings
    settingsTitle: "Ustawienia Gry",
    settingLanguage: "Język (Language):",
    settingSound: "Dźwięki (SFX):",
    settingMusic: "Retro Chiptune Ambience:",
    settingGridSize: "Rozmiar planszy:",
    settingZoom: "Skala widoku:",
    settingChordClick: "Podwójny klik odkrywa (Chording):",
    settingVersion: "Wersja gry:",
    btnClose: "Zamknij",

    // Controls Help
    helpTitle: "Jak grać w Keepsweeper?",
    helpText: `
      <b>Nowoczesny Saper + Królestwo:</b><br>
      • <b>Lewy klik:</b> Odkrywanie pól. Cyfry (1, 2, 3...) mówią, ile sąsiadujących pól kryje miny, pułapki lub potwory.<br>
      • <b>SKUCHY (Zamiast natychmiastowej śmierci!):</b> Kliknięcie w minę NIE kończy gry! Mina wybucha, raniąc lub zabijając jednego z twoich <b>Saperów</b>. Masz rezerwę saperów, a nowych możesz doszkolić w Zamku za 40 złota!<br>
      • <b>MOCE DO TRAFIANIA W CIEMNO:</b> Na pasku akcji masz moce: <b>Wyrocznia</b> (ujawnia pole w ciemno), <b>Sokoli Zwiad</b> (bada obszar), <b>Pancerz</b> (absorbuje następny wybuch) i <b>Katapulta</b> (bezpieczna detonacja z dystansu)!<br>
      • <b>Prawy klik:</b> Postawienie flagi ostrzegawczej.<br>
      • <b>Budowanie:</b> Kliknij 'Buduj' i postaw wieże, chaty lub koszary na odkrytym terenie.<br>
      • <b>Smoki i Wieże:</b> Wieże strzelają automatycznie do latających smoków.
    `
  },

  en: {
    // Top Bar & Menu
    gameTitle: "Keepsweeper",
    menuPlay: "Play",
    menuEditor: "Editor",
    menuResearch: "Research",
    menuAchievements: "Achievements",
    menuSettings: "Settings",
    menuHelp: "Help",

    // Status Bar
    resources: "Resources",
    workers: "Workers",
    sappers: "Sappers",
    soldiers: "Soldiers",
    uncovered: "Uncovered",
    slain: "slain",
    time: "Time",

    // Action Bar Buttons
    btnBuild: "Build",
    btnPowers: "Royal Powers",
    btnUpgrades: "Upgrades",
    btnTreasures: "Treasures",
    btnFlagMode: "Flag Mode",
    btnDigMode: "Dig Mode",
    btnRecruitSapper: "Recruit Sapper (+1)",

    // Royal Powers / Blind Guessing Tools
    powersTitle: "Royal Spells & Recon Powers",
    powerOracle: "Divine Oracle",
    powerOracleDesc: "Safely reveals any covered tile blind! If it's a hazard, marks it with a golden flag.",
    powerFalcon: "Falcon Recon",
    powerFalconDesc: "Royal falcon scouts a 3x3 sector, clearing safe tiles and highlighting threats.",
    powerShield: "Blast Shield",
    powerShieldDesc: "Grants protection on the next misclick! Your sapper will survive the detonation intact.",
    powerBombard: "Catapult Bombard",
    powerBombardDesc: "Bombards a suspicious tile from afar. Safely neutralizes mines with no casualties!",
    powerProbe: "Sapper Probe",
    powerProbeDesc: "Carefully probes a tile with an 80% chance to safely disarm the mine and yield +30 gold!",
    powerCooldown: "Recharging ({sec}s)",
    powerReady: "Ready!",
    powerActiveHint: "Click a tile on the board to cast: ",

    // Casualties & Skuchy
    sapperCasualty: "💥 MISHAP! A mine detonated under the sapper! Lost 1 Sapper ({remaining} remaining).",
    sapperSavedByArmor: "🛡️ BLAST SHIELD ACTIVATED! The sapper survived the blast unscathed!",
    sapperDefused: "🧲 HAZARD DEFUSED! Sappers successfully disarmed the mine! +{gold} resources recovered.",
    sapperRecruited: "⛑️ New Sapper inducted into the Royal Pioneer Corps! (Cost: {cost} 💰)",
    noSappersWarning: "⚠️ Warning: No sappers remaining! Further mistakes may damage the Keep!",
    noSappersDefeat: "💀 All sappers perished and your Keep was overwhelmed...",

    // Buildings
    buildingKeep: "Keep",
    buildingKeepDesc: "The heart of your kingdom. Yields initial workers & taxes. Don't let it fall!",
    buildingHouse: "House",
    buildingHouseDesc: "Increases worker capacity by +2 and generates minor tax revenue.",
    buildingBarracks: "Barracks",
    buildingBarracksDesc: "Trains soldiers & archers to protect your realm from monsters and dragons.",
    buildingWatchtower: "Watchtower",
    buildingWatchtowerDesc: "Automatically fires arrows at monsters and flying dragons within range.",
    buildingMarket: "Market",
    buildingMarketDesc: "Earns resources from neighboring Houses (+50% bonus).",
    buildingFarm: "Farm",
    buildingFarmDesc: "Produces steady food and building materials every 3 seconds.",
    buildingWall: "Stone Wall",
    buildingWallDesc: "Blocks monster movements and shields vital city sectors.",
    buildingWonder: "Wonder of the World",
    buildingWonderDesc: "Monumental Colossus / Obelisk. Automatically uncovers 1 safe tile every 15s!",
    buildingSettler: "Settler Wagon",
    buildingSettlerDesc: "Pioneers that build roads and found a new settlement outpost.",

    // Civilization 1 Native Tribal Village
    nativeVillageFound: "🏕️ Contacted a Friendly Native Tribe! The elders present a gift: {gift}!",
    giftSeals: "Ancient Wisdom (+2 Royal Seals 👑)",
    giftGold: "Tribe Gold (+80 Resources 💰)",
    giftWarriors: "Alliance Warriors (Native Archer Joins Army 🏹)",
    giftMap: "Tribal Scout (4 Nearby Mines Marked 🗺️)",

    // Modes & Quests
    tabQuests: "Quests",
    tabWilds: "Wilds",
    tabSiege: "Siege",
    tabMultiplayer: "Custom",

    questDragonHunt: "Dragon Hunt",
    questDragonHuntDesc: "Uncover treacherous lairs and slay dragons with archer towers and infantry.",
    questReclaimRealm: "Reclaim the Realm",
    questReclaimRealmDesc: "Explore and secure the shrouded wilderness, uncovering safe land tiles.",
    questRoyalTreasury: "Royal Treasury",
    questRoyalTreasuryDesc: "Locate hidden treasure chests filled with gold and Royal Seals.",
    questRivalKingdoms: "Rival Kingdoms",
    questRivalKingdomsDesc: "Defend your realm against invading monster hordes and crush their portals.",

    levelLabel: "Level",
    levelGoalDragon: "Find and slay {count} dragons.",
    levelGoalReclaim: "Uncover {target} safe tiles.",
    levelGoalTreasury: "Collect {target} hidden treasure chests.",
    levelGoalSiege: "Survive enemy waves and seal portals.",
    btnStartMission: "Start Mission",
    btnReplayMission: "Replay Level",

    // Research / Tech Tree
    researchTitle: "Royal Research",
    researchSubtitle: "Spend Royal Seals on Buildings, Upgrades and permanent Passives for future runs.",
    royalSeals: "Royal Seals",
    unlockCost: "Unlock: {cost} Royal Seals",
    alreadyUnlocked: "Unlocked",
    locked: "Locked (Requires prerequisites)",
    setAsGoal: "Set as goal",
    returnToBoard: "Return to board",

    // Research Nodes
    resKeepUpgrade: "Reinforced Keep",
    resKeepUpgradeDesc: "+50% Keep maximum HP and +2 starting workers.",
    resScout: "Scouting Outpost",
    resScoutDesc: "Warns about dragons and traps in adjacent sectors.",
    resSapperAcademy: "Sapper Academy",
    resSapperAcademyDesc: "+2 maximum sapper capacity (from 3 to 5) and 25% cheaper recruitment.",
    resFlakArmor: "Blast Armor",
    resFlakArmorDesc: "50% chance a sapper survives a mine mishap without dying!",
    resMarket: "Merchant Guild (Market)",
    resMarketDesc: "Unlocks Market building that boosts economy near residential areas.",
    resBarracks: "Infantry Barracks",
    resBarracksDesc: "Unlocks Barracks to train knights and marksmen.",
    resBallista: "Tower Ballistas",
    resBallistaDesc: "Watchtowers deal double damage against flying dragons.",
    resFortifications: "Stone Fortifications",
    resFortificationsDesc: "Unlocks flame-resistant stone barriers.",
    resAlchemy: "Royal Alchemy",
    resAlchemyDesc: "+25% extra gold found in chests and revealed deposits.",
    resFocusRegen: "Royal Focus",
    resFocusRegenDesc: "Reduces cooldown of all reconnaissance spells by 35%.",

    // Game Events & Notifications
    dragonAwakened: "⚠️ A DRAGON HAS AWAKENED! Defend the kingdom!",
    dragonSlain: "🎉 Dragon slain! The realm rejoices!",
    portalSpawning: "Monster portal will open in {sec}s!",
    portalSpawned: "Goblin raiders emerge from the portal! To arms!",
    buildingDestroyed: "A building has been destroyed!",
    chestFound: "Treasure unearthed! +{gold} resources and +{seals} Royal Seal!",
    victoryTitle: "VICTORY!",
    victoryDesc: "Objective accomplished! Your kingdom flourishes.",
    defeatTitle: "DEFEAT!",
    defeatDesc: "Your Keep has fallen to the mythical beasts...",
    btnContinue: "Continue",
    btnRetry: "Try Again",

    // Settings
    settingsTitle: "Game Settings",
    settingLanguage: "Language / Język:",
    settingSound: "Sound Effects (SFX):",
    settingMusic: "Retro Chiptune Ambience:",
    settingGridSize: "Board Dimensions:",
    settingZoom: "View Scale:",
    settingChordClick: "Chord clicking (double click reveals):",
    settingVersion: "Game Version:",
    btnClose: "Close",

    // Controls Help
    helpTitle: "How to Play Keepsweeper",
    helpText: `
      <b>Modern Minesweeper + Kingdom Defense:</b><br>
      • <b>Left Click:</b> Dig/Uncover tiles. Numbers show neighboring danger tiles.<br>
      • <b>MISHAPS & CASUALTIES (No Instant Game Over!):</b> Clicking a mine does NOT blow up the whole board! Instead, a mishap occurs, costing 1 <b>Sapper</b>. You have multiple sappers and can recruit more at the Keep for 40 gold!<br>
      • <b>BLIND GUESSING POWERS:</b> Use the Powers bar for <b>Oracle</b> (safe blind probe), <b>Falcon</b> (area reveal), <b>Shield</b> (survive blast) and <b>Catapult</b> (ranged detonation)!<br>
      • <b>Right Click:</b> Plant warning flags on suspicious hazard tiles.<br>
      • <b>Building:</b> Build houses, towers, and barracks on safe uncovered ground.
    `
  }
};

let currentLang = 'pl'; // Default to Polish as requested

function getLang() {
  return currentLang;
}

function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('keepsweeper_lang', lang);
    applyTranslations();
  }
}

function t(key, params = {}) {
  const dict = translations[currentLang] || translations['en'];
  let text = dict[key] || translations['en'][key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return text;
}

// Automatically apply translations to DOM elements with data-i18n attributes
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });
  if (window.onLanguageChanged) {
    window.onLanguageChanged(currentLang);
  }
}

// Load saved language if available
const savedLang = localStorage.getItem('keepsweeper_lang');
if (savedLang && translations[savedLang]) {
  currentLang = savedLang;
}
