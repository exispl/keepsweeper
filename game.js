// Keepsweeper - Dual Engine Game System
// Engine 1: Sid Meier's Colonization & Civilization Continental Realm
// Engine 2: Pure Classic Windows 95 Minesweeper (Saper)

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

    // Session State
    this.mode = 'dragon';
    this.level = 1;
    this.gridWidth = 28;
    this.gridHeight = 22;
    this.tileSize = 40;

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
    this.resizeCanvas();
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.centerCamera();
    });

    this.bindEvents();
    this.setupUI();
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

  // --- Procedural Continental Landmass Generation ---
  generateContinentalMap() {
    this.grid = [];
    const cx = this.gridWidth / 2;
    const cy = this.gridHeight / 2;
    const maxRadius = Math.min(cx, cy) * 0.88;

    for (let y = 0; y < this.gridHeight; y++) {
      const row = [];
      for (let x = 0; x < this.gridWidth; x++) {
        // Distance-based continental island with organic harmonic bays and peninsulas
        const dx = (x - cx) / cx;
        const dy = (y - cy) / cy;
        const dist = Math.hypot(dx * 1.2, dy * 1.0);

        // Organic coastline disturbance
        const angle = Math.atan2(dy, dx);
        const noise = Math.sin(angle * 3.5 + 1.2) * 0.18 + Math.cos(angle * 6.0) * 0.12 + Math.sin(x * 0.7) * Math.cos(y * 0.7) * 0.15;
        const continentalEdge = 0.78 + noise;

        let terrain = 'water';
        if (dist < continentalEdge) {
          // Inside the continent
          const lakeNoise = Math.sin(x * 1.4) * Math.cos(y * 1.4);
          const treeNoise = Math.cos(x * 0.8 + y * 0.6);

          if (lakeNoise > 0.68 && dist < 0.5) {
            terrain = 'lake';
          } else if (treeNoise > 0.3) {
            terrain = 'trees';
          } else {
            terrain = 'grass';
          }
        } else if (dist < continentalEdge + 0.12) {
          terrain = 'sea'; // Coastal water
        } else {
          terrain = 'water'; // Deep ocean
        }

        row.push({
          x, y,
          covered: true,
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

    // Coastal Expedition Landing: find a coastal grass/trees tile on the southern/eastern shore
    let kx = Math.floor(cx);
    let ky = Math.floor(cy + maxRadius * 0.45);
    // Find closest land tile bordering water
    for (let y = this.gridHeight - 4; y >= 4; y--) {
      for (let x = 6; x < this.gridWidth - 6; x++) {
        if (this.grid[y][x].terrain === 'grass' || this.grid[y][x].terrain === 'trees') {
          // Check if it borders sea/water
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
      if (kx !== Math.floor(cx)) break;
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

    // Initial safe beachhead around starting camp
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

    // Place Initial Entities
    this.workers = [
      { x: kx * this.tileSize + 8, y: ky * this.tileSize + 8, targetX: kx * this.tileSize, targetY: ky * this.tileSize, facing: 1, walkAnim: 0 },
      { x: kx * this.tileSize + 20, y: ky * this.tileSize + 16, targetX: kx * this.tileSize, targetY: ky * this.tileSize, facing: 1, walkAnim: 0 },
      { x: kx * this.tileSize + 14, y: ky * this.tileSize + 24, targetX: kx * this.tileSize, targetY: ky * this.tileSize, facing: 1, walkAnim: 0 }
    ];

    this.sappersList = [];
    for (let i = 0; i < this.sappers; i++) {
      this.sappersList.push({
        id: i + 1,
        name: i === 0 ? 'Saper Jan' : (i === 1 ? 'Saper Wilhelm' : 'Saper Tomasz'),
        x: kx * this.tileSize + 10 + i * 8,
        y: ky * this.tileSize + 10,
        targetX: kx * this.tileSize,
        targetY: ky * this.tileSize,
        state: 'idle', // 'idle', 'walking_to_dig', 'digging'
        digTile: null,
        facing: 1,
        walkAnim: 0
      });
    }

    // Volcanic Dragon Caves in deep mountains/forests
    const caveCount = Math.max(1, Math.min(3, Math.floor(this.level / 2)));
    for (let c = 0; c < caveCount; c++) {
      let placed = false;
      while (!placed) {
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

    // Native Tribal Wigwams (Civ 1 style villages)
    const wigwamCount = Math.max(2, Math.floor(this.level / 2));
    for (let w = 0; w < wigwamCount; w++) {
      let placed = false;
      while (!placed) {
        const rx = Math.floor(Math.random() * this.gridWidth);
        const ry = Math.floor(Math.random() * this.gridHeight);
        const dist = Math.hypot(rx - kx, ry - ky);
        const t = this.grid[ry][rx];
        if (dist > 4 && t.terrain === 'grass' && t.covered && !t.danger) {
          t.dangerType = 'wigwam';
          placed = true;
        }
      }
    }

    // Hidden Gold Chests & Relics
    const chestCount = Math.max(3, Math.floor(this.level * 1.5)) * (this.activeHeroPerk === 'prospector' ? 2 : 1);
    for (let ch = 0; ch < chestCount; ch++) {
      let placed = false;
      while (!placed) {
        const rx = Math.floor(Math.random() * this.gridWidth);
        const ry = Math.floor(Math.random() * this.gridHeight);
        const t = this.grid[ry][rx];
        if ((t.terrain === 'grass' || t.terrain === 'trees') && t.covered && !t.danger && !t.dangerType) {
          t.dangerType = 'chest';
          placed = true;
        }
      }
    }

    // Goblin Portals
    const portalCount = Math.min(3, 1 + Math.floor(this.level / 3));
    for (let p = 0; p < portalCount; p++) {
      let placed = false;
      while (!placed) {
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

    // Mines & Traps Quota
    const dangerDensity = 0.13 + (this.level * 0.005);
    const totalLandTiles = this.grid.flat().filter(t => t.terrain !== 'water' && t.terrain !== 'sea').length;
    let mineQuota = Math.floor(totalLandTiles * dangerDensity);

    while (mineQuota > 0) {
      const rx = Math.floor(Math.random() * this.gridWidth);
      const ry = Math.floor(Math.random() * this.gridHeight);
      const dist = Math.hypot(rx - kx, ry - ky);
      const t = this.grid[ry][rx];
      if (dist > 2.5 && t.covered && (t.terrain === 'grass' || t.terrain === 'trees') && !t.danger && !t.dangerType) {
        t.danger = true;
        t.dangerType = 'mine';
        mineQuota--;
      }
    }

    // Position AI Rivals on opposing continental shores
    this.aiRivals.spain.x = Math.max(2, kx - 14);
    this.aiRivals.spain.y = Math.max(2, ky - 10);
    this.aiRivals.france.x = Math.min(this.gridWidth - 3, kx + 12);
    this.aiRivals.france.y = Math.max(2, ky - 8);

    this.recalculateAdjacentNumbers();
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
    this.elapsedSeconds = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.blundersCount = 0;
    this.uncoveredCount = 0;
    this.hasBlastShield = (this.activeHeroPerk === 'iron_skin');
    this.activePower = null;
    this.digQueue = [];

    this.sappersMax = this.techsUnlocked.includes('resSapperAcademy') ? 5 : 3;
    this.sappers = this.sappersMax;
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

    // 1x PPM Reliable Right-Click (no accidental dragging)
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handlePointerDown(e.clientX, e.clientY, 2);
    });

    // Zoom on wheel
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      this.setZoom(this.zoom * zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Interactive Minimap Pan & Drag
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

    // 1x Right-Click or Touch Flag Mode: Instantly Toggles Flag
    if (button === 2 || (button === 0 && this.flagMode)) {
      if (tile.covered) {
        tile.flagged = !tile.flagged;
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
      nearestSapper.targetX = targetPx + 8;
      nearestSapper.targetY = targetPy + 8;

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
    this.createDirtSparks(tx * this.tileSize + 20, ty * this.tileSize + 20);

    // Check Lucky Dud Hero Perk (3% chance mine is a dud)
    if (tile.danger && tile.dangerType === 'mine' && this.activeHeroPerk === 'lucky_dud' && Math.random() < 0.03) {
      tile.danger = false;
      this.notify('🍀 Szczęście Sapera: Mina okazała się niewybuchem!', '🍀');
    }

    // Check if hazard / mine exploded under sapper's feet!
    if (tile.danger) {
      this.handleHazardDetonationUnderSapper(sapper, tx, ty);
    } else {
      // Safe reveal
      this.uncoverSafeTile(tx, ty);
      sapper.state = 'idle';
      this.updateActiveUnitCard(sapper, 'Czuwa / Gotowy');
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
    tile.covered = false;
    this.uncoveredCount++;

    // Resources increase for revealed tiles!
    const midasBonus = this.activeHeroPerk === 'midas_touch' ? 1.5 : 1.0;
    const goldEarned = Math.round(2 * midasBonus);
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
    } else if (tile.dangerType === 'wigwam') {
      // Civ 1 Native Tribal Village Contact
      sfx.playVictory();
      this.resources += 80;
      this.royalSeals += 2;
      localStorage.setItem('ks_seals', this.royalSeals);
      this.notify('🏕️ Wioska Indian! Starszyzna ofiarowała: +80 💰 i +2 👑 Pieczęcie!', '🏕️');
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
            if (nTile.covered && !nTile.flagged && !nTile.oracleFlag && !nTile.danger) {
              nTile.covered = false;
              this.uncoveredCount++;
              this.resources += 1;
              if (nTile.adjacentDangers === 0) queue.push([nx, ny]);
            }
          }
        }
      }
    }
  }

  chordTile(tx, ty) {
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

    if (coordsTag) coordsTag.textContent = `${tx} x ${ty}`;

    let terrainName = 'Równiny Kolonii';
    let icon = '🌾';
    let dangerText = 'Teren bezpieczny';
    let bonuses = ['💰 Złoto: +2', '🌾 Żywność: +2'];

    if (tile.terrain === 'trees') {
      terrainName = 'Gęsty Las Sosnowy';
      icon = '🌲';
      bonuses = ['🌲 Drewno: +2', '💰 Złoto: +1', '🛡️ Obrona: +25%'];
    } else if (tile.terrain === 'water' || tile.terrain === 'sea') {
      terrainName = 'Szlak Morski / Wybrzeże';
      icon = '🌊';
      bonuses = ['🐟 Połów Ryb: +3', '🚢 Transport Morski'];
    } else if (tile.terrain === 'lake') {
      terrainName = 'Jezioro Śródlądowe';
      icon = '💧';
      bonuses = ['🐟 Słodka Woda: +2', '🌾 Nawodnienie: +2'];
    }

    if (tile.covered) {
      dangerText = tile.flagged ? '🚩 Oflagowane (podejrzenie miny)' : '❓ Niezbadany ląd (Zagrożenie: 0-3 miny)';
    } else {
      dangerText = tile.adjacentDangers > 0 ? `⚠️ Zagrożenie: ${tile.adjacentDangers} sąsiednie miny` : '✅ Teren oczyszczony';
    }

    if (tile.building) {
      terrainName = `Osada: ${tile.building.type.toUpperCase()}`;
      icon = '🏰';
      bonuses.push('👷 Dochód Kolonialny');
    }

    if (nameEl) nameEl.textContent = terrainName;
    if (iconEl) iconEl.textContent = icon;
    if (dangerEl) dangerEl.textContent = dangerText;

    if (bonusList) {
      bonusList.innerHTML = bonuses.map(b => `<div class="bonus-pill">${b}</div>`).join('');
    }
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

    // Cooldown reductions
    Object.keys(this.powerCooldowns).forEach(k => {
      if (this.powerCooldowns[k] > 0) this.powerCooldowns[k]--;
    });

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
    // Sapper movement to dig site
    const speed = (this.activeHeroPerk === 'hermes_boots' ? 140 : 80);

    this.sappersList.forEach(s => {
      if (s.state === 'walking_to_dig' && s.digTile) {
        const dx = s.targetX - s.x;
        const dy = s.targetY - s.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 4) {
          s.x += (dx / dist) * speed * dt;
          s.y += (dy / dist) * speed * dt;
          s.walkAnim = (s.walkAnim || 0) + dt * 10;
          s.facing = dx < 0 ? -1 : 1;
        } else {
          // Arrived! Dig now!
          s.state = 'digging';
          this.executeSapperDigAt(s, s.digTile.tx, s.digTile.ty);
        }
      }
    });

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

          // Show targeted dig marker
          if (tile.digOrdered) {
            this.ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
            this.ctx.font = '14px sans-serif';
            this.ctx.fillText('⛏️', px + 12, py + 24);
          }
        } else {
          // Uncovered Tile
          if (tile.crater) {
            this.ctx.drawImage(Sprites.cache.crater, px, py);
          } else if (tile.terrain === 'water' || tile.terrain === 'sea') {
            this.ctx.drawImage(tile.terrain === 'sea' ? Sprites.cache.sea : Sprites.cache.water, px, py);
          } else if (tile.terrain === 'lake') {
            this.ctx.drawImage(Sprites.cache.lake, px, py);
          } else if (tile.terrain === 'trees') {
            this.ctx.drawImage(Sprites.cache.trees, px, py);
          } else {
            this.ctx.drawImage(this.engineMode === 'classic' ? Sprites.cache.classic_revealed : Sprites.cache.grass, px, py);
          }

          // Special Features
          if (tile.dangerType === 'dragon_nest') {
            this.ctx.drawImage(Sprites.cache.dragon_cave, px, py);
          } else if (tile.dangerType === 'chest') {
            this.ctx.drawImage(Sprites.cache.chest, px, py);
          } else if (tile.dangerType === 'wigwam') {
            this.ctx.drawImage(Sprites.cache.wigwam, px, py);
          }

          // Buildings & Settlements
          if (tile.building) {
            if (tile.building.type === 'keep') {
              // Evolving settlement sprite based on tier
              const tierSprite = this.uncoveredCount >= 65 ? Sprites.cache.settlement_citadel :
                                (this.uncoveredCount >= 35 ? Sprites.cache.settlement_township :
                                (this.uncoveredCount >= 15 ? Sprites.cache.settlement_hamlet : Sprites.cache.settlement_camp));
              this.ctx.drawImage(tierSprite, px, py);
            } else {
              const bSprite = Sprites.cache[tile.building.type];
              if (bSprite) this.ctx.drawImage(bSprite, px, py);
            }
          } else if (tile.adjacentDangers > 0 && !tile.danger && !tile.crater) {
            // Render Minesweeper Number with Exact Original Colors
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

    // Floating text indicators
    this.floatingTexts.forEach(ft => {
      this.ctx.font = 'bold 12px "Montserrat", sans-serif';
      this.ctx.fillStyle = ft.color;
      this.ctx.shadowColor = '#000';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.shadowBlur = 0;
    });

    this.ctx.restore();
  }

  // Exact Original Windows 95 Saper Colors
  renderMinesweeperNumber(num, px, py) {
    const classicColors = [
      '',
      '#0000ff', // 1: Pure Blue
      '#008000', // 2: Dark Green
      '#ff0000', // 3: Pure Red
      '#000080', // 4: Navy Blue
      '#800000', // 5: Maroon Red
      '#008080', // 6: Teal Cyan
      '#000000', // 7: Pure Black
      '#808080'  // 8: Solid Gray
    ];

    this.ctx.font = 'bold 22px "Courier New", monospace';
    this.ctx.fillStyle = classicColors[num] || '#000';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(num.toString(), px + this.tileSize / 2, py + this.tileSize / 2 + 1);
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

    const heroBadge = document.getElementById('heroBadge');
    if (heroBadge) {
      const p = this.heroPerks.find(x => x.id === this.activeHeroPerk);
      if (p) {
        heroBadge.innerHTML = `<span>${p.icon}</span><span>${p.name}</span>`;
      }
    }
  }

  // --- End of Game & Match History Streak Recording ---
  checkVictoryCondition() {
    if (this.isGameOver) return;

    if (this.uncoveredCount >= this.uncoveredTarget) {
      this.recordMatchOutcome(true);
    } else if (this.sappers <= 0) {
      this.recordMatchOutcome(false);
    }
  }

  recordMatchOutcome(won) {
    this.isGameOver = true;
    sfx.playVictory();

    const mins = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (this.elapsedSeconds % 60).toString().padStart(2, '0');
    const timeStr = `${mins}:${secs}`;

    const matchRecord = {
      id: Date.now(),
      commander: this.activeCommander,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: this.mode,
      level: this.level,
      won: won,
      time: timeStr,
      seconds: this.elapsedSeconds,
      blunders: this.blundersCount,
      gold: this.resources
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
      if (desc) desc.textContent = won ? 'Nowy Świat został bezpiecznie zbadany i skolonizowany!' : 'Wszyscy saperzy polegli na polu minowym...';
      if (timeVal) timeVal.textContent = timeStr;
      if (blundersVal) blundersVal.textContent = `${this.blundersCount} 💥`;
      if (goldVal) goldVal.textContent = `+${this.resources} 💰`;

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
    ctx.fillStyle = '#263238';
    ctx.fillRect(0, 0, w, h);

    // Filter by commander
    const list = this.matchHistory.filter(m => m.commander === commander).slice(0, 16).reverse();

    if (list.length === 0) {
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Brak rozegranych meczów dla tego dowódcy. Rozpocznij grę!', w / 2, h / 2);
      return;
    }

    // Grid lines
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 1;
    for (let y = 30; y < h - 20; y += 30) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }

    const barWidth = Math.min(26, (w - 60) / list.length);
    const gap = 8;
    const startX = 40;

    // 1. Draw Outcome Bars (Green = Win, Red = Loss)
    list.forEach((m, idx) => {
      const x = startX + idx * (barWidth + gap);
      const barH = m.won ? 90 : 45;
      const y = h - 30 - barH;

      ctx.fillStyle = m.won ? '#4caf50' : '#f44336';
      ctx.fillRect(x, y, barWidth, barH);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(x, y, barWidth, barH);

      // Label index
      ctx.fillStyle = '#cfd8dc';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`#${idx + 1}`, x + barWidth / 2, h - 14);
    });

    // 2. Draw Yellow Blunders Trend Curve ("Krzywa skuch")
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    list.forEach((m, idx) => {
      const x = startX + idx * (barWidth + gap) + barWidth / 2;
      const blundersNorm = Math.min(100, m.blunders * 25);
      const y = (h - 35) - blundersNorm;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw yellow dots for blunders
    list.forEach((m, idx) => {
      const x = startX + idx * (barWidth + gap) + barWidth / 2;
      const blundersNorm = Math.min(100, m.blunders * 25);
      const y = (h - 35) - blundersNorm;
      ctx.fillStyle = '#ffd600';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Compute Career Stats
    const total = list.length;
    const wins = list.filter(m => m.won).length;
    const winrate = ((wins / total) * 100).toFixed(1);
    const avgBlunders = (list.reduce((acc, m) => acc + m.blunders, 0) / total).toFixed(1);

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

    document.body.className = `theme-${theme} font-${font} cursor-${cursor}`;

    const fontSel = document.getElementById('settingFontSelect');
    if (fontSel) fontSel.value = font.charAt(0).toUpperCase() + font.slice(1);

    const cursorSel = document.getElementById('settingCursorSelect');
    if (cursorSel) cursorSel.value = cursor;
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
