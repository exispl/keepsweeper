// Keepsweeper - Dual Engine Game System
// Engine 1: Sid Meier's Colonization & Civilization Continental Realm
// Engine 2: Pure Classic Windows 95 Minesweeper (Saper)

// --- Ray-Casting Point-in-Polygon Algorithm ---
function isPointInPolygon(px, py, vertices) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0], yi = vertices[i][1];
    const xj = vertices[j][0], yj = vertices[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
                      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// --- Continental Silhouette Geometry Database ---
const CONTINENT_DATABASE = {
  polska: {
    name: 'Polska',
    icon: '🇵🇱',
    polygon: [
      [0.10, 0.22], // Świnoujście / Uznam
      [0.25, 0.14], // Wybrzeże Zachodnie (Kołobrzeg)
      [0.44, 0.08], // Wybrzeże Środkowe (Ustka / Łeba)
      [0.54, 0.06], // Półwysep Helski nasada (Władysławowo)
      [0.60, 0.10], // Cypel Helu
      [0.56, 0.15], // Zatoka Gdańska
      [0.64, 0.13], // Mierzeja Wiślana
      [0.72, 0.14], // Warmia & Braniewo
      [0.86, 0.14], // Suwalszczyzna (Trójstyk)
      [0.93, 0.24], // Sejny / Augustów
      [0.94, 0.38], // Podlasie / Białystok
      [0.89, 0.52], // Bug / Brześć
      [0.90, 0.68], // Zamojszczyzna
      [0.86, 0.86], // Bieszczady Wschodnie
      [0.80, 0.92], // Bieszczady (Opołonek)
      [0.68, 0.89], // Beskid Niski
      [0.56, 0.96], // Tatry (Rysy / Zakopane)
      [0.45, 0.88], // Beskid Śląski
      [0.38, 0.82], // Brama Morawska / Racibórz
      [0.26, 0.88], // Kotlina Kłodzka (charakterystyczne wcięcie)
      [0.22, 0.78], // Sudety Środkowe
      [0.16, 0.74], // Karkonosze
      [0.12, 0.64], // Zgorzelec / Nysa Łużycka
      [0.10, 0.50], // Gubin / Krosno Odrzańskie
      [0.06, 0.38], // Cedynia / Zakole Odry
      [0.08, 0.28]  // Zalew Szczeciński
    ]
  },
  afryka: {
    name: 'Afryka',
    icon: '🌍',
    polygon: [
      [0.28, 0.14], [0.55, 0.15], [0.75, 0.20], [0.82, 0.28],
      [0.92, 0.44], [0.82, 0.60], [0.70, 0.76], [0.58, 0.94],
      [0.44, 0.80], [0.40, 0.62], [0.32, 0.52], [0.12, 0.46],
      [0.08, 0.34], [0.15, 0.22]
    ]
  },
  europa: {
    name: 'Europa',
    icon: '🌍',
    polygon: [
      [0.40, 0.08], [0.60, 0.12], [0.88, 0.25], [0.85, 0.60],
      [0.70, 0.75], [0.56, 0.82], [0.48, 0.68], [0.22, 0.86],
      [0.20, 0.54], [0.30, 0.44], [0.38, 0.26]
    ]
  },
  ameryka_pld: {
    name: 'Ameryka Południowa',
    icon: '🌎',
    polygon: [
      [0.28, 0.12], [0.48, 0.10], [0.70, 0.18], [0.92, 0.38],
      [0.80, 0.60], [0.65, 0.74], [0.50, 0.86], [0.42, 0.96],
      [0.34, 0.78], [0.30, 0.58], [0.20, 0.38], [0.18, 0.22]
    ]
  },
  ameryka_pln: {
    name: 'Ameryka Północna',
    icon: '🌎',
    polygon: [
      [0.12, 0.16], [0.40, 0.10], [0.70, 0.14], [0.90, 0.28],
      [0.82, 0.52], [0.86, 0.68], [0.66, 0.74], [0.56, 0.92],
      [0.38, 0.82], [0.22, 0.62], [0.18, 0.40], [0.14, 0.28]
    ]
  },
  australia: {
    name: 'Australia',
    icon: '🌏',
    polygon: [
      [0.25, 0.18], [0.48, 0.14], [0.58, 0.24], [0.78, 0.18],
      [0.90, 0.45], [0.88, 0.72], [0.76, 0.86], [0.58, 0.80],
      [0.36, 0.82], [0.14, 0.64], [0.10, 0.40], [0.16, 0.26]
    ]
  }
};

class KeepsweeperGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.viewport = document.getElementById('viewport');
    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    // Active Engine: 'colonization' (Continental Civ/RPG) or 'classic' (Win95 Saper)
    this.engineMode = localStorage.getItem('ks_engine') || 'colonization';

    // Camera & Pan
    this.zoom = 1.0;
    this.camX = 0;
    this.camY = 0;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.flagMode = false;
    this.showGrid = true;

    // Progression & Meta
    this.royalSeals = parseInt(localStorage.getItem('ks_seals') || '25', 10);
    this.techsUnlocked = JSON.parse(localStorage.getItem('ks_techs') || '["scout"]');
    this.progress = JSON.parse(localStorage.getItem('ks_prog') || JSON.stringify({
      dragon: 1, reclaim: 1, treasury: 1, siege: 1
    }));
    this.matchHistory = JSON.parse(localStorage.getItem('ks_match_history') || '[]');
    this.activeCommander = localStorage.getItem('ks_commander') || 'Arthur';
    this.commanderName = localStorage.getItem('ks_commander_name') || 'Król Artur';
    this.commanderAvatar = localStorage.getItem('ks_commander_avatar') || '🧙‍♂️';
    this.unlockedHeroSlots = parseInt(localStorage.getItem('ks_hero_slots') || '1', 10);

    // Session State & Continental Map System
    this.mode = 'dragon';
    this.level = 1;
    this.difficulty = localStorage.getItem('ks_difficulty') || 'intermediate'; // 'beginner', 'intermediate', 'expert'
    this.selectedContinent = localStorage.getItem('ks_continent') || 'polska';
    this.continentRotationList = ['polska', 'afryka', 'europa', 'ameryka_pld', 'ameryka_pln', 'australia'];
    this.continentRotationIndex = 0;
    this.activeContinentKey = 'polska';
    this.activeContinentName = 'Polska';
    this.activeContinentIcon = '🇵🇱';

    // Living Ocean & Colony Evolution System
    this.oceanShips = [];
    this.dolphins = [];
    this.waterSplashes = [];
    this.placedBuildings = [];
    this.settlementAdditions = [];
    this.lastSettlementMilestonePct = 0;
    this.totalMines = 0;
    this.nativeScoutTimer = 45;
    this.nativeTribes = [
      { id: 'iroquois', name: 'Irokezi', title: 'Wielka Liga Irokezów', icon: '🏹' },
      { id: 'sioux', name: 'Siuksowie', title: 'Lud Wielkich Równin', icon: '🪶' },
      { id: 'comanche', name: 'Komancze', title: 'Jeźdźcy Prerii', icon: '🐎' },
      { id: 'maya', name: 'Majowie', title: 'Mędrcy Świątyń', icon: '☀️' },
      { id: 'algonquin', name: 'Algonkini', title: 'Strażnicy Puszczy', icon: '🌲' },
      { id: 'apache', name: 'Apacze', title: 'Nieuchwytni Zwiadowcy', icon: '🦅' }
    ];

    // Visual Customizations (Number Fonts & Tile Frames)
    this.numberFont = localStorage.getItem('ks_number_font') || 'montserrat';
    this.tileFrame = localStorage.getItem('ks_tile_frame') || 'bevel';

    this.seenDiscoveries = JSON.parse(localStorage.getItem('ks_discoveries') || '{}');
    this.gridWidth = 32; // Enlarged continental grid dimensions
    this.gridHeight = 22;
    this.tileSize = 48; // Enlarged from 40 to 48 for larger tiles and more graphic detail

    // Economy & Tracking
    this.year = 1521;
    this.resources = 240;
    this.workersTotal = 3;
    this.workersIdle = 3;
    this.soldiersTotal = 0;
    this.soldiersMax = 5;

    // Sapper Corps & Casualties ("Skuchy")
    this.sappersMax = 3;
    this.sappers = 3;
    this.blundersCount = 0; // Skuchy
    this.hasBlastShield = false;

    // Timer & Objectives
    this.elapsedSeconds = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.dragonsTarget = 1;
    this.dragonsSlain = 0;
    this.uncoveredTarget = 120;
    this.chestsTarget = 3;
    this.chestsCollected = 0;
    this.uncoveredCount = 0;

    // Superhero Commander Perks (12 Perks)
    this.heroPerks = [
      { id: 'sixth_sense', name: 'Siódmy Zmysł', desc: '1% szansy co sekundę na samoodsłonięcie losowego bezpiecznego pola.', icon: '🔮' },
      { id: 'lucky_dud', name: 'Szczęście Sapera', desc: '3% szansy, że trafiona mina okaże się niewybuchem i nie eksploduje!', icon: '🍀' },
      { id: 'midas_touch', name: 'Dotyk Midasa', desc: '+50% więcej zasobów za każde odkryte pole i znalezione złoto.', icon: '👑' },
      { id: 'hermes_boots', name: 'Skrzydlate Buty', desc: 'Saperzy poruszają się o +80% szybciej po mapie.', icon: '🥾' },
      { id: 'prospector', name: 'Królewski Złotnik', desc: 'Podwaja liczbę skrzyń i skarbów generowanych na mapie.', icon: '💎' },
      { id: 'iron_skin', name: 'Żelazna Skóra', desc: 'Każda misja startuje z darmowym ładunkiem Pancerza Ochronnego.', icon: '🛡️' },
      { id: 'eagle_eye', name: 'Sokole Oko', desc: 'Zasięg widzenia i radaru +1 pole wokół każdej odkrytej cyfry.', icon: '🦅' },
      { id: 'master_flagger', name: 'Mistrz Flag', desc: '1x PPM natychmiast stawia flagę; flagi rozbrajają pułapki.', icon: '🚩' },
      { id: 'monk_blessing', name: 'Błogosławieństwo Mnicha', desc: 'Saperzy odradzają się za darmo co 60 sekund.', icon: '⛪' },
      { id: 'warlord_aura', name: 'Aura Wojownika', desc: 'Wojsko zadaje podwójne obrażenia smokom i potworom.', icon: '⚔️' },
      { id: 'earth_alchemy', name: 'Alchemia Ziemi', desc: 'Zamiast krateru po wybuchu powstaje żyła czystego złota (+80💰).', icon: '⚗️' },
      { id: 'unyielding', name: 'Niezłomny Duch', desc: 'Pierwsza skucha w meczu nie powoduje straty sapera ani życia zamku.', icon: '🌟' }
    ];
    this.activeHeroPerk = localStorage.getItem('ks_hero_perk') || 'sixth_sense';

    // AI Rivals Simulation (Colonization Opposing Factions)
    this.aiRivals = {
      spain: { name: 'Konkwistadorzy (Hiszpania)', color: '#d32f2f', x: 2, y: 2, tiles: 0, gold: 80, blunders: 0, sappers: 2 },
      france: { name: 'Nowa Francja (Francuzi)', color: '#1976d2', x: 25, y: 2, tiles: 0, gold: 70, blunders: 0, sappers: 2 }
    };
    this.aiTurnCounter = 0;

    // Royal Powers
    this.activePower = null;
    this.powerCooldowns = { oracle: 0, falcon: 0, shield: 0, bombard: 0, probe: 0 };
    this.powerBaseCooldowns = { oracle: 25, falcon: 30, shield: 35, bombard: 20, probe: 15 };

    // Board & Entities
    this.grid = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.dragons = [];
    this.goblins = [];
    this.workers = [];
    this.sappersList = [];
    this.soldiers = [];
    this.settlers = [];
    this.natives = [];
    this.portals = [];
    this.falcons = [];
    this.catapultStones = [];

    // Digging Orders Queue
    this.digQueue = [];

    // Hover Tile Info
    this.hoverTile = null;

    // Building definitions
    this.selectedBuildingType = null;
    this.buildingCosts = {
      house: 40, barracks: 80, watchtower: 60, market: 100, farm: 50, wall: 15, wonder: 150, settler: 70
    };

    // Tech definitions
    this.techDefinitions = [
      { id: 'keep_upgrade', nameKey: 'resKeepUpgrade', descKey: 'resKeepUpgradeDesc', cost: 2, icon: '🏰', req: null },
      { id: 'scout', nameKey: 'resScout', descKey: 'resScoutDesc', cost: 2, icon: '🧭', req: null },
      { id: 'resSapperAcademy', nameKey: 'resSapperAcademy', descKey: 'resSapperAcademyDesc', cost: 3, icon: '⛑️', req: 'keep_upgrade' },
      { id: 'resFlakArmor', nameKey: 'resFlakArmor', descKey: 'resFlakArmorDesc', cost: 3, icon: '🛡️', req: 'resSapperAcademy' },
      { id: 'resFocusRegen', nameKey: 'resFocusRegen', descKey: 'resFocusRegenDesc', cost: 3, icon: '✨', req: 'scout' },
      { id: 'market', nameKey: 'resMarket', descKey: 'resMarketDesc', cost: 2, icon: '🏪', req: 'scout' },
      { id: 'barracks', nameKey: 'resBarracks', descKey: 'resBarracksDesc', cost: 3, icon: '⚔️', req: 'keep_upgrade' },
      { id: 'ballista', nameKey: 'resBallista', descKey: 'resBallistaDesc', cost: 3, icon: '🏹', req: 'barracks' },
      { id: 'fortifications', nameKey: 'resFortifications', descKey: 'resFortificationsDesc', cost: 2, icon: '🧱', req: 'keep_upgrade' },
      { id: 'alchemy', nameKey: 'resAlchemy', descKey: 'resAlchemyDesc', cost: 4, icon: '⚗️', req: 'market' }
    ];

    this.init();
  }

  init() {
    Sprites.init();
    const appWin = document.getElementById('appWindow');
    if (appWin) appWin.classList.add('fullscreen');

    this.resizeCanvas();
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.centerCamera();
    });

    this.bindEvents();
    this.setupUI();
    this.updateCommanderDisplay();
    this.fetchVersionInfo();
    this.startLevel(this.mode, this.level);

    // Apply visual settings from storage
    this.applySavedSettings();

    // Loop
    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));

    // Simulation tick every second
    setInterval(() => this.simulationTick(), 1000);
  }

  resizeCanvas() {
    if (!this.viewport) return;
    const w = this.viewport.clientWidth || 800;
    const h = this.viewport.clientHeight || 600;
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  // --- Procedural Realistic Continental Landmass Generation ---
  generateContinentalMap() {
    this.grid = [];

    // Select Continent: Random rotation or specific choice
    if (this.selectedContinent === 'random') {
      this.activeContinentKey = this.continentRotationList[this.continentRotationIndex % this.continentRotationList.length];
      this.continentRotationIndex++;
    } else {
      this.activeContinentKey = this.selectedContinent || 'polska';
    }

    const continentDef = CONTINENT_DATABASE[this.activeContinentKey] || CONTINENT_DATABASE.polska;
    this.activeContinentName = continentDef.name;
    this.activeContinentIcon = continentDef.icon;

    // Update UI indicator
    const contSelect = document.getElementById('quickContinentSelect');
    if (contSelect && this.selectedContinent !== 'random') contSelect.value = this.activeContinentKey;
    this.notify(`🗺️ Odkrywasz ląd: ${this.activeContinentName} ${this.activeContinentIcon}!`, '🗺️');

    const marginX = 1;
    const marginY = 1;

    // 1. Generate Landmass & Organic Terrain
    for (let y = 0; y < this.gridHeight; y++) {
      const row = [];
      for (let x = 0; x < this.gridWidth; x++) {
        const nx = (x - marginX) / (this.gridWidth - 1 - 2 * marginX);
        const ny = (y - marginY) / (this.gridHeight - 1 - 2 * marginY);

        // Coastline organic harmonics
        const harmonic = Math.sin(nx * 14 + ny * 10) * 0.025 + Math.cos(nx * 8 - ny * 12) * 0.02;
        const testX = nx + harmonic;
        const testY = ny + harmonic;

        const isLand = isPointInPolygon(testX, testY, continentDef.polygon);
        let terrain = 'water';

        if (isLand) {
          if (this.activeContinentKey === 'polska') {
            // Authentic Polish Geography & Biomes:
            // Bałtyk na samej północy
            if (ny < 0.14 && nx < 0.65) {
              terrain = 'sea';
            }
            // Kraina Wielkich Jezior Mazurskich (Mazury)
            else if (nx > 0.58 && nx < 0.85 && ny > 0.15 && ny < 0.32 && (Math.sin(x * 1.7) * Math.cos(y * 1.7) > 0.42)) {
              terrain = 'lake';
            }
            // Karpaty, Tatry i Sudety (Góry i gęste lasy) na południu
            else if (ny > 0.78) {
              terrain = 'trees';
            }
            // Puszcze i bory (Białowieska, Tucholskie, Kampinos)
            else if (Math.sin(x * 0.95 + y * 0.75) > 0.40) {
              terrain = 'trees';
            } else {
              terrain = 'grass'; // Żyzne niziny i polany
            }
          } else {
            // Generic continental biomes with organic lakes and forests
            const lakeNoise = Math.sin(x * 1.5) * Math.cos(y * 1.5);
            const treeNoise = Math.cos(x * 0.85 + y * 0.65);
            if (lakeNoise > 0.65) terrain = 'lake';
            else if (treeNoise > 0.32) terrain = 'trees';
            else terrain = 'grass';
          }
        } else {
          // Surrounding sea & deep ocean
          const isNearCoast = isPointInPolygon(testX * 0.92 + 0.04, testY * 0.92 + 0.04, continentDef.polygon);
          terrain = isNearCoast ? 'sea' : 'water';
        }

        const isOcean = (terrain === 'water' || terrain === 'sea');

        row.push({
          x, y,
          covered: !isOcean,
          flagged: false,
          oracleFlag: false,
          crater: false,
          road: false,
          terrain,
          danger: false,
          dangerType: null,
          adjacentDangers: 0,
          building: null,
          burnt: false
        });
      }
      this.grid.push(row);
    }

    // 2. Coastal Landing Beachhead:
    // For Poland: Land at the Baltic seaside on the north shore!
    // For other continents: find suitable coastal landing spot
    let kx = Math.floor(this.gridWidth / 2);
    let ky = Math.floor(this.gridHeight / 2);

    if (this.activeContinentKey === 'polska') {
      // Find northern Baltic coastal land tile
      for (let y = 3; y < this.gridHeight - 3; y++) {
        for (let x = 6; x < this.gridWidth - 6; x++) {
          const t = this.grid[y][x];
          if (t.terrain === 'grass' || t.terrain === 'trees') {
            // Check if borders sea/water to the north or west
            let bordersWater = false;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const ny = y + dy;
                const nx = x + dx;
                if (this.isValidTile(nx, ny) && (this.grid[ny][nx].terrain === 'water' || this.grid[ny][nx].terrain === 'sea')) {
                  bordersWater = true;
                }
              }
            }
            if (bordersWater) {
              kx = x;
              ky = y;
              break;
            }
          }
        }
        if (ky !== Math.floor(this.gridHeight / 2)) break;
      }
    } else {
      // Find southern/eastern shore
      for (let y = this.gridHeight - 4; y >= 4; y--) {
        for (let x = 6; x < this.gridWidth - 6; x++) {
          const t = this.grid[y][x];
          if (t.terrain === 'grass' || t.terrain === 'trees') {
            let hasCoast = false;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const ny = y + dy;
                const nx = x + dx;
                if (this.isValidTile(nx, ny) && (this.grid[ny][nx].terrain === 'water' || this.grid[ny][nx].terrain === 'sea')) {
                  hasCoast = true;
                }
              }
            }
            if (hasCoast) {
              kx = x;
              ky = y;
              break;
            }
          }
        }
        if (kx !== Math.floor(this.gridWidth / 2)) break;
      }
    }

    this.playerStart = { x: kx, y: ky };
    const keepTile = this.grid[ky][kx];
    keepTile.terrain = 'grass';
    keepTile.covered = false;
    keepTile.road = true;
    keepTile.building = {
      type: 'keep',
      hp: 1200,
      maxHp: 1200,
      level: 1
    };

    // Safe 3x3 beachhead around landing camp
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = kx + dx;
        const ny = ky + dy;
        if (this.isValidTile(nx, ny)) {
          this.grid[ny][nx].covered = false;
          if (this.grid[ny][nx].terrain === 'trees') this.grid[ny][nx].terrain = 'grass';
        }
      }
    }

    // 3. Place Entities SPACIALLY SEPARATED - No unit stacking!
    const charOff = (this.tileSize - 24) / 2;
    this.workers = [
      { x: (kx - 1) * this.tileSize + charOff, y: ky * this.tileSize + charOff, targetX: (kx - 1) * this.tileSize, targetY: ky * this.tileSize, facing: 1, walkAnim: 0 },
      { x: (kx + 1) * this.tileSize + charOff, y: ky * this.tileSize + charOff, targetX: (kx + 1) * this.tileSize, targetY: ky * this.tileSize, facing: -1, walkAnim: 0 },
      { x: kx * this.tileSize + charOff, y: (ky - 1) * this.tileSize + charOff, targetX: kx * this.tileSize, targetY: (ky - 1) * this.tileSize, facing: 1, walkAnim: 0 }
    ];

    const sapperOffsets = [
      { dx: 0, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 }
    ];
    const sapperNames = ['Saper Jan', 'Saper Wilhelm', 'Saper Tomasz', 'Saper Stanisław', 'Saper Tadeusz'];

    this.sappersList = [];
    for (let i = 0; i < this.sappers; i++) {
      const off = sapperOffsets[i % sapperOffsets.length];
      const sx = Math.max(0, Math.min(this.gridWidth - 1, kx + off.dx));
      const sy = Math.max(0, Math.min(this.gridHeight - 1, ky + off.dy));
      this.sappersList.push({
        id: i + 1,
        name: sapperNames[i] || `Saper #${i + 1}`,
        x: sx * this.tileSize + charOff,
        y: sy * this.tileSize + charOff,
        targetX: sx * this.tileSize,
        targetY: sy * this.tileSize,
        state: 'idle',
        digTile: null,
        facing: off.dx < 0 ? -1 : 1,
        walkAnim: 0
      });
    }

    // 4. Volcanic Dragon Caves in deep regions
    const caveCount = Math.max(1, Math.min(3, Math.floor(this.level / 2)));
    for (let c = 0; c < caveCount; c++) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const rx = Math.floor(Math.random() * this.gridWidth);
        const ry = Math.floor(Math.random() * this.gridHeight);
        const dist = Math.hypot(rx - kx, ry - ky);
        const t = this.grid[ry][rx];
        if (dist > 7 && (t.terrain === 'grass' || t.terrain === 'trees') && t.covered) {
          t.danger = true;
          t.dangerType = 'dragon_nest';
          placed = true;
        }
      }
    }

    // 5. Native Tribal Wigwams (Civ 1 style villages)
    const wigwamCount = Math.max(3, Math.floor(this.level / 2) + 2);
    for (let w = 0; w < wigwamCount; w++) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const rx = Math.floor(Math.random() * this.gridWidth);
        const ry = Math.floor(Math.random() * this.gridHeight);
        const dist = Math.hypot(rx - kx, ry - ky);
        const t = this.grid[ry][rx];
        if (dist > 3 && t.terrain === 'grass' && t.covered && !t.danger && !t.dangerType) {
          t.dangerType = 'wigwam';
          placed = true;
        }
      }
    }

    // 6. User Request: SIGNIFICANTLY INCREASED TREASURE CHEST SPAWN CHANCE!
    const totalLandTiles = this.grid.flat().filter(t => t.terrain !== 'water' && t.terrain !== 'sea').length;
    const chestCount = Math.max(10, Math.floor(totalLandTiles * 0.055)) * (this.activeHeroPerk === 'prospector' ? 2 : 1);
    for (let ch = 0; ch < chestCount; ch++) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const rx = Math.floor(Math.random() * this.gridWidth);
        const ry = Math.floor(Math.random() * this.gridHeight);
        const t = this.grid[ry][rx];
        if ((t.terrain === 'grass' || t.terrain === 'trees') && t.covered && !t.danger && !t.dangerType) {
          t.dangerType = 'chest';
          placed = true;
        }
      }
    }

    // 7. Goblin Portals
    const portalCount = Math.min(3, 1 + Math.floor(this.level / 3));
    for (let p = 0; p < portalCount; p++) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const rx = Math.floor(Math.random() * this.gridWidth);
        const ry = Math.floor(Math.random() * this.gridHeight);
        const dist = Math.hypot(rx - kx, ry - ky);
        const t = this.grid[ry][rx];
        if (dist > 5 && (t.terrain === 'grass' || t.terrain === 'trees') && t.covered && !t.danger && !t.dangerType) {
          t.danger = true;
          t.dangerType = 'goblin_portal';
          placed = true;
        }
      }
    }

    // 8. Mines & Traps Quota
    const baseDensity = this.difficulty === 'beginner' ? 0.10 : (this.difficulty === 'expert' ? 0.21 : 0.15);
    const dangerDensity = baseDensity + (this.level * 0.003);
    let mineQuota = Math.floor(totalLandTiles * dangerDensity);

    while (mineQuota > 0) {
      const rx = Math.floor(Math.random() * this.gridWidth);
      const ry = Math.floor(Math.random() * this.gridHeight);
      const dist = Math.hypot(rx - kx, ry - ky);
      const t = this.grid[ry][rx];
      if (dist > 2.2 && t.covered && (t.terrain === 'grass' || t.terrain === 'trees') && !t.danger && !t.dangerType) {
        t.danger = true;
        t.dangerType = 'mine';
        mineQuota--;
      }
    }

    // 9. AI Rivals on opposing continental shores
    this.aiRivals.spain.x = Math.max(2, kx - 12);
    this.aiRivals.spain.y = Math.max(2, ky - 8);
    this.aiRivals.france.x = Math.min(this.gridWidth - 3, kx + 10);
    this.aiRivals.france.y = Math.max(2, ky - 6);

    this.recalculateAdjacentNumbers();

    // Total mines quota count for UI
    this.totalMines = this.grid.flat().filter(t => t.danger).length;

    // Open starting clearing around landing camp until boundary numbers are revealed
    const openQueue = [{ x: kx, y: ky }];
    const visitedOpening = new Set([`${kx},${ky}`]);
    while (openQueue.length > 0) {
      const cur = openQueue.shift();
      const curTile = this.grid[cur.y][cur.x];
      curTile.covered = false;
      if (curTile.adjacentDangers === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = cur.x + dx;
            const ny = cur.y + dy;
            const key = `${nx},${ny}`;
            if (this.isValidTile(nx, ny) && !visitedOpening.has(key)) {
              visitedOpening.add(key);
              const nTile = this.grid[ny][nx];
              if (!nTile.danger && nTile.terrain !== 'water' && nTile.terrain !== 'sea') {
                nTile.covered = false;
                if (nTile.adjacentDangers === 0) {
                  openQueue.push({ x: nx, y: ny });
                }
              }
            }
          }
        }
      }
    }

    // Initialize Living Ocean (Sailing Caravels)
    this.oceanShips = [];
    const waterTiles = this.grid.flat().filter(t => t.terrain === 'water' || t.terrain === 'sea');
    if (waterTiles.length > 5) {
      for (let s = 0; s < 3; s++) {
        const startT = waterTiles[Math.floor(Math.random() * waterTiles.length)];
        const targetT = waterTiles[Math.floor(Math.random() * waterTiles.length)];
        this.oceanShips.push({
          x: startT.x * this.tileSize + 8,
          y: startT.y * this.tileSize + 8,
          targetX: targetT.x * this.tileSize + 8,
          targetY: targetT.y * this.tileSize + 8,
          speed: 16 + Math.random() * 12,
          angle: 0,
          bobbing: Math.random() * Math.PI * 2
        });
      }
    }
    this.dolphins = [];
    this.waterSplashes = [];
    this.placedBuildings = [];
    this.settlementAdditions = [];
    this.lastSettlementMilestonePct = 0;
  }

  recalculateAdjacentNumbers() {
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (this.isValidTile(nx, ny) && this.grid[ny][nx].danger) {
              count++;
            }
          }
        }
        this.grid[y][x].adjacentDangers = count;
      }
    }
  }

  isValidTile(x, y) {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }

  centerCamera() {
    this.resizeCanvas();
    const kx = (this.playerStart ? this.playerStart.x : Math.floor(this.gridWidth / 2)) * this.tileSize;
    const ky = (this.playerStart ? this.playerStart.y : Math.floor(this.gridHeight / 2)) * this.tileSize;
    this.camX = (this.canvas.width / 2) - kx * this.zoom;
    this.camY = (this.canvas.height / 2) - ky * this.zoom;
  }

  // --- Start Level & Reset ---
  startLevel(mode, level) {
    this.mode = mode;
    this.level = level;

    // Difficulty Settings: Adjust grid size & sappers corps
    if (this.difficulty === 'beginner') {
      this.gridWidth = 22;
      this.gridHeight = 16;
      this.sappersMax = this.techsUnlocked.includes('resSapperAcademy') ? 6 : 5;
    } else if (this.difficulty === 'expert') {
      this.gridWidth = 34;
      this.gridHeight = 22;
      this.sappersMax = this.techsUnlocked.includes('resSapperAcademy') ? 3 : 2;
    } else {
      // Intermediate (Standard)
      this.gridWidth = 28;
      this.gridHeight = 20;
      this.sappersMax = this.techsUnlocked.includes('resSapperAcademy') ? 5 : 3;
    }
    this.sappers = this.sappersMax;

    this.elapsedSeconds = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.blundersCount = 0;
    this.uncoveredCount = 0;
    this.movesCount = 0;
    this.score = 0.0;
    this.lastHeroMilestone = 0;
    this.heroLevel = 1;
    this.unlockedHeroPerks = [this.activeHeroPerk];
    this.hasBlastShield = (this.activeHeroPerk === 'iron_skin');
    this.activePower = null;
    this.digQueue = [];
    this.resources = 240 + (this.techsUnlocked.includes('keep_upgrade') ? 60 : 0);

    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.dragons = [];
    this.goblins = [];
    this.settlers = [];
    this.natives = [];
    this.portals = [];
    this.falcons = [];
    this.catapultStones = [];

    this.generateContinentalMap();

    // Compute realistic target for continent exploration
    const safeLand = this.grid.flat().filter(t => (t.terrain === 'grass' || t.terrain === 'trees') && !t.danger).length;
    this.safeLandTilesTotal = safeLand;
    this.uncoveredTarget = Math.max(35, Math.floor(safeLand * 0.82));

    this.centerCamera();
    this.updateUI();
    this.updateSettlementBadge();
    this.renderMinimap();

    this.notify(`Nowy Świat: ${t(this.getModeNameKey())} (Poziom ${level})`, '🗺️');
  }

  // --- Input & Controls: Middle Mouse Pan, 1x PPM Flag, Physical Digging ---
  bindEvents() {
    // Canvas Mousedown: Left, Middle (MMB drag), Right (PPM)
    this.canvas.addEventListener('mousedown', (e) => {
      // Middle Mouse Button (MMB) or Shift+Click = Pan Camera
      if (e.button === 1 || e.shiftKey) {
        e.preventDefault();
        this.isPanning = true;
        this.panStartX = e.clientX - this.camX;
        this.panStartY = e.clientY - this.camY;
        return;
      }

      // 1x PPM Reliable Right-Click (Instant flag toggle on mousedown, prevents double-cancel)
      if (e.button === 2) {
        e.preventDefault();
        this.handlePointerDown(e.clientX, e.clientY, 2);
        return;
      }

      this.handlePointerDown(e.clientX, e.clientY, e.button);
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (this.isPanning) {
        this.camX = e.clientX - this.panStartX;
        this.camY = e.clientY - this.panStartY;
        return;
      }

      const wx = (mx - this.camX) / this.zoom;
      const wy = (my - this.camY) / this.zoom;
      const tx = Math.floor(wx / this.tileSize);
      const ty = Math.floor(wy / this.tileSize);

      if (this.isValidTile(tx, ty)) {
        this.hoverTile = { x: tx, y: ty };
        this.updateHoverTileInspector(tx, ty);
      } else {
        this.hoverTile = null;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 1 || this.isPanning) {
        this.isPanning = false;
      }
    });

    // 1x PPM: Prevent native browser context menu globally across the whole game window
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    }, { capture: true });
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    }, { capture: true });
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Zoom on wheel (game canvas)
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      this.setZoom(this.zoom * zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Interactive Minimap Pan & Drag & Zoom on Scroll Wheel
    if (this.minimapCanvas) {
      const panFromMinimap = (e) => {
        const rect = this.minimapCanvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const relX = mx / this.minimapCanvas.width;
        const relY = my / this.minimapCanvas.height;

        const targetWorldX = relX * (this.gridWidth * this.tileSize);
        const targetWorldY = relY * (this.gridHeight * this.tileSize);

        this.camX = (this.canvas.width / 2) - targetWorldX * this.zoom;
        this.camY = (this.canvas.height / 2) - targetWorldY * this.zoom;
        this.renderMinimap();
      };

      let minimapMouseDown = false;
      this.minimapCanvas.addEventListener('mousedown', (e) => {
        minimapMouseDown = true;
        panFromMinimap(e);
      });
      window.addEventListener('mousemove', (e) => {
        if (minimapMouseDown) panFromMinimap(e);
      });
      window.addEventListener('mouseup', () => {
        minimapMouseDown = false;
      });

      // User request: Minimap zoom in/out with mouse scroll wheel!
      this.minimapCanvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
        this.setZoom(this.zoom * zoomFactor);
        this.renderMinimap();
      }, { passive: false });
    }
  }

  setZoom(newZoom, centerX, centerY) {
    const clamped = Math.max(0.5, Math.min(2.2, newZoom));
    const cx = centerX !== undefined ? centerX : this.canvas.width / 2;
    const cy = centerY !== undefined ? centerY : this.canvas.height / 2;

    const wx = (cx - this.camX) / this.zoom;
    const wy = (cy - this.camY) / this.zoom;

    this.zoom = clamped;
    this.camX = cx - wx * this.zoom;
    this.camY = cy - wy * this.zoom;

    const zoomTag = document.getElementById('minimapZoomTag');
    if (zoomTag) zoomTag.textContent = Math.round(this.zoom * 100) + '%';
  }

  handlePointerDown(clientX, clientY, button) {
    if (this.isGameOver) return;

    const rect = this.canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const wx = (mx - this.camX) / this.zoom;
    const wy = (my - this.camY) / this.zoom;
    const tx = Math.floor(wx / this.tileSize);
    const ty = Math.floor(wy / this.tileSize);

    if (!this.isValidTile(tx, ty)) return;
    const tile = this.grid[ty][tx];

    // 1x Right-Click or Touch Flag Mode: Instantly Toggles Flag (Fair Anti-Cheat: No score spoilers!)
    if (button === 2 || (button === 0 && this.flagMode)) {
      if (tile.covered) {
        tile.flagged = !tile.flagged;
        this.movesCount++;
        if (tile.flagged) {
          if (!this.seenDiscoveries['first_flag']) {
            this.seenDiscoveries['first_flag'] = true;
            localStorage.setItem('ks_discoveries', JSON.stringify(this.seenDiscoveries));
            this.notify('🚩 Oflagowano podejrzane pole jako potencjalną minę!', '🚩');
          }
          this.addFloatingText('🚩 Flaga', tx * this.tileSize + 20, ty * this.tileSize - 10, '#ffd54f');
          this.notify(`🚩 Postawiono flagę na pozycji [${tx} x ${ty}].`, '🚩');
        } else {
          this.addFloatingText('Zdjęto flagę', tx * this.tileSize + 20, ty * this.tileSize - 10, '#cfd8dc');
        }
        sfx.playFlag();
        this.updateUI();
        this.renderMinimap();
      } else if (!tile.covered && tile.adjacentDangers > 0) {
        this.chordTile(tx, ty);
      }
      return;
    }

    // Cast active power
    if (this.activePower) {
      this.executePowerOnTile(tx, ty, this.activePower);
      return;
    }

    // Build building
    if (this.selectedBuildingType) {
      this.attemptBuild(tx, ty, this.selectedBuildingType);
      return;
    }

    // Left-click on Covered Tile: DISPATCH NEAREST SAPPER TO DIG!
    if (tile.covered) {
      if (tile.flagged || tile.oracleFlag) return; // Protected
      this.movesCount++;
      this.dispatchSapperToDig(tx, ty);
    } else {
      if (tile.adjacentDangers > 0) {
        this.chordTile(tx, ty);
      }
    }
  }

  // --- Physical Sapper Digging & Fatal Casualties ---
  dispatchSapperToDig(tx, ty) {
    const tile = this.grid[ty][tx];
    if (tile.digOrdered) return;

    // Find closest idle sapper
    const targetPx = tx * this.tileSize;
    const targetPy = ty * this.tileSize;

    let nearestSapper = null;
    let minDist = Infinity;

    this.sappersList.forEach(s => {
      if (s.state === 'idle') {
        const d = Math.hypot(s.x - targetPx, s.y - targetPy);
        if (d < minDist) {
          minDist = d;
          nearestSapper = s;
        }
      }
    });

    if (nearestSapper) {
      tile.digOrdered = true;
      nearestSapper.state = 'walking_to_dig';
      nearestSapper.digTile = { tx, ty };
      nearestSapper.targetX = targetPx + (this.tileSize - 24) / 2;
      nearestSapper.targetY = targetPy + (this.tileSize - 24) / 2;

      // Update right panel active unit card
      this.updateActiveUnitCard(nearestSapper, `Biegnie do wykopu [${tx} x ${ty}]`);
      sfx.playRecruit();
    } else {
      // If no sapper available
      if (this.sappers > 0) {
        // Queue digging order
        tile.digOrdered = true;
        this.digQueue.push({ tx, ty });
        this.notify('Wszyscy saperzy w terenie! Rozkaz dodano do kolejki.', '⏳');
      } else {
        // 0 Sappers! Emergency risky excavation
        this.notify('⚠️ Brak żywych saperów! Zrekrutuj sapera (+⛑️) lub użyj Wyroczni!', '⚠️');
      }
    }
  }

  executeSapperDigAt(sapper, tx, ty) {
    const tile = this.grid[ty][tx];
    tile.digOrdered = false;

    // Dig particles & SFX
    sfx.playDig();
    this.createDirtSparks(tx * this.tileSize + this.tileSize / 2, ty * this.tileSize + this.tileSize / 2);

    // Check Lucky Dud Hero Perk (3% chance mine is a dud)
    if (tile.danger && tile.dangerType === 'mine' && this.activeHeroPerk === 'lucky_dud' && Math.random() < 0.03) {
      tile.danger = false;
      this.notify('🍀 Szczęście Sapera: Mina okazała się niewybuchem!', '🍀');
    }

    // Check if hazard / mine exploded under sapper's feet!
    if (tile.danger) {
      this.handleHazardDetonationUnderSapper(sapper, tx, ty);
    } else {
      // Safe reveal: sapper remains on the tile guarding the sector!
      this.uncoverSafeTile(tx, ty);
      sapper.x = tx * this.tileSize + (this.tileSize - 24) / 2;
      sapper.y = ty * this.tileSize + (this.tileSize - 24) / 2;
      sapper.state = 'idle';
      this.updateActiveUnitCard(sapper, `Czuwa na pozycji [${tx} x ${ty}]`);
      this.checkAndProcessDigQueue();
    }
  }

  handleHazardDetonationUnderSapper(sapper, tx, ty) {
    const tile = this.grid[ty][tx];
    tile.danger = false;
    tile.crater = true;
    tile.covered = false;

    // Increment blunder / skucha count!
    this.blundersCount++;
    this.updateUI();

    // First blunder tutorial discovery
    this.triggerDiscovery('first_blunder', 'Wybuch Miny i Skucha Sapera', '💥', 'Saper natrafił na minę! Jeśli nie miałeś aktywnego pancerza ochronnego (🛡️) lub talentu Niezłomnego Ducha, saper poległ na służbie. Nowych saperów możesz zawsze rekrutować za złoto (+⛑️) w prawym panelu lub na dolnym pasku!');

    // Screen Shake & SFX
    const win = document.getElementById('appWindow');
    if (win) {
      win.classList.remove('screen-shake');
      void win.offsetWidth;
      win.classList.add('screen-shake');
    }
    sfx.playExplosion();
    this.createExplosion(tx * this.tileSize + 20, ty * this.tileSize + 20);

    // Check Shield Protection
    if (this.hasBlastShield) {
      this.hasBlastShield = false;
      sfx.playShield();
      this.notify('🛡️ Pancerz ochronny ocalił życie sapera!', '🛡️');
      sapper.state = 'idle';
      this.updateActiveUnitCard(sapper, 'Ocalony przez Pancerz');
      this.checkAndProcessDigQueue();
      return;
    }

    // Check Unyielding Commander Hero Perk
    if (this.activeHeroPerk === 'unyielding' && this.blundersCount === 1) {
      this.notify('🌟 Niezłomny Duch: Pierwsza skucha została zniwelowana bez strat!', '🌟');
      sapper.state = 'idle';
      this.checkAndProcessDigQueue();
      return;
    }

    // SAPPER IS KILLED!
    this.sappers--;
    const idx = this.sappersList.indexOf(sapper);
    if (idx !== -1) this.sappersList.splice(idx, 1);

    this.notify(`💥 SKUCHA! Mina zdetonowała pod nogami sapera! Stracono sapera (Pozostało: ${this.sappers})`, '💥');

    // Earth Alchemy Hero Perk: leaves gold vein instead of crater
    if (this.activeHeroPerk === 'earth_alchemy') {
      tile.crater = false;
      tile.dangerType = 'chest';
      this.notify('⚗️ Alchemia Ziemi: Miejsce wybuchu przekształciło się w żyłę złota!', '💰');
    }

    this.updateActiveUnitCard(null, 'Poległ na służbie...');
    this.checkVictoryCondition();
    this.updateUI();
    this.checkAndProcessDigQueue();
  }

  checkAndProcessDigQueue() {
    if (this.digQueue.length > 0 && this.sappersList.some(s => s.state === 'idle')) {
      const next = this.digQueue.shift();
      this.dispatchSapperToDig(next.tx, next.ty);
    }
  }

  uncoverSafeTile(tx, ty) {
    const tile = this.grid[ty][tx];
    if (!tile.covered) return;
    if (tile.terrain === 'water' || tile.terrain === 'sea') return;
    tile.covered = false;
    this.uncoveredCount++;

    // Tutorial: First safe tile discovery
    this.triggerDiscovery('first_tile', 'Pionierski Wykop', '⛏️', 'Odkryto pierwsze bezpieczne pole! Cyfry wskazują liczbę min ukrytych na sąsiednich 8 polach. Jeśli cyfra wynosi 0, teren odsłania się kaskadowo.');

    // 2nd Hero Unlock at 50 uncovered tiles!
    if (this.uncoveredCount >= 50 && this.unlockedHeroSlots < 2) {
      this.unlockedHeroSlots = 2;
      localStorage.setItem('ks_hero_slots', '2');
      sfx.playVictory();
      this.addFloatingText('🌟 2. BOHATER ODBLOKOWANY!', tx * this.tileSize + 20, ty * this.tileSize - 25, '#ffd700');
      this.triggerDiscovery('second_hero', 'Odblokowano Drugiego Bohatera!', '🌟', 'Wspaniałe osiągnięcie! Po odkryciu pierwszych 50 pól Nowego Świata powołałeś drugiego bohatera kolonii! Zyskałeś drugi slot na potężny talent w oknie SuperBohatera (⚡).');
      this.notify('🌟 50 kafelków odkrytych! Powołano drugiego bohatera i odblokowano 2. slot talentu!', '🌟');
    }

    // Colony Living Growth: Expand settlement additions every 2% map progress
    const totalLand = this.grid.flat().filter(t => t.terrain !== 'water' && t.terrain !== 'sea').length;
    const progressPct = Math.floor((this.uncoveredCount / Math.max(1, totalLand)) * 100);
    if (progressPct >= this.lastSettlementMilestonePct + 2) {
      this.lastSettlementMilestonePct = Math.floor(progressPct / 2) * 2;
      this.expandColonySettlement();
    }

    // Active placed buildings periodic benefits
    if (this.placedBuildings && this.placedBuildings.length > 0) {
      // Houses: every 10 tiles, scout a random adjacent safe tile
      if (this.uncoveredCount % 10 === 0 && this.placedBuildings.some(b => b.type === 'house')) {
        this.scoutHouseNeighborSafeTile();
      }
      // Barracks: every 25 tiles, clear 2 tiles
      if (this.uncoveredCount % 25 === 0 && this.placedBuildings.some(b => b.type === 'barracks')) {
        this.autoRevealRandomSafeTile();
        this.autoRevealRandomSafeTile();
        this.notify('🛡️ Koszary wojskowe dokonały zwiadu i zabezpieczyły 2 prowincje!', '🛡️');
      }
      // Market: gives +10 gold every 10 tiles
      if (this.uncoveredCount % 10 === 0 && this.placedBuildings.some(b => b.type === 'market')) {
        this.resources += 10;
        this.addFloatingText('+10 💰 Targ', tx * this.tileSize + 20, ty * this.tileSize - 10, '#ffd700');
      }
    }

    // Hero progression: unlock a new hero ability / level every 10 uncovered tiles!
    const currentMilestone = Math.floor(this.uncoveredCount / 10);
    if (currentMilestone > this.lastHeroMilestone && this.uncoveredCount >= 10) {
      this.lastHeroMilestone = currentMilestone;
      this.heroLevel = (this.heroLevel || 1) + 1;

      const availablePerks = this.heroPerks.filter(p => !this.unlockedHeroPerks.includes(p.id));
      let newPerk = null;
      if (availablePerks.length > 0) {
        newPerk = availablePerks[Math.floor(Math.random() * availablePerks.length)];
        this.unlockedHeroPerks.push(newPerk.id);
      }
      sfx.playVictory();
      this.addFloatingText(`🌟 AWANS BOHATERA! Poz. ${this.heroLevel}`, tx * this.tileSize + 20, ty * this.tileSize - 20, '#e040fb');
      const perkMsg = newPerk ? ` Odblokowano talent: ${newPerk.name} ${newPerk.icon}!` : ` Wzmocniono siłę dowódcy!`;
      this.notify(`🌟 AWANS BOHATERA (Poziom ${this.heroLevel}) za ${this.uncoveredCount} odkrytych pól!${perkMsg}`, '⚡');
      this.triggerDiscovery('first_hero', 'Awans Bohatera', '🌟', 'Twój Bohater zdobywa poziomy za każde 10 odkrytych pól lub trafne flagowanie! Możesz aktywować unikalne talenty w oknie Bohatera (⚡) na dolnym pasku.');
    }

    // Resources increase for revealed tiles (+1 extra if farm built)!
    const midasBonus = this.activeHeroPerk === 'midas_touch' ? 1.5 : 1.0;
    const farmBonus = (this.placedBuildings && this.placedBuildings.some(b => b.type === 'farm')) ? 1 : 0;
    const goldEarned = Math.round((2 + farmBonus) * midasBonus);
    this.resources += goldEarned;
    this.addFloatingText(`+${goldEarned} 💰`, tx * this.tileSize + 20, ty * this.tileSize + 10, '#ffd700');

    // Uncovered special features
    if (tile.dangerType === 'chest') {
      const bonusGold = Math.round((70 + Math.floor(Math.random() * 50)) * midasBonus);
      this.resources += bonusGold;
      this.chestsCollected++;
      sfx.playChest();
      this.addFloatingText(`+${bonusGold} 💰 SKARB!`, tx * this.tileSize + 20, ty * this.tileSize - 10, '#ffea00');
      this.notify(`💎 Odnaleziono Skrzynię Złota (+${bonusGold} 💰)!`, '💎');
      this.triggerDiscovery('first_chest', 'Ukryty Skarb Złota', '💎', 'Odnaleziono starożytną skrzynię złota! Skarby powiększają zasoby Twojej ekspedycji i pozwalają na rekrutację nowych saperów oraz zakup technologii.');
    } else if (tile.dangerType === 'wigwam') {
      // Civ 1 Native Tribal Village Contact
      sfx.playVictory();
      this.resources += 80;
      this.royalSeals += 2;
      localStorage.setItem('ks_seals', this.royalSeals);
      this.notify('🏕️ Wioska Indian! Starszyzna ofiarowała: +80 💰 i +2 👑 Pieczęcie!', '🏕️');
      this.triggerDiscovery('first_wigwam', 'Wioska Tubylcza Indian', '🏕️', 'Twoi saperzy nawiązali kontakt z przyjazną osadą tubylczą. W zamian za pokój otrzymujesz złoto i Królewskie Pieczęcie 👑.');
    }

    // Cascade reveal if 0 adjacent dangers
    if (tile.adjacentDangers === 0 && !tile.danger && !tile.crater) {
      sfx.playCascade();
      this.floodFillReveal(tx, ty);
    }

    // Advance Colonization Settlement Evolution
    this.updateSettlementBadge();
    this.checkVictoryCondition();
    this.updateUI();
    this.renderMinimap();

    // Trigger AI Rival pacing
    this.triggerAiRivalPacing();
  }

  floodFillReveal(startX, startY) {
    const queue = [[startX, startY]];
    while (queue.length > 0) {
      const [cx, cy] = queue.shift();
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (this.isValidTile(nx, ny)) {
            const nTile = this.grid[ny][nx];
            // Stop water/ocean from cascading!
            if (nTile.terrain === 'water' || nTile.terrain === 'sea') continue;
            if (nTile.covered && !nTile.flagged && !nTile.oracleFlag && !nTile.danger) {
              nTile.covered = false;
              this.uncoveredCount++;
              this.resources += 1;

              // Check hero unlock milestone during cascade as well!
              const currentMilestone = Math.floor(this.uncoveredCount / 10);
              if (currentMilestone > this.lastHeroMilestone && this.uncoveredCount >= 10) {
                this.lastHeroMilestone = currentMilestone;
                this.heroLevel = (this.heroLevel || 1) + 1;
                const availablePerks = this.heroPerks.filter(p => !this.unlockedHeroPerks.includes(p.id));
                if (availablePerks.length > 0) {
                  const newPerk = availablePerks[Math.floor(Math.random() * availablePerks.length)];
                  this.unlockedHeroPerks.push(newPerk.id);
                  this.notify(`🌟 AWANS BOHATERA (Poz. ${this.heroLevel}): Odblokowano ${newPerk.name} ${newPerk.icon}!`, '⚡');
                }
                this.triggerDiscovery('first_hero', 'Awans Bohatera', '🌟', 'Twój Bohater zdobywa poziomy za każde 10 odkrytych pól lub trafne flagowanie! Możesz aktywować unikalne talenty w oknie Bohatera (⚡) na dolnym pasku.');
              }

              if (nTile.adjacentDangers === 0) queue.push([nx, ny]);
            }
          }
        }
      }
    }
  }

  chordTile(tx, ty) {
    this.movesCount++;
    const tile = this.grid[ty][tx];
    let flagsCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = tx + dx;
        const ny = ty + dy;
        if (this.isValidTile(nx, ny) && (this.grid[ny][nx].flagged || this.grid[ny][nx].oracleFlag)) {
          flagsCount++;
        }
      }
    }

    if (flagsCount === tile.adjacentDangers) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = tx + dx;
          const ny = ty + dy;
          if (this.isValidTile(nx, ny)) {
            const neighbor = this.grid[ny][nx];
            if (neighbor.covered && !neighbor.flagged && !neighbor.oracleFlag) {
              this.dispatchSapperToDig(nx, ny);
            }
          }
        }
      }
    }
  }

  // --- AI Rivals Simulation (Colonization Pacing) ---
  triggerAiRivalPacing() {
    this.aiTurnCounter++;
    if (this.aiTurnCounter % 2 !== 0) return; // Moves at half-player pace

    const rivals = Object.values(this.aiRivals);
    rivals.forEach(rival => {
      // AI explores a random adjacent coordinate on their side
      const rx = Math.max(0, Math.min(this.gridWidth - 1, rival.x + Math.floor(Math.random() * 5) - 2));
      const ry = Math.max(0, Math.min(this.gridHeight - 1, rival.y + Math.floor(Math.random() * 5) - 2));

      if (this.isValidTile(rx, ry)) {
        const t = this.grid[ry][rx];
        if (t.covered) {
          rival.tiles++;
          if (t.danger) {
            rival.blunders++;
            if (Math.random() < 0.3) {
              this.notify(`📢 Wywiad: ${rival.name} stracili sapera na minie w sektorze [${rx} x ${ry}]!`, '💥');
            }
          } else {
            rival.gold += 2;
          }
        }
      }
    });
  }

  // --- Hover Tile Inspector & Yields (Bottom-Right Panel) ---
  updateHoverTileInspector(tx, ty) {
    const tile = this.grid[ty][tx];
    const coordsTag = document.getElementById('tileCoordsTag');
    const nameEl = document.getElementById('tileTerrainName');
    const dangerEl = document.getElementById('tileDangerLevel');
    const iconEl = document.getElementById('tileTerrainIcon');
    const bonusList = document.getElementById('tileBonusesList');
    const descEl = document.getElementById('tileActionDesc');

    if (coordsTag) coordsTag.textContent = `${tx} x ${ty}`;

    let terrainName = '';
    let icon = '';
    let dangerText = '';
    let bonuses = [];
    let actionDesc = '';

    if (tile.covered) {
      // User request: Jak pole szare jest nieodkryte to NIE POKAZUJ co jest pod tym!
      terrainName = tile.flagged ? 'Oflagowany Teren' : 'Niezbadany Ląd (Mgła Wojny)';
      icon = tile.flagged ? '🚩' : '❓';
      dangerText = tile.flagged ? '🚩 Podejrzenie miny (Oznaczone)' : '❓ Ryzyko min (Mgła Wojny)';
      bonuses = ['🌫️ Surowce ukryte pod mgłą', '⛏️ Wyślij sapera, aby odkryć'];
      actionDesc = tile.flagged
        ? '<b>Pole oflagowane:</b> Podejrzenie miny. Kliknij 1x PPM, aby zdjąć flagę.'
        : '<b>Niezbadany ląd:</b> Kliknij LPM, aby zlecić saperowi wykop. 1x PPM stawia flagę.';
    } else {
      // Tylko gdy pole jest faktycznie odkryte (nie-szare) ujawniamy surowce, teren i skarby!
      if (tile.dangerType === 'chest') {
        terrainName = 'Starożytna Skrzynia Złota';
        icon = '💎';
        dangerText = '✅ Skarb odkryty!';
        bonuses = ['💰 Skarb: 70-120 złota', '👑 Prestiż Królestwa'];
        actionDesc = '<b>Starożytny Skarb:</b> Odkopano złoto! Zasiliło skarbiec Twojej ekspedycji.';
      } else if (tile.dangerType === 'wigwam') {
        terrainName = 'Wioska Indian (Tubylcy)';
        icon = '🏕️';
        dangerText = '✅ Sojusz z tubylcami';
        bonuses = ['💰 Dar Złota: +80', '👑 Pieczęcie Królewskie: +2'];
        actionDesc = '<b>Wioska Tubylcza:</b> Sojusz z Indianami. Ofiarowano złoto i Królewskie Pieczęcie 👑.';
      } else if (tile.dangerType === 'dragon_nest') {
        terrainName = 'Volcan Jaskinia Smoka';
        icon = '🐉';
        dangerText = '💥 Śmiertelne Niebezpieczeństwo';
        bonuses = ['💥 Siedlisko Bestii', '💣 Wymaga Katapulty lub Wyroczni'];
        actionDesc = '<b>Jaskinia Smoka:</b> Użyj Katapulty lub Wyroczni z paska mocy!';
      } else if (tile.crater) {
        terrainName = 'Krater po Wybuchu';
        icon = '💥';
        dangerText = 'Oczyszczone (po detonacji)';
        bonuses = ['🧱 Gruz i popiół'];
        actionDesc = '<b>Krater Wybuchu:</b> Pozostałość po zdetonowanej minie.';
      } else if (tile.terrain === 'trees') {
        terrainName = 'Gęsty Las Sosnowy';
        icon = '🌲';
        dangerText = tile.adjacentDangers > 0 ? `⚠️ Zagrożenie: ${tile.adjacentDangers} sąsiednie miny` : '✅ Teren oczyszczony';
        bonuses = ['🌲 Drewno: +2', '💰 Złoto: +1', '🛡️ Obrona: +25%'];
        actionDesc = tile.adjacentDangers > 0 ? `<b>Bezpieczny Las:</b> Sąsiaduje z ${tile.adjacentDangers} minami.` : '<b>Oczyszczony Las:</b> Bezpieczna polana.';
      } else if (tile.terrain === 'water' || tile.terrain === 'sea') {
        terrainName = 'Szlak Morski / Wybrzeże';
        icon = '🌊';
        dangerText = '✅ Woda bezpieczna';
        bonuses = ['🐟 Połów Ryb: +3', '🚢 Transport Morski'];
        actionDesc = '<b>Szlak Morski:</b> Naturalne wody oceanu. Bezpieczna, otwarta przestrzeń.';
      } else if (tile.terrain === 'lake') {
        terrainName = 'Jezioro Śródlądowe';
        icon = '💧';
        dangerText = '✅ Słodka woda';
        bonuses = ['🐟 Słodka Woda: +2', '🌾 Nawodnienie: +2'];
        actionDesc = '<b>Jezioro:</b> Naturalny zbiornik słodkiej wody.';
      } else {
        terrainName = 'Równiny Kolonii';
        icon = '🌾';
        dangerText = tile.adjacentDangers > 0 ? `⚠️ Zagrożenie: ${tile.adjacentDangers} sąsiednie miny` : '✅ Teren oczyszczony';
        bonuses = ['💰 Złoto: +2', '🌾 Żywność: +2'];
        actionDesc = tile.adjacentDangers > 0
          ? `<b>Bezpieczna Ziemia:</b> Sąsiaduje z ${tile.adjacentDangers} minami. Kliknij cyfrę, aby natychmiast odsłonić bezpiecznych sąsiadów!`
          : '<b>Oczyszczony Teren:</b> Brak min w bezpośrednim sąsiedztwie.';
      }

      if (tile.building) {
        terrainName = `Osada: ${tile.building.type.toUpperCase()}`;
        icon = '🏰';
        bonuses.push('👷 Dochód Kolonialny');
      }
    }

    if (nameEl) nameEl.textContent = terrainName;
    if (iconEl) iconEl.textContent = icon;
    if (dangerEl) dangerEl.textContent = dangerText;

    if (bonusList) {
      bonusList.innerHTML = bonuses.map(b => `<div class="bonus-pill">${b}</div>`).join('');
    }

    // Miniaturka w Inspektorze (dokładna grafika kafelka na mini-canvas)
    const thumbCanvas = document.getElementById('tileThumbnailCanvas');
    if (thumbCanvas) {
      const tctx = thumbCanvas.getContext('2d');
      tctx.clearRect(0, 0, 48, 48);
      let previewSprite = null;

      if (tile.covered) {
        previewSprite = tile.oracleFlag ? Sprites.cache.golden_flag :
                        (tile.flagged ? (this.engineMode === 'classic' ? Sprites.cache.classic_flag : Sprites.cache.flag) :
                        (this.engineMode === 'classic' ? Sprites.cache.classic_covered : Sprites.cache.covered));
      } else {
        if (tile.crater) previewSprite = Sprites.cache.crater;
        else if (tile.dangerType === 'chest') previewSprite = Sprites.cache.chest;
        else if (tile.dangerType === 'wigwam') previewSprite = Sprites.cache.wigwam;
        else if (tile.dangerType === 'dragon_nest') previewSprite = Sprites.cache.dragon_cave;
        else if (tile.building) previewSprite = Sprites.cache[tile.building.type] || Sprites.cache.keep;
        else if (tile.terrain === 'trees') previewSprite = Sprites.cache.trees;
        else if (tile.terrain === 'lake') previewSprite = Sprites.cache.lake;
        else if (tile.terrain === 'sea') previewSprite = Sprites.cache.sea;
        else if (tile.terrain === 'water') previewSprite = Sprites.cache.water;
        else previewSprite = (this.engineMode === 'classic' ? Sprites.cache.classic_revealed : Sprites.cache.grass);
      }

      if (previewSprite) {
        tctx.drawImage(previewSprite, 0, 0, 48, 48);
      }
      if (!tile.covered && tile.adjacentDangers > 0 && !tile.danger && !tile.crater) {
        tctx.font = '900 24px "Montserrat", sans-serif';
        tctx.textAlign = 'center';
        tctx.textBaseline = 'middle';
        tctx.strokeStyle = '#000';
        tctx.lineWidth = 3.5;
        tctx.strokeText(tile.adjacentDangers.toString(), 24, 24);
        tctx.fillStyle = '#00e676';
        tctx.fillText(tile.adjacentDangers.toString(), 24, 24);
      }
    }

    if (descEl) descEl.innerHTML = actionDesc;
  }

  // --- Interactive First-Time Discovery & Tutorial ---
  triggerDiscovery(key, title, icon, message) {
    if (this.seenDiscoveries[key]) return;
    this.seenDiscoveries[key] = true;
    localStorage.setItem('ks_discoveries', JSON.stringify(this.seenDiscoveries));

    const modal = document.getElementById('modalDiscovery');
    if (modal) {
      const hTitle = document.getElementById('discoveryHeaderTitle');
      const dIcon = document.getElementById('discoveryIcon');
      const dTitle = document.getElementById('discoveryTitle');
      const dText = document.getElementById('discoveryText');

      if (hTitle) hTitle.textContent = `🧭 Nowe Odkrycie: ${title}`;
      if (dIcon) dIcon.textContent = icon;
      if (dTitle) dTitle.textContent = title;
      if (dText) dText.textContent = message;

      sfx.playVictory();
      modal.style.display = 'flex';
    }
  }

  resetTutorial() {
    this.seenDiscoveries = {};
    localStorage.removeItem('ks_discoveries');
    this.notify('🔄 Zresetowano samouczek! Nowe odkrycia będą wyjaśniane od nowa.', '🧭');
  }

  updateActiveUnitCard(sapper, statusText) {
    const nameEl = document.getElementById('unitName');
    const roleEl = document.getElementById('unitRole');
    const badgeEl = document.getElementById('unitStateBadge');
    if (!nameEl) return;

    if (sapper) {
      nameEl.textContent = sapper.name;
      if (roleEl) roleEl.textContent = statusText || 'Wykop pól na rozkaz';
      if (badgeEl) {
        badgeEl.textContent = sapper.state === 'idle' ? 'Czuwa' : 'W akcji';
        badgeEl.style.background = sapper.state === 'idle' ? '#2e7d32' : '#f57f17';
      }
    } else {
      nameEl.textContent = 'Korpus Saperski';
      if (roleEl) roleEl.textContent = statusText || 'Brak aktywnych zleceń';
    }
  }

  // --- Colonization Settlement Evolution ---
  updateSettlementBadge() {
    const tierPill = document.getElementById('settlementTierPill');
    const nameEl = document.getElementById('settlementName');
    const goalEl = document.getElementById('settlementNextGoal');
    const fillEl = document.getElementById('settlementProgressFill');
    const iconEl = document.getElementById('settlementTierIcon');
    if (!nameEl) return;

    let tier = 1;
    let title = 'Obóz Pionierów';
    let icon = '🏕️';
    let nextText = 'Następny: 15 odkrytych pól';
    let pct = Math.min(100, Math.round((this.uncoveredCount / 15) * 100));

    if (this.uncoveredCount >= 65) {
      tier = 4;
      title = 'Królewska Twierdza';
      icon = '🏰';
      nextText = 'Maksymalny rozwój cytadeli!';
      pct = 100;
    } else if (this.uncoveredCount >= 35) {
      tier = 3;
      title = 'Miasteczko Handlowe';
      icon = '🏘️';
      nextText = 'Następny poziom: 65 pól';
      pct = Math.min(100, Math.round(((this.uncoveredCount - 35) / 30) * 100));
    } else if (this.uncoveredCount >= 15) {
      tier = 2;
      title = 'Osada Leśna';
      icon = '🏡';
      nextText = 'Następny poziom: 35 pól';
      pct = Math.min(100, Math.round(((this.uncoveredCount - 15) / 20) * 100));
    }

    if (tierPill) tierPill.textContent = `Poz. ${tier}`;
    if (nameEl) nameEl.textContent = title;
    if (iconEl) iconEl.textContent = icon;
    if (goalEl) goalEl.textContent = nextText;
    if (fillEl) fillEl.style.width = pct + '%';
  }

  // --- Royal Powers & Blind Guessing ---
  activatePower(key) {
    if (this.powerCooldowns[key] > 0) {
      this.notify(`Moc ${key} odnawia się! Poczekaj.`, '⏳');
      return;
    }
    this.activePower = key;
    this.notify(`Wybrano moc: ${key.toUpperCase()}. Kliknij na pole na planszy!`, '✨');
  }

  executePowerOnTile(tx, ty, powerKey) {
    const tile = this.grid[ty][tx];
    this.activePower = null;

    if (powerKey === 'oracle') {
      sfx.playOracle();
      if (tile.danger) {
        tile.oracleFlag = true;
        this.notify('🔮 Wyrocznia: Wykryto niebezpieczeństwo! Postawiono złotą flagę.', '🔮');
      } else {
        this.uncoverSafeTile(tx, ty);
        this.notify('🔮 Wyrocznia: Pole jest bezpieczne!', '🔮');
      }
      this.powerCooldowns.oracle = this.powerBaseCooldowns.oracle;
    } else if (powerKey === 'falcon') {
      sfx.playSpell();
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = tx + dx;
          const ny = ty + dy;
          if (this.isValidTile(nx, ny)) {
            const nt = this.grid[ny][nx];
            if (nt.covered && !nt.danger) this.uncoverSafeTile(nx, ny);
          }
        }
      }
      this.notify('🦅 Sokoli Zwiad odsłonił bezpieczne kafelki w rejonie 3x3!', '🦅');
      this.powerCooldowns.falcon = this.powerBaseCooldowns.falcon;
    } else if (powerKey === 'shield') {
      this.hasBlastShield = true;
      sfx.playShield();
      this.notify('🛡️ Aktywowano Pancerz Ochronny na następną skuchę!', '🛡️');
      this.powerCooldowns.shield = this.powerBaseCooldowns.shield;
    } else if (powerKey === 'bombard') {
      sfx.playExplosion();
      this.createExplosion(tx * this.tileSize + 20, ty * this.tileSize + 20);
      if (tile.danger) {
        tile.danger = false;
        tile.crater = true;
        tile.covered = false;
        this.notify('💣 Katapulta zniszczyła minę z dystansu bez strat w ludziach!', '💣');
      } else {
        this.uncoverSafeTile(tx, ty);
      }
      this.powerCooldowns.bombard = this.powerBaseCooldowns.bombard;
    } else if (powerKey === 'probe') {
      sfx.playSpell();
      if (tile.danger) {
        tile.danger = false;
        tile.covered = false;
        this.resources += 40;
        this.notify('🧲 Sonda bezpiecznie rozbroiła pułapkę! +40 💰', '🧲');
      } else {
        this.uncoverSafeTile(tx, ty);
      }
      this.powerCooldowns.probe = this.powerBaseCooldowns.probe;
    }

    this.updateUI();
  }

  // --- Main Simulation Tick (Every 1s) ---
  simulationTick() {
    if (this.isGameOver) return;
    this.elapsedSeconds++;

    // Sixth Sense Superhero Perk: 1% chance every second to auto-reveal a random safe tile!
    if (this.activeHeroPerk === 'sixth_sense' && Math.random() < 0.015) {
      this.autoRevealRandomSafeTile();
    }

    // Monk's Blessing Perk: recruit free sapper every 60s
    if (this.activeHeroPerk === 'monk_blessing' && this.elapsedSeconds % 60 === 0 && this.sappers < this.sappersMax) {
      this.sappers++;
      this.notify('⛪ Błogosławieństwo Mnicha: Nowy Saper dołączył do Twojej kolonii!', '⛪');
    }

    // Native Indian Tribal Scout exploration event (every ~45s)
    this.nativeScoutTimer = (this.nativeScoutTimer || 45) - 1;
    if (this.nativeScoutTimer <= 0) {
      this.nativeScoutTimer = 35 + Math.floor(Math.random() * 25);
      this.triggerNativeScoutEvent();
    }

    // Cooldown reductions
    Object.keys(this.powerCooldowns).forEach(k => {
      if (this.powerCooldowns[k] > 0) this.powerCooldowns[k]--;
    });

    this.updateUI();
  }

  // 6 Native Indian Tribes Periodic Safe Scout Event
  triggerNativeScoutEvent() {
    const tribes = this.nativeTribes || [
      { name: 'Irokezi', icon: '🏹' },
      { name: 'Siuksowie', icon: '🪶' },
      { name: 'Komancze', icon: '🐎' },
      { name: 'Majowie', icon: '☀️' },
      { name: 'Algonkini', icon: '🌲' },
      { name: 'Apacze', icon: '🦅' }
    ];
    const tribe = tribes[Math.floor(Math.random() * tribes.length)];

    // Find a random safe covered land tile
    const safeCovered = [];
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const t = this.grid[y][x];
        if (t.covered && !t.danger && (t.terrain === 'grass' || t.terrain === 'trees')) {
          safeCovered.push({ x, y });
        }
      }
    }

    if (safeCovered.length > 0) {
      const chosen = safeCovered[Math.floor(Math.random() * safeCovered.length)];
      this.uncoverSafeTile(chosen.x, chosen.y);
      sfx.playRecruit();
      this.addFloatingText(`${tribe.icon} Zwiad ${tribe.name}!`, chosen.x * this.tileSize + 20, chosen.y * this.tileSize - 10, '#ffd54f');
      this.notify(`${tribe.icon} Przyjazny zwiad plemienia ${tribe.name} bezpiecznie zbadał i odsłonił sektor [${chosen.x}x${chosen.y}]!`, tribe.icon);
    }
  }

  // Living Colony Additions (trees, campfires, tents, fences every 2% progress)
  expandColonySettlement() {
    const kx = this.playerStart ? this.playerStart.x : Math.floor(this.gridWidth / 2);
    const ky = this.playerStart ? this.playerStart.y : Math.floor(this.gridHeight / 2);
    const decorTypes = ['tree', 'campfire', 'tent', 'fence'];
    const decorType = decorTypes[this.settlementAdditions.length % decorTypes.length];

    for (let r = 1; r <= 5; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = kx + dx;
          const ny = ky + dy;
          if (this.isValidTile(nx, ny)) {
            const t = this.grid[ny][nx];
            if (!t.covered && t.terrain === 'grass' && !t.building && !this.settlementAdditions.some(a => a.x === nx && a.y === ny)) {
              this.settlementAdditions.push({ x: nx, y: ny, type: decorType });
              this.addFloatingText('🔨 Rozbudowa!', nx * this.tileSize + 20, ny * this.tileSize, '#a5d6a7');
              this.notify('🔨 Osadnicy rozbudowali obejście bazy (+2% postępu)! Postawiono nowe obozowisko.', '🔨');
              return;
            }
          }
        }
      }
    }
  }

  // Scout neighbor safe tile for House colony building
  scoutHouseNeighborSafeTile() {
    const houses = this.placedBuildings.filter(b => b.type === 'house');
    if (houses.length === 0) return;
    const house = houses[Math.floor(Math.random() * houses.length)];
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = house.x + dx;
        const ny = house.y + dy;
        if (this.isValidTile(nx, ny)) {
          const t = this.grid[ny][nx];
          if (t.covered && !t.danger && t.terrain !== 'water' && t.terrain !== 'sea') {
            this.uncoverSafeTile(nx, ny);
            this.notify(`🏠 Chata osadników zbadała sąsiednie bezpieczne pole [${nx}x${ny}]!`, '🏠');
            return;
          }
        }
      }
    }
  }

  // Water splash particle for dolphins
  spawnWaterSplash(x, y) {
    this.waterSplashes.push({ x, y, radius: 4, life: 0.6, maxLife: 0.6 });
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 40,
        vy: -Math.random() * 30 - 10,
        life: 0.5,
        color: '#e1f5fe'
      });
    }
  }

  // Update Commander Display in Ribbon
  updateCommanderDisplay() {
    const avatarEl = document.getElementById('commanderAvatarDisplay');
    const nameEl = document.getElementById('commanderNameDisplay');
    if (avatarEl) avatarEl.textContent = this.commanderAvatar || '🧙‍♂️';
    if (nameEl) nameEl.textContent = this.commanderName || 'Król Artur';
  }

  // Strategic Building Placement on Click
  attemptBuild(tx, ty, type) {
    if (!this.isValidTile(tx, ty)) return;
    const tile = this.grid[ty][tx];
    const cost = this.buildingCosts[type] || 50;

    if (tile.covered) {
      this.notify('⚠️ Najpierw odkryj ten teren, aby móc na nim budować!', '⚠️');
      return;
    }
    if (tile.terrain === 'water' || tile.terrain === 'sea') {
      this.notify('⚠️ Nie można budować na głębokiej wodzie!', '🌊');
      return;
    }
    if (tile.building) {
      this.notify('⚠️ Na tym polu już stoi budynek!', '🏰');
      return;
    }
    if (this.resources < cost) {
      this.notify(`⚠️ Brak wystarczających zasobów złota! Wymagane: ${cost} 💰`, '💰');
      return;
    }

    // Deduct cost and place
    this.resources -= cost;
    tile.building = {
      type,
      hp: 100,
      maxHp: 100,
      level: 1
    };
    this.placedBuildings.push({ x: tx, y: ty, type });
    sfx.playConstruct();
    this.createDirtSparks(tx * this.tileSize + 24, ty * this.tileSize + 24);
    this.addFloatingText(`🔨 ${type.toUpperCase()}`, tx * this.tileSize + 20, ty * this.tileSize - 10, '#ffd54f');

    // Immediate building effect:
    if (type === 'watchtower') {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = tx + dx;
          const ny = ty + dy;
          if (this.isValidTile(nx, ny)) {
            const nt = this.grid[ny][nx];
            if (nt.covered && !nt.danger && nt.terrain !== 'water' && nt.terrain !== 'sea') {
              this.uncoverSafeTile(nx, ny);
            }
          }
        }
      }
      this.notify('🏹 Wieża Strażnicza odsłoniła bezpieczne otoczenie!', '🏹');
    } else if (type === 'wonder') {
      this.royalSeals += 2;
      localStorage.setItem('ks_seals', this.royalSeals.toString());
      for (let i = 0; i < 4; i++) {
        this.autoRevealRandomSafeTile();
      }
      this.notify('🏛️ Cud Świata roztoczył aurę i odkrył 4 bezpieczne prowincje (+2 👑)!', '🏛️');
    } else if (type === 'settler') {
      this.workersTotal++;
      this.workersIdle++;
      this.notify('🐎 Karawana Osadników założyła nową osadę (+1 robotnik)!', '🐎');
    } else if (type === 'barracks') {
      this.sappersMax++;
      this.sappers++;
      this.notify('🛡️ Koszary wojenne wyszkoliły dodatkowego sapera (+1 ⛑️)!', '🛡️');
    } else {
      this.notify(`🔨 Zbudowano pomyślnie obiekt: ${type}!`, '🔨');
    }

    this.selectedBuildingType = null;
    document.querySelectorAll('.build-card').forEach(c => c.classList.remove('active'));
    this.updateUI();
  }

  autoRevealRandomSafeTile() {
    for (let attempts = 0; attempts < 30; attempts++) {
      const rx = Math.floor(Math.random() * this.gridWidth);
      const ry = Math.floor(Math.random() * this.gridHeight);
      const t = this.grid[ry][rx];
      if (t.covered && !t.danger && !t.flagged) {
        this.uncoverSafeTile(rx, ry);
        this.notify('🔮 Siódmy Zmysł: Samoczynnie odkryto bezpieczne pole!', '🔮');
        break;
      }
    }
  }

  // --- Animation & Movement Loop ---
  gameLoop(timestamp) {
    const dt = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    this.updateEntities(dt);
    this.render();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  updateEntities(dt) {
    const speed = (this.activeHeroPerk === 'hermes_boots' ? 1400 : 850);

    // Sappers walking to dig with Water Obstacle Avoidance
    this.sappersList.forEach(s => {
      if (s.state === 'walking_to_dig' && s.digTile) {
        const dx = s.targetX - s.x;
        const dy = s.targetY - s.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 8) {
          let moveX = (dx / dist) * speed * dt;
          let moveY = (dy / dist) * speed * dt;

          // Water collision avoidance: sappers cannot walk through deep water!
          const testTileX = Math.floor((s.x + moveX) / this.tileSize);
          const testTileY = Math.floor((s.y + moveY) / this.tileSize);
          if (this.isValidTile(testTileX, testTileY)) {
            const tTerrain = this.grid[testTileY][testTileX].terrain;
            if (tTerrain === 'water') {
              const tileOnlyX = Math.floor((s.x + moveX) / this.tileSize);
              const tileCurY = Math.floor(s.y / this.tileSize);
              const canMoveX = this.isValidTile(tileOnlyX, tileCurY) && this.grid[tileCurY][tileOnlyX].terrain !== 'water';

              const tileCurX = Math.floor(s.x / this.tileSize);
              const tileOnlyY = Math.floor((s.y + moveY) / this.tileSize);
              const canMoveY = this.isValidTile(tileCurX, tileOnlyY) && this.grid[tileOnlyY][tileCurX].terrain !== 'water';

              if (canMoveX) moveY = 0;
              else if (canMoveY) moveX = 0;
              else { moveX = 0; moveY = 0; }
            }
          }

          s.x += moveX;
          s.y += moveY;
          s.walkAnim = (s.walkAnim || 0) + dt * 25;
          s.facing = dx < 0 ? -1 : 1;
        } else {
          // Arrived! Dig immediately!
          s.state = 'digging';
          this.executeSapperDigAt(s, s.digTile.tx, s.digTile.ty);
        }
      }
    });

    // Living Ocean: Update Sailing Caravels
    const waterTiles = this.grid ? this.grid.flat().filter(t => t.terrain === 'water' || t.terrain === 'sea') : [];
    this.oceanShips.forEach(ship => {
      ship.bobbing += dt * 3;
      const dx = ship.targetX - ship.x;
      const dy = ship.targetY - ship.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 6) {
        ship.angle = Math.atan2(dy, dx);
        ship.x += (dx / dist) * ship.speed * dt;
        ship.y += (dy / dist) * ship.speed * dt;
      } else {
        if (waterTiles.length > 0) {
          const nextT = waterTiles[Math.floor(Math.random() * waterTiles.length)];
          ship.targetX = nextT.x * this.tileSize + 8;
          ship.targetY = nextT.y * this.tileSize + 8;
        }
      }
    });

    // Living Ocean: Spawn Dolphins periodically
    this.dolphinSpawnTimer = (this.dolphinSpawnTimer || 0) - dt;
    if (this.dolphinSpawnTimer <= 0) {
      this.dolphinSpawnTimer = 3.5 + Math.random() * 4.0;
      if (waterTiles.length > 0) {
        const startT = waterTiles[Math.floor(Math.random() * waterTiles.length)];
        const angle = Math.random() * Math.PI * 2;
        const jumpDist = 32 + Math.random() * 24;
        const endX = startT.x * this.tileSize + Math.cos(angle) * jumpDist;
        const endY = startT.y * this.tileSize + Math.sin(angle) * jumpDist;
        this.dolphins.push({
          startX: startT.x * this.tileSize + 16,
          startY: startT.y * this.tileSize + 16,
          endX,
          endY,
          progress: 0,
          duration: 1.2,
          peakHeight: 22
        });
        this.spawnWaterSplash(startT.x * this.tileSize + 16, startT.y * this.tileSize + 16);
      }
    }

    // Update Dolphins
    for (let i = this.dolphins.length - 1; i >= 0; i--) {
      const d = this.dolphins[i];
      d.progress += dt / d.duration;
      if (d.progress >= 1.0) {
        this.spawnWaterSplash(d.endX, d.endY);
        this.dolphins.splice(i, 1);
      }
    }

    // Update Water Splashes
    for (let i = this.waterSplashes.length - 1; i >= 0; i--) {
      const sp = this.waterSplashes[i];
      sp.life -= dt;
      sp.radius += dt * 15;
      if (sp.life <= 0) this.waterSplashes.splice(i, 1);
    }

    // Floating text particles
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= dt * 25;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Explosion particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  // --- Rendering: Canvas & Minimap ---
  render() {
    this.resizeCanvas();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.camX, this.camY);
    this.ctx.scale(this.zoom, this.zoom);

    // 1. Draw Grid Tiles
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const tile = this.grid[y][x];
        const px = x * this.tileSize;
        const py = y * this.tileSize;

        if (tile.covered) {
          if (tile.oracleFlag) {
            this.ctx.drawImage(Sprites.cache.golden_flag, px, py);
          } else if (tile.flagged) {
            this.ctx.drawImage(this.engineMode === 'classic' ? Sprites.cache.classic_flag : Sprites.cache.flag, px, py);
          } else {
            this.ctx.drawImage(this.engineMode === 'classic' ? Sprites.cache.classic_covered : Sprites.cache.covered, px, py);
          }

          // Show targeted dig marker (Centered pickaxe with animated frame)
          if (tile.digOrdered) {
            this.ctx.fillStyle = 'rgba(255, 235, 59, 0.35)';
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
            this.ctx.strokeStyle = '#ffd600';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
            this.ctx.font = '22px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('⛏️', px + this.tileSize / 2, py + this.tileSize / 2);
          }
        } else {
          // Uncovered Tile
          if (tile.crater) {
            this.ctx.drawImage(Sprites.cache.crater, px, py, this.tileSize, this.tileSize);
          } else if (tile.terrain === 'water' || tile.terrain === 'sea') {
            this.ctx.drawImage(tile.terrain === 'sea' ? Sprites.cache.sea : Sprites.cache.water, px, py, this.tileSize, this.tileSize);
          } else if (tile.terrain === 'lake') {
            this.ctx.drawImage(Sprites.cache.lake, px, py, this.tileSize, this.tileSize);
          } else if (tile.terrain === 'trees') {
            this.ctx.drawImage(Sprites.cache.trees, px, py, this.tileSize, this.tileSize);
          } else {
            this.ctx.drawImage(this.engineMode === 'classic' ? Sprites.cache.classic_revealed : Sprites.cache.grass, px, py, this.tileSize, this.tileSize);
          }

          // Special Features
          if (tile.dangerType === 'dragon_nest') {
            this.ctx.drawImage(Sprites.cache.dragon_cave, px, py, this.tileSize, this.tileSize);
          } else if (tile.dangerType === 'chest') {
            this.ctx.drawImage(Sprites.cache.chest, px, py, this.tileSize, this.tileSize);
          } else if (tile.dangerType === 'wigwam') {
            this.ctx.drawImage(Sprites.cache.wigwam, px, py, this.tileSize, this.tileSize);
          }

          // Buildings & Settlements
          if (tile.building) {
            if (tile.building.type === 'keep') {
              // Evolving settlement sprite based on tier
              const tierSprite = this.uncoveredCount >= 65 ? Sprites.cache.settlement_citadel :
                                (this.uncoveredCount >= 35 ? Sprites.cache.settlement_township :
                                (this.uncoveredCount >= 15 ? Sprites.cache.settlement_hamlet : Sprites.cache.settlement_camp));
              this.ctx.drawImage(tierSprite, px, py, this.tileSize, this.tileSize);
            } else {
              const bSprite = Sprites.cache[tile.building.type];
              if (bSprite) this.ctx.drawImage(bSprite, px, py, this.tileSize, this.tileSize);
            }
          } else if (tile.adjacentDangers > 0 && !tile.danger && !tile.crater) {
            // Render High-Contrast Minesweeper Number with Exact Stroke
            this.renderMinesweeperNumber(tile.adjacentDangers, px, py);
          }
        }

        // Grid lines if enabled
        if (this.showGrid) {
          this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        }
      }
    }

    // 2. Draw Living Characters
    const drawChar = (sprite, u) => {
      const bob = Math.sin((u.walkAnim || 0)) * 2;
      this.ctx.save();
      this.ctx.translate(u.x + 12, u.y + 12 + bob);
      if (u.facing === -1) this.ctx.scale(-1, 1);
      this.ctx.drawImage(sprite, -12, -12);
      this.ctx.restore();
    };

    this.workers.forEach(w => drawChar(Sprites.cache.worker, w));
    this.sappersList.forEach(s => drawChar(Sprites.cache.sapper, s));

    // 3. Draw Living Colony Additions (trees, campfires, tents, fences around camp)
    this.settlementAdditions.forEach(decor => {
      const px = decor.x * this.tileSize;
      const py = decor.y * this.tileSize;
      this.ctx.font = '22px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      const icon = decor.type === 'campfire' ? '🔥' :
                  (decor.type === 'tent' ? '⛺' :
                  (decor.type === 'tree' ? '🌳' : '🪵'));
      this.ctx.fillText(icon, px + this.tileSize / 2, py + this.tileSize / 2);
    });

    // 4. Draw Living Ocean: Sailing Caravels
    this.oceanShips.forEach(ship => {
      this.ctx.save();
      this.ctx.translate(ship.x, ship.y + Math.sin(ship.bobbing) * 2);
      this.ctx.rotate(ship.angle);
      if (Sprites.cache.ship) {
        this.ctx.drawImage(Sprites.cache.ship, -18, -18, 36, 36);
      }
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(-20, -4);
      this.ctx.lineTo(-28, -8);
      this.ctx.moveTo(-20, 4);
      this.ctx.lineTo(-28, 8);
      this.ctx.stroke();
      this.ctx.restore();
    });

    // 5. Draw Living Ocean: Water Splashes
    this.waterSplashes.forEach(sp => {
      const alpha = Math.max(0, sp.life / sp.maxLife);
      this.ctx.strokeStyle = `rgba(179, 229, 252, ${alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      this.ctx.stroke();
    });

    // 6. Draw Living Ocean: Leaping Dolphins
    this.dolphins.forEach(d => {
      const currX = d.startX + d.progress * (d.endX - d.startX);
      const baseCurrY = d.startY + d.progress * (d.endY - d.startY);
      const arcY = baseCurrY - Math.sin(d.progress * Math.PI) * d.peakHeight;
      const angle = Math.atan2((d.endY - d.startY), (d.endX - d.startX)) + (d.progress - 0.5) * 0.8;
      this.ctx.save();
      this.ctx.translate(currX, arcY);
      this.ctx.rotate(angle);
      if (Sprites.cache.dolphin) {
        this.ctx.drawImage(Sprites.cache.dolphin, -14, -14, 28, 28);
      }
      this.ctx.restore();
    });

    // 7. Building Placement Ghost cursor
    if (this.selectedBuildingType && this.hoverTile) {
      const hpx = this.hoverTile.x * this.tileSize;
      const hpy = this.hoverTile.y * this.tileSize;
      const hTile = this.grid[this.hoverTile.y][this.hoverTile.x];
      const canBuild = !hTile.covered && hTile.terrain !== 'water' && hTile.terrain !== 'sea' && !hTile.building;

      this.ctx.fillStyle = canBuild ? 'rgba(76, 175, 80, 0.35)' : 'rgba(244, 67, 54, 0.35)';
      this.ctx.fillRect(hpx, hpy, this.tileSize, this.tileSize);
      this.ctx.strokeStyle = canBuild ? '#4caf50' : '#f44336';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(hpx + 1, hpy + 1, this.tileSize - 2, this.tileSize - 2);

      const bSprite = Sprites.cache[this.selectedBuildingType] || Sprites.cache.house;
      if (bSprite) {
        this.ctx.globalAlpha = 0.65;
        this.ctx.drawImage(bSprite, hpx, hpy, this.tileSize, this.tileSize);
        this.ctx.globalAlpha = 1.0;
      }
    }

    // Floating text indicators
    this.floatingTexts.forEach(ft => {
      this.ctx.font = 'bold 13px "Montserrat", sans-serif';
      this.ctx.fillStyle = ft.color;
      this.ctx.shadowColor = '#000';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.shadowBlur = 0;
    });

    this.ctx.restore();
  }

  // High-Contrast Bold Minesweeper Numbers with Dark Outline (Neon Green 2)
  renderMinesweeperNumber(num, px, py) {
    const brightColors = [
      '',
      '#2979ff', // 1: Vibrant Royal Blue
      '#00e676', // 2: Bright Neon Emerald (100% visible on dark sea, water, grass!)
      '#ff1744', // 3: Vivid Crimson Red
      '#7c4dff', // 4: Royal Violet
      '#ff9100', // 5: Warm Amber Orange
      '#00e5ff', // 6: Electric Cyan
      '#f50057', // 7: Bright Magenta
      '#ffffff'  // 8: Pure Platinum White
    ];

    const cx = px + this.tileSize / 2;
    const cy = py + this.tileSize / 2;

    this.ctx.font = '900 26px "Montserrat", "Segoe UI Black", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Solid dark outline stroke for razor-sharp visibility on any terrain
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3.8;
    this.ctx.lineJoin = 'round';
    this.ctx.strokeText(num.toString(), cx, cy);

    this.ctx.fillStyle = brightColors[num] || '#ffffff';
    this.ctx.fillText(num.toString(), cx, cy);
  }

  // --- Minimap Radar Rendering ---
  renderMinimap() {
    if (!this.minimapCtx) return;
    const mw = this.minimapCanvas.width;
    const mh = this.minimapCanvas.height;
    this.minimapCtx.clearRect(0, 0, mw, mh);

    const cellW = mw / this.gridWidth;
    const cellH = mh / this.gridHeight;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const t = this.grid[y][x];
        if (t.covered) {
          this.minimapCtx.fillStyle = t.flagged ? '#d50000' : '#455a64';
        } else {
          if (t.terrain === 'water' || t.terrain === 'sea') this.minimapCtx.fillStyle = '#0277bd';
          else if (t.terrain === 'lake') this.minimapCtx.fillStyle = '#00acc1';
          else if (t.terrain === 'trees') this.minimapCtx.fillStyle = '#1b5e20';
          else this.minimapCtx.fillStyle = '#8bc34a';

          if (t.building) this.minimapCtx.fillStyle = '#ffd600';
        }
        this.minimapCtx.fillRect(x * cellW, y * cellH, cellW, cellH);
      }
    }

    // Camera view rectangle on minimap
    const viewWorldX = (-this.camX / this.zoom);
    const viewWorldY = (-this.camY / this.zoom);
    const viewWorldW = (this.canvas.width / this.zoom);
    const viewWorldH = (this.canvas.height / this.zoom);

    const totalWorldW = this.gridWidth * this.tileSize;
    const totalWorldH = this.gridHeight * this.tileSize;

    const rx = (viewWorldX / totalWorldW) * mw;
    const ry = (viewWorldY / totalWorldH) * mh;
    const rw = (viewWorldW / totalWorldW) * mw;
    const rh = (viewWorldH / totalWorldH) * mh;

    this.minimapCtx.strokeStyle = '#ffeb3b';
    this.minimapCtx.lineWidth = 1.5;
    this.minimapCtx.strokeRect(rx, ry, rw, rh);
  }

  addFloatingText(text, x, y, color = '#ffd700') {
    this.floatingTexts.push({ text, x, y, color, life: 1.2 });
  }

  createDirtSparks(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 0.4
      });
    }
  }

  createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 0.6
      });
    }
  }

  // --- UI Update & Synchronization ---
  updateUI() {
    const resEl = document.getElementById('resCounter');
    if (resEl) resEl.textContent = this.resources.toString().padStart(4, '0');

    const skuchyEl = document.getElementById('skuchyCounter');
    if (skuchyEl) skuchyEl.textContent = this.blundersCount.toString();

    const scoreEl = document.getElementById('scoreCounter');
    if (scoreEl) scoreEl.textContent = `${this.score.toFixed(1)} pts`;

    const timerEl = document.getElementById('levelTimer');
    if (timerEl) {
      const mins = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
      const secs = (this.elapsedSeconds % 60).toString().padStart(2, '0');
      timerEl.textContent = `${mins}:${secs}`;
    }

    const sappersEl = document.getElementById('sappersCount');
    if (sappersEl) sappersEl.textContent = `${this.sappers}/${this.sappersMax}`;

    const uncoveredEl = document.getElementById('uncoveredCounter');
    if (uncoveredEl) uncoveredEl.textContent = this.uncoveredCount.toString().padStart(3, '0');

    const sealsEl = document.getElementById('sealsDisplay');
    if (sealsEl) sealsEl.textContent = this.royalSeals.toString();

    // Mines Remaining Counter (Total mines - flagged tiles)
    const flaggedCount = this.grid ? this.grid.flat().filter(t => t.flagged || t.oracleFlag).length : 0;
    const remainingMines = Math.max(0, (this.totalMines || 0) - flaggedCount);
    const minesEl = document.getElementById('minesDisplayCounter');
    if (minesEl) minesEl.textContent = `${remainingMines}/${this.totalMines || 0}`;

    // Update window title with Continent name, grid dimensions & bomb count
    const titleEl = document.getElementById('titleText');
    if (titleEl) {
      titleEl.textContent = `Keepsweeper: Nowy Świat - ${this.activeContinentName} (${this.gridWidth}x${this.gridHeight}) | Miny: ${remainingMines}/${this.totalMines || 0}`;
    }

    this.updateCommanderDisplay();

    const heroBadge = document.getElementById('heroBadge');
    if (heroBadge) {
      const p = this.heroPerks.find(x => x.id === this.activeHeroPerk);
      if (p) {
        heroBadge.innerHTML = `<span>${p.icon}</span><span>${p.name} (Poz. ${this.heroLevel || 1})</span>`;
      }
    }
  }

  // --- End of Game & Match History Streak Recording ---
  checkVictoryCondition() {
    if (this.isGameOver) return;

    // Victory guard: prevents premature victory before uncovering at least 25 continental tiles!
    if (this.uncoveredCount < 25) return;

    if (this.uncoveredCount >= this.uncoveredTarget) {
      this.recordMatchOutcome(true);
    } else if (this.sappers <= 0) {
      this.recordMatchOutcome(false);
    }
  }

  recordMatchOutcome(won) {
    this.isGameOver = true;
    sfx.playVictory();

    // Tally correct flags upon match completion (fair anti-cheat)
    const correctFlags = this.grid ? this.grid.flat().filter(t => t.flagged && t.danger).length : 0;
    const flagPoints = Math.round(correctFlags * 0.1 * 10) / 10;
    this.score = Math.round((this.score + flagPoints) * 10) / 10;

    const mins = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (this.elapsedSeconds % 60).toString().padStart(2, '0');
    const timeStr = `${mins}:${secs}`;

    const matchRecord = {
      id: Date.now(),
      commander: this.commanderName || this.activeCommander,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: this.mode,
      level: this.level,
      won: won,
      time: timeStr,
      seconds: this.elapsedSeconds,
      blunders: this.blundersCount,
      gold: this.resources,
      moves: this.movesCount,
      score: this.score.toFixed(1)
    };

    this.matchHistory.unshift(matchRecord);
    if (this.matchHistory.length > 50) this.matchHistory.pop();
    localStorage.setItem('ks_match_history', JSON.stringify(this.matchHistory));

    // Show Game Over Modal
    const modal = document.getElementById('modalGameOver');
    if (modal) {
      const title = document.getElementById('endgameTitle');
      const desc = document.getElementById('endgameDesc');
      const timeVal = document.getElementById('endgameTime');
      const blundersVal = document.getElementById('endgameBlunders');
      const goldVal = document.getElementById('endgameGold');

      if (title) title.textContent = won ? 'ZWYCIĘSTWO!' : 'PORAŻKA!';
      if (title) title.style.color = won ? '#2e7d32' : '#c62828';
      if (desc) desc.textContent = won ? `Nowy Świat został bezpiecznie zbadany i skolonizowany w ${this.movesCount} ruchach!` : 'Wszyscy saperzy polegli na polu minowym...';
      if (timeVal) timeVal.textContent = timeStr;
      if (blundersVal) blundersVal.textContent = `${this.blundersCount} 💥`;
      if (goldVal) goldVal.textContent = `+${this.resources} 💰 (${this.score.toFixed(1)} pts)`;

      modal.style.display = 'flex';
    }
  }

  // --- Match History Chart Canvas ("Pasmo ostatnich meczy") ---
  renderMatchHistoryChart(commander) {
    const chartCanvas = document.getElementById('matchHistoryChart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    const w = chartCanvas.width;
    const h = chartCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#1e282d';
    ctx.fillRect(0, 0, w, h);

    // Filter by commander
    const list = this.matchHistory.filter(m => m.commander === commander).slice(0, 16).reverse();

    if (list.length === 0) {
      ctx.fillStyle = '#b0bec5';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Brak rozegranych meczów dla tego dowódcy. Rozpocznij grę!', w / 2, h / 2);
      return;
    }

    // Grid lines
    ctx.strokeStyle = '#2d3e46';
    ctx.lineWidth = 1;
    for (let y = 30; y < h - 25; y += 30) {
      ctx.beginPath();
      ctx.moveTo(35, y);
      ctx.lineTo(w - 15, y);
      ctx.stroke();
    }

    const barWidth = Math.min(28, (w - 70) / list.length);
    const gap = 8;
    const startX = 40;

    // 1. Draw Outcome Bars (Green = Win, Red = Loss) with Moves Count above
    list.forEach((m, idx) => {
      const x = startX + idx * (barWidth + gap);
      const moves = m.moves || 0;
      const barH = m.won ? Math.min(105, 55 + Math.min(moves, 40)) : Math.min(85, 35 + Math.min(moves, 30));
      const y = h - 32 - barH;

      // Bar gradient fill
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      if (m.won) {
        grad.addColorStop(0, '#66bb6a');
        grad.addColorStop(1, '#2e7d32');
      } else {
        grad.addColorStop(0, '#ef5350');
        grad.addColorStop(1, '#c62828');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);
      ctx.strokeStyle = m.won ? '#81c784' : '#e57373';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barH);

      // Label: Outcome & Moves count ("W 14r" / "L 8r") above bar
      ctx.fillStyle = m.won ? '#a5d6a7' : '#ffab91';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      const labelOutcome = m.won ? `🏆 ${moves}r` : `💥 ${moves}r`;
      ctx.fillText(labelOutcome, x + barWidth / 2, y - 6);

      // Label: Match number / time below bar
      ctx.fillStyle = '#90a4ae';
      ctx.font = '9px sans-serif';
      ctx.fillText(`#${idx + 1}`, x + barWidth / 2, h - 18);
      ctx.fillStyle = '#78909c';
      ctx.font = '8px sans-serif';
      ctx.fillText(m.date || '', x + barWidth / 2, h - 6);
    });

    // 2. Draw Yellow Blunders Trend Curve ("Krzywa skuch")
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    list.forEach((m, idx) => {
      const x = startX + idx * (barWidth + gap) + barWidth / 2;
      const blundersNorm = Math.min(80, (m.blunders || 0) * 20);
      const y = (h - 40) - blundersNorm;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw yellow dots for blunders
    list.forEach((m, idx) => {
      const x = startX + idx * (barWidth + gap) + barWidth / 2;
      const blundersNorm = Math.min(80, (m.blunders || 0) * 20);
      const y = (h - 40) - blundersNorm;
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Compute Career Stats
    const total = list.length;
    const wins = list.filter(m => m.won).length;
    const winrate = ((wins / total) * 100).toFixed(1);
    const avgBlunders = (list.reduce((acc, m) => acc + (m.blunders || 0), 0) / total).toFixed(1);

    const totalEl = document.getElementById('statTotalMatches');
    const winrateEl = document.getElementById('statWinrate');
    const avgEl = document.getElementById('statAvgBlunders');
    if (totalEl) totalEl.textContent = total.toString();
    if (winrateEl) winrateEl.textContent = `${winrate}%`;
    if (avgEl) avgEl.textContent = avgBlunders.toString();

    // Streak Calculation
    let streak = 0;
    for (let i = 0; i < this.matchHistory.length; i++) {
      if (this.matchHistory[i].won) streak++;
      else break;
    }
    const streakBadge = document.getElementById('currentStreakBadge');
    if (streakBadge) streakBadge.innerHTML = streak > 0 ? `🔥 Pasmo: <b>${streak} zwycięstw z rzędu</b>` : `❄️ Pasmo: <b>Przerwana seria</b>`;

    // Populate Recent Matches Log Table
    const tbody = document.getElementById('recentMatchesBody');
    if (tbody) {
      tbody.innerHTML = list.slice().reverse().map(m => `
        <tr>
          <td>${m.date || '--:--'}</td>
          <td><b>${m.mode || 'Nowy Świat'}</b> (Poz. ${m.level || 1})</td>
          <td><span style="color: ${m.won ? '#2e7d32' : '#c62828'}; font-weight: bold;">${m.won ? '🏆 Wygrana' : '💥 Porażka'}</span></td>
          <td><b>${m.moves || 0} ruchów</b></td>
          <td>${m.time || '00:00'}</td>
          <td><span style="color: #c62828; font-weight: bold;">${m.blunders || 0}</span></td>
          <td><b>${m.gold || 0} 💰</b></td>
        </tr>
      `).join('');
    }
  }

  // --- Setup UI Handlers (Safe Check on All DOM Elements) ---
  setupUI() {
    const bindClick = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    // Quick Language Selector
    const quickLang = document.getElementById('quickLangSelect');
    if (quickLang) {
      quickLang.value = getLang();
      quickLang.addEventListener('change', (e) => {
        setLang(e.target.value);
        this.updateUI();
      });
    }

    // Quick Difficulty Selector (Beginner / Intermediate / Expert)
    const quickDiff = document.getElementById('quickDifficultySelect');
    if (quickDiff) {
      quickDiff.value = this.difficulty || 'intermediate';
      quickDiff.addEventListener('change', (e) => {
        this.difficulty = e.target.value;
        localStorage.setItem('ks_difficulty', this.difficulty);
        this.startLevel(this.mode, 1);
        this.notify(`Zmieniono poziom trudności na: ${e.target.options[e.target.selectedIndex].text}`, '🎯');
      });
    }

    // Tutorial Reset Buttons
    bindClick('btnResetTutorial', () => this.resetTutorial());
    bindClick('btnHelpResetTutorial', () => this.resetTutorial());

    // Sound Toggle Button in Header
    bindClick('btnSoundHeader', () => {
      sfx.muted = !sfx.muted;
      const btn = document.getElementById('btnSoundHeader');
      if (btn) btn.textContent = sfx.muted ? '🔇' : '🔊';
    });

    // Dual-Engine Switcher
    bindClick('btnEngineSwitch', () => {
      this.toggleDualEngine();
    });
    bindClick('menuModeSwitch', () => {
      this.toggleDualEngine();
    });

    // Quick recruit sapper
    bindClick('btnQuickRecruitSapper', () => this.recruitSapper());

    // Action Bar Buttons
    bindClick('btnCenterMap', () => this.centerCamera());
    bindClick('btnToggleFlagMode', () => {
      this.flagMode = !this.flagMode;
      const flagLabel = document.getElementById('flagModeLabel');
      if (flagLabel) flagLabel.textContent = this.flagMode ? 'Flaga (ON)' : 'Flaga';
    });

    // Palettes Toggle
    const buildPalette = document.getElementById('buildPalette');
    const powersPalette = document.getElementById('powersPalette');

    bindClick('btnBuildToggle', () => {
      if (!buildPalette) return;
      const show = buildPalette.style.display !== 'flex';
      buildPalette.style.display = show ? 'flex' : 'none';
      if (powersPalette) powersPalette.style.display = 'none';
    });

    bindClick('btnClosePalette', () => {
      if (buildPalette) buildPalette.style.display = 'none';
      this.selectedBuildingType = null;
    });

    bindClick('btnPowersToggle', () => {
      if (!powersPalette) return;
      const show = powersPalette.style.display !== 'flex';
      powersPalette.style.display = show ? 'flex' : 'none';
      if (buildPalette) buildPalette.style.display = 'none';
    });

    bindClick('btnClosePowers', () => {
      if (powersPalette) powersPalette.style.display = 'none';
      this.activePower = null;
    });

    // Modals Open Buttons
    bindClick('menuTrade', () => this.openTradeModal());
    bindClick('btnTradeToggle', () => this.openTradeModal());
    bindClick('btnLeftTrade', () => this.openTradeModal());

    bindClick('menuSuperhero', () => this.openSuperheroModal());
    bindClick('btnHeroToggle', () => this.openSuperheroModal());
    bindClick('btnLeftSuperhero', () => this.openSuperheroModal());
    bindClick('heroBadge', () => this.openSuperheroModal());

    bindClick('menuLeaderboard', () => this.openLeaderboardModal());
    bindClick('btnStatsToggle', () => this.openLeaderboardModal());
    bindClick('btnLeftStats', () => this.openLeaderboardModal());

    bindClick('menuResearch', () => this.openResearchModal());
    bindClick('btnLeftResearch', () => this.openResearchModal());

    bindClick('menuPlay', () => this.startLevel(this.mode, this.level));
    bindClick('menuSettings', () => this.openSettingsModal());
    bindClick('btnHelpToggle', () => this.openHelpModal());
    bindClick('menuHelp', () => this.openHelpModal());

    bindClick('btnLeftGridToggle', () => {
      this.showGrid = !this.showGrid;
    });

    // Commander Profile Modal & 8 Avatars
    bindClick('btnCommanderProfile', () => {
      const modal = document.getElementById('modalCommanderProfile');
      if (!modal) return;
      const nameInput = document.getElementById('inputCommanderName');
      if (nameInput) nameInput.value = this.commanderName;
      document.querySelectorAll('.avatar-card').forEach(card => {
        card.classList.toggle('active', card.dataset.avatar === this.commanderAvatar);
      });
      modal.style.display = 'flex';
    });

    document.querySelectorAll('.avatar-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const nameInput = document.getElementById('inputCommanderName');
        if (nameInput && card.dataset.name) {
          nameInput.value = card.dataset.name;
        }
      });
    });

    bindClick('btnSaveCommanderProfile', () => {
      const nameInput = document.getElementById('inputCommanderName');
      const activeCard = document.querySelector('.avatar-card.active');
      if (nameInput && nameInput.value.trim()) {
        this.commanderName = nameInput.value.trim();
        localStorage.setItem('ks_commander_name', this.commanderName);
      }
      if (activeCard && activeCard.dataset.avatar) {
        this.commanderAvatar = activeCard.dataset.avatar;
        localStorage.setItem('ks_commander_avatar', this.commanderAvatar);
      }
      this.updateCommanderDisplay();
      const modal = document.getElementById('modalCommanderProfile');
      if (modal) modal.style.display = 'none';
      this.notify(`👑 Dowódca zaktualizowany: ${this.commanderAvatar} ${this.commanderName}!`, '👑');
    });

    // Mission Restart with Confirmation
    const restartMissionFn = () => {
      if (confirm('🔄 Czy na pewno chcesz zresetować obecną planszę od nowa?')) {
        this.startLevel(this.mode, this.level);
        this.notify('🔄 Plansza zresetowana. Misja rozpoczęta od nowa!', '🔄');
      }
    };
    bindClick('menuRestartMission', restartMissionFn);
    bindClick('btnRestartMissionAction', restartMissionFn);

    // Legend Minimization Toggle
    const btnLegendToggle = document.getElementById('btnToggleLegendDetails');
    const legendList = document.getElementById('legendContentList');
    if (btnLegendToggle && legendList) {
      btnLegendToggle.addEventListener('click', () => {
        const isHidden = legendList.style.display === 'none';
        legendList.style.display = isHidden ? 'flex' : 'none';
        btnLegendToggle.textContent = isHidden ? '▼' : '▲';
      });
    }

    // Build Cards Palette Click Handling
    document.querySelectorAll('.build-card').forEach(card => {
      card.addEventListener('click', () => {
        const type = card.dataset.build;
        if (this.selectedBuildingType === type) {
          this.selectedBuildingType = null;
          card.classList.remove('active');
          this.notify('Anulowano tryb budowy.', '❌');
        } else {
          document.querySelectorAll('.build-card').forEach(c => c.classList.remove('active'));
          this.selectedBuildingType = type;
          card.classList.add('active');
          const cost = this.buildingCosts[type] || 50;
          this.notify(`🔨 Wybierz odkryte pole pod budowę: ${card.querySelector('b')?.textContent || type} (${cost} 💰)`, '🔨');
        }
      });
    });

    // Version Changelog Expand Toggle
    const verText = document.getElementById('settingsVersionText');
    const featList = document.getElementById('settingsFeaturesList');
    if (verText && featList) {
      verText.addEventListener('click', () => {
        const isCollapsed = featList.style.maxHeight === '0px' || featList.style.display === 'none';
        featList.style.display = isCollapsed ? 'block' : 'none';
        featList.style.maxHeight = isCollapsed ? '160px' : '0px';
      });
    }

    // Settings Number Font & Tile Frame Selectors
    const numFontSel = document.getElementById('settingNumberFontSelect');
    if (numFontSel) {
      numFontSel.value = this.numberFont;
      numFontSel.addEventListener('change', (e) => {
        this.numberFont = e.target.value;
        localStorage.setItem('ks_number_font', this.numberFont);
      });
    }

    const tileFrameSel = document.getElementById('settingTileFrameSelect');
    if (tileFrameSel) {
      tileFrameSel.value = this.tileFrame;
      tileFrameSel.addEventListener('change', (e) => {
        this.tileFrame = e.target.value;
        localStorage.setItem('ks_tile_frame', this.tileFrame);
      });
    }

    const quickContSel = document.getElementById('quickContinentSelect');
    if (quickContSel) {
      quickContSel.value = this.selectedContinent;
      quickContSel.addEventListener('change', (e) => {
        this.selectedContinent = e.target.value;
        localStorage.setItem('ks_continent', this.selectedContinent);
        this.startLevel(this.mode, 1);
      });
    }

    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      });
    });

    // Settings Dropdowns Handlers
    const themeSel = document.getElementById('settingThemeSelect');
    if (themeSel) {
      themeSel.addEventListener('change', (e) => {
        document.body.className = document.body.className.replace(/theme-\w+/g, '') + ` theme-${e.target.value}`;
        localStorage.setItem('ks_theme', e.target.value);
      });
    }

    const fontSel = document.getElementById('settingFontSelect');
    if (fontSel) {
      fontSel.addEventListener('change', (e) => {
        document.body.className = document.body.className.replace(/font-\w+/g, '') + ` font-${e.target.value.toLowerCase()}`;
        localStorage.setItem('ks_font', e.target.value.toLowerCase());
      });
    }

    const cursorSel = document.getElementById('settingCursorSelect');
    if (cursorSel) {
      cursorSel.addEventListener('change', (e) => {
        document.body.className = document.body.className.replace(/cursor-\w+/g, '') + ` cursor-${e.target.value}`;
        localStorage.setItem('ks_cursor', e.target.value);
      });
    }

    // Superhero Reroll
    bindClick('btnRerollHeroPerk', () => {
      const rand = this.heroPerks[Math.floor(Math.random() * this.heroPerks.length)];
      this.activeHeroPerk = rand.id;
      localStorage.setItem('ks_hero_perk', this.activeHeroPerk);
      this.renderSuperheroGrid();
      this.updateUI();
    });

    // Profile Selector in Leaderboard
    const profileSel = document.getElementById('playerProfileSelect');
    if (profileSel) {
      profileSel.value = this.activeCommander;
      profileSel.addEventListener('change', (e) => {
        this.activeCommander = e.target.value;
        localStorage.setItem('ks_commander', this.activeCommander);
        this.renderMatchHistoryChart(this.activeCommander);
      });
    }

    // Window Controls (Maximize / Fullscreen, Minimize)
    bindClick('btnMaximize', () => {
      const win = document.getElementById('appWindow');
      if (win) {
        win.classList.toggle('fullscreen');
        this.resizeCanvas();
        this.centerCamera();
      }
    });

    bindClick('btnMinimize', () => {
      this.notify('Keepsweeper: Okno zminimalizowane. Kliknij ponownie, aby powrócić.', '🗕');
    });

    bindClick('btnCloseApp', () => {
      this.notify('🏰 Keepsweeper: Sesja aktywna w przeglądarce.', '🏰');
    });

    bindClick('btnClearHistory', () => {
      if (confirm('Czy na pewno chcesz wyczyścić historię ostatnich meczów?')) {
        this.matchHistory = [];
        localStorage.removeItem('ks_match_history');
        this.renderMatchHistoryChart(this.activeCommander);
        this.notify('Wyczyszczono historię meczów dowódcy.', '🗑️');
      }
    });

    // Left Civ Sidebar Shortcuts
    bindClick('btnLeftWorld', () => this.centerCamera());
    bindClick('btnLeftQuests', () => {
      const qm = document.getElementById('modalQuests');
      if (qm) qm.style.display = 'flex';
    });
    bindClick('btnLeftSettlements', () => {
      this.notify(`Twój rozwój: ${document.getElementById('settlementName')?.textContent || 'Obóz'} (Odkryto: ${this.uncoveredCount} pól)`, '🏘️');
    });

    bindClick('btnEndgameShowStats', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      this.openLeaderboardModal();
    });

    bindClick('btnEndgameAction', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      this.startLevel(this.mode, this.level + 1);
    });
  }

  toggleDualEngine() {
    this.engineMode = this.engineMode === 'colonization' ? 'classic' : 'colonization';
    localStorage.setItem('ks_engine', this.engineMode);

    const icon = document.getElementById('engineBadgeIcon');
    const text = document.getElementById('engineBadgeText');
    const smileyBar = document.getElementById('classicSmileyBar');

    if (this.engineMode === 'classic') {
      if (icon) icon.textContent = '🕹️';
      if (text) text.textContent = 'Silnik: Klasyczny Saper Win95';
      if (smileyBar) smileyBar.style.display = 'flex';
      this.notify('Przełączono na Klasyczny Saper Windows 95!', '🕹️');
    } else {
      if (icon) icon.textContent = '🌲';
      if (text) text.textContent = 'Silnik: Kolonizacja (Civ)';
      if (smileyBar) smileyBar.style.display = 'none';
      this.notify('Przełączono na Silnik Kolonizacji i Cywilizacji!', '🌲');
    }

    this.startLevel(this.mode, this.level);
  }

  recruitSapper() {
    const cost = 40;
    if (this.resources < cost) {
      this.notify(`Brak zasobów na rekrutację (wymagane: ${cost} 💰)`, '💰');
      return;
    }
    if (this.sappers >= this.sappersMax) {
      this.notify('Osiągnięto limit korpusu saperskiego!', '⛑️');
      return;
    }

    this.resources -= cost;
    this.sappers++;
    const kx = this.playerStart ? this.playerStart.x : Math.floor(this.gridWidth / 2);
    const ky = this.playerStart ? this.playerStart.y : Math.floor(this.gridHeight / 2);

    this.sappersList.push({
      id: Date.now(),
      name: `Saper Weteran #${this.sappers}`,
      x: kx * this.tileSize + 10,
      y: ky * this.tileSize + 10,
      targetX: kx * this.tileSize,
      targetY: ky * this.tileSize,
      state: 'idle',
      digTile: null,
      facing: 1,
      walkAnim: 0
    });

    sfx.playRecruit();
    this.notify(`Zwerbowano nowego Sapera! (Koszt: ${cost} 💰)`, '⛑️');
    this.updateUI();
  }

  // --- Modals Renderers ---
  openTradeModal() {
    const modal = document.getElementById('modalTrade');
    if (!modal) return;
    const grid = document.getElementById('tradeDealsGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="trade-card">
          <div class="trade-title">👑 Królewskie Pieczęcie</div>
          <div class="trade-rate">Wymień 100 💰 na 2 👑 Pieczęcie</div>
          <button class="action-btn" onclick="game.executeTrade('seals')">Wymień (100 💰)</button>
        </div>
        <div class="trade-card">
          <div class="trade-title">⛑️ Kontrakt Saperski</div>
          <div class="trade-rate">Zaciąg 2 Elitarnych Saperów Królewskich</div>
          <button class="action-btn" onclick="game.executeTrade('sappers')">Zaciąg (70 💰)</button>
        </div>
        <div class="trade-card">
          <div class="trade-title">🏛️ Cud Świata z Importu</div>
          <div class="trade-rate">Kup natychmiastowe odkrycie 4 bezpiecznych pól</div>
          <button class="action-btn" onclick="game.executeTrade('vision')">Zakup (50 💰)</button>
        </div>
        <div class="trade-card">
          <div class="trade-title">🛡️ Importowany Pancerz</div>
          <div class="trade-rate">Ładunek Pancerza Ochronnego na skuchę</div>
          <button class="action-btn" onclick="game.executeTrade('armor')">Zakup (60 💰)</button>
        </div>
      `;
    }
    modal.style.display = 'flex';
  }

  executeTrade(type) {
    if (type === 'seals') {
      if (this.resources < 100) { this.notify('Brak złota na pieczęcie!', '💰'); return; }
      this.resources -= 100;
      this.royalSeals += 2;
      localStorage.setItem('ks_seals', this.royalSeals);
      this.notify('Zakupiono 2 Królewskie Pieczęcie!', '👑');
    } else if (type === 'sappers') {
      if (this.resources < 70) { this.notify('Brak złota na saperów!', '💰'); return; }
      this.resources -= 70;
      this.sappers = Math.min(this.sappersMax, this.sappers + 2);
      this.notify('Zaciągnięto 2 Saperów!', '⛑️');
    } else if (type === 'vision') {
      if (this.resources < 50) { this.notify('Brak złota!', '💰'); return; }
      this.resources -= 50;
      for (let i = 0; i < 4; i++) this.autoRevealRandomSafeTile();
    } else if (type === 'armor') {
      if (this.resources < 60) { this.notify('Brak złota!', '💰'); return; }
      this.resources -= 60;
      this.hasBlastShield = true;
      this.notify('Założono Pancerz Ochronny!', '🛡️');
    }
    this.updateUI();
  }

  openSuperheroModal() {
    const modal = document.getElementById('modalSuperhero');
    if (!modal) return;
    this.renderSuperheroGrid();
    modal.style.display = 'flex';
  }

  renderSuperheroGrid() {
    const grid = document.getElementById('heroPerksGrid');
    if (!grid) return;
    grid.innerHTML = this.heroPerks.map(p => `
      <div class="hero-perk-card ${p.id === this.activeHeroPerk ? 'active' : ''}" onclick="game.selectHeroPerk('${p.id}')">
        <div class="perk-header">
          <span style="font-size: 18px;">${p.icon}</span>
          <b>${p.name}</b>
        </div>
        <div class="perk-desc">${p.desc}</div>
      </div>
    `).join('');
  }

  selectHeroPerk(id) {
    this.activeHeroPerk = id;
    localStorage.setItem('ks_hero_perk', id);
    this.renderSuperheroGrid();
    this.updateUI();
    this.notify(`Wybrano talent: ${this.heroPerks.find(x => x.id === id).name}!`, '⚡');
  }

  openLeaderboardModal() {
    const modal = document.getElementById('modalLeaderboard');
    if (!modal) return;
    modal.style.display = 'flex';
    this.renderMatchHistoryChart(this.activeCommander);
  }

  openSettingsModal() {
    const modal = document.getElementById('modalSettings');
    if (modal) modal.style.display = 'flex';
  }

  openHelpModal() {
    const modal = document.getElementById('modalHelp');
    if (modal) modal.style.display = 'flex';
  }

  openResearchModal() {
    const modal = document.getElementById('modalResearch');
    if (modal) modal.style.display = 'flex';
  }

  applySavedSettings() {
    const theme = localStorage.getItem('ks_theme') || 'colonization';
    const font = localStorage.getItem('ks_font') || 'montserrat';
    const cursor = localStorage.getItem('ks_cursor') || 'sword';
    const diff = localStorage.getItem('ks_difficulty') || 'intermediate';
    this.difficulty = diff;

    document.body.className = `theme-${theme} font-${font} cursor-${cursor}`;

    const themeSel = document.getElementById('settingThemeSelect');
    if (themeSel) themeSel.value = theme;

    const fontSel = document.getElementById('settingFontSelect');
    if (fontSel) fontSel.value = font.charAt(0).toUpperCase() + font.slice(1);

    const cursorSel = document.getElementById('settingCursorSelect');
    if (cursorSel) cursorSel.value = cursor;

    const diffSel = document.getElementById('quickDifficultySelect');
    if (diffSel) diffSel.value = diff;
  }

  notify(msg, icon = '📢') {
    const ticker = document.getElementById('eventTicker');
    const tIcon = document.getElementById('tickerIcon');
    const tText = document.getElementById('tickerText');
    if (ticker && tText) {
      if (tIcon) tIcon.textContent = icon;
      tText.textContent = msg;
      ticker.style.display = 'flex';
    }
  }

  getModeNameKey() {
    if (this.mode === 'dragon') return 'questDragonHunt';
    if (this.mode === 'reclaim') return 'questReclaimRealm';
    if (this.mode === 'treasury') return 'questRoyalTreasury';
    return 'questRivalKingdoms';
  }

  async fetchVersionInfo() {
    try {
      const res = await fetch(`version.json?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const badge = document.getElementById('appVersionBadge');
        if (badge && data.version) badge.textContent = `v${data.version}`;
      }
    } catch (e) {
      // offline fallback
    }
  }
}

// Global game instance initialization
let game = null;
window.addEventListener('DOMContentLoaded', () => {
  game = new KeepsweeperGame();
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (!game) game = new KeepsweeperGame();
}
