// Keepsweeper - Main Game Engine
// Integrates Minesweeper, Sapper Corps, Kingdom Building, Dragon Battles & Civilization 1 Mechanics

class KeepsweeperGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.viewport = document.getElementById('viewport');

    // Display scale & camera pan
    this.zoom = 1.0;
    this.camX = 0;
    this.camY = 0;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.flagMode = false;

    // Progression & Meta Storage
    this.royalSeals = parseInt(localStorage.getItem('ks_seals') || '25', 10);
    this.techsUnlocked = JSON.parse(localStorage.getItem('ks_techs') || '["scout"]');
    this.progress = JSON.parse(localStorage.getItem('ks_prog') || JSON.stringify({
      dragon: 1,
      reclaim: 1,
      treasury: 1,
      siege: 1
    }));

    // Game Session State
    this.mode = 'dragon';
    this.level = 1;
    this.gridWidth = 22;
    this.gridHeight = 22;
    this.tileSize = 40; // High-detail 40px grid size

    this.resources = 220;
    this.workersTotal = 3;
    this.workersIdle = 3;
    this.soldiersTotal = 0;
    this.soldiersMax = 5;

    // Sapper Corps & Casualties ("skuchy")
    this.sappersMax = 3;
    this.sappers = 3;
    this.hasBlastShield = false;

    // Royal Powers / Blind Guessing System
    this.activePower = null;
    this.powerCooldowns = { oracle: 0, falcon: 0, shield: 0, bombard: 0, probe: 0 };
    this.powerBaseCooldowns = { oracle: 25, falcon: 30, shield: 35, bombard: 20, probe: 15 };

    this.elapsedSeconds = 0;
    this.isGameOver = false;
    this.isVictory = false;

    // Quest objectives
    this.dragonsTarget = 1;
    this.dragonsSlain = 0;
    this.uncoveredTarget = 100;
    this.chestsTarget = 3;
    this.chestsCollected = 0;

    // Board matrix & Entities
    this.grid = [];
    this.projectiles = [];
    this.particles = [];
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

    // Building system
    this.selectedBuildingType = null;
    this.hoverTile = null;

    this.buildingCosts = {
      house: 40,
      barracks: 80,
      watchtower: 60,
      market: 100,
      farm: 50,
      wall: 15,
      wonder: 150, // Civ 1 Wonder
      settler: 70   // Civ 1 Settler Caravan
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
    window.addEventListener('resize', () => this.resizeCanvas());

    this.bindEvents();
    this.setupUI();
    this.fetchVersionInfo();
    this.startLevel(this.mode, this.level);

    // Poll version.json periodically and on focus
    setInterval(() => this.fetchVersionInfo(), 10000);
    window.addEventListener('focus', () => this.fetchVersionInfo());

    // Main animation loop
    this.lastFrameTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));

    // Secondary 1-second simulation tick for resources, wonders, sapper recovery and cooldowns
    setInterval(() => this.simulationTick(), 1000);
  }

  async fetchVersionInfo() {
    try {
      const res = await fetch(`version.json?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        this.applyVersionInfo(data);
      }
    } catch (e) {
      this.applyVersionInfo({
        version: "1.3.0",
        build: "20261008.1555",
        features: [
          "Większe pola 40px i ulepszone grafiki postaci (24px)",
          "Żywe królestwo: autonomiczny ruch mieszkańców i saperów po odkrytych polach",
          "Elementy Civilization 1: Wioski Indian (Wigwamy) z losowymi darami starszyzny",
          "Cuda Świata (Monolity odkrywające bezpieczne pola) oraz Osadnicy kładący drogi",
          "Poprawiony PPM: niezawodne zdejmowanie i stawianie flag",
          "Kompletna dokumentacja projektu i integracja z GitHub"
        ]
      });
    }
  }

  applyVersionInfo(data) {
    if (!data) return;
    const badge = document.getElementById('appVersionBadge');
    const settingsText = document.getElementById('settingsVersionText');
    const featuresList = document.getElementById('settingsFeaturesList');

    if (badge) {
      badge.textContent = `v${data.version}`;
    }
    if (settingsText) {
      settingsText.textContent = `v${data.version} (Build ${data.build})`;
    }
    if (featuresList && data.features) {
      featuresList.innerHTML = data.features.map(f => `• ${f}`).join('<br>');
    }

    if (this.currentBuild && this.currentBuild !== data.build) {
      if (badge) badge.classList.add('updated');
      this.notify(`📢 Gra została zaktualizowana do wersji v${data.version}!`, '✨');
    }
    this.currentBuild = data.build;
  }

  resizeCanvas() {
    this.canvas.width = this.viewport.clientWidth;
    this.canvas.height = this.viewport.clientHeight;
  }

  startLevel(mode, level) {
    this.mode = mode;
    this.level = level;
    this.elapsedSeconds = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.hasBlastShield = false;
    this.activePower = null;

    Object.keys(this.powerCooldowns).forEach(k => this.powerCooldowns[k] = 0);

    this.sappersMax = this.techsUnlocked.includes('resSapperAcademy') ? 5 : 3;
    this.sappers = this.sappersMax;

    this.resources = 220 + (this.techsUnlocked.includes('keep_upgrade') ? 60 : 0);
    this.workersTotal = 3 + (this.techsUnlocked.includes('keep_upgrade') ? 2 : 0);
    this.workersIdle = this.workersTotal;
    this.soldiersTotal = 0;
    this.soldiersMax = 5;

    this.gridWidth = Math.min(34, 18 + Math.floor(level * 1.2));
    this.gridHeight = Math.min(34, 18 + Math.floor(level * 1.2));

    this.dragonsSlain = 0;
    this.dragonsTarget = mode === 'dragon' ? Math.min(5, Math.ceil(level / 3)) : 0;
    this.uncoveredTarget = Math.floor(this.gridWidth * this.gridHeight * 0.45);
    this.chestsTarget = Math.max(2, Math.floor(level / 2));
    this.chestsCollected = 0;

    this.projectiles = [];
    this.particles = [];
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

    this.generateBoard();
    this.centerCamera();
    this.updateUI();
    this.notify(t(this.getModeNameKey()) + ' - ' + t('levelLabel') + ' ' + level, '⚔️');
  }

  generateBoard() {
    this.grid = [];
    for (let y = 0; y < this.gridHeight; y++) {
      const row = [];
      for (let x = 0; x < this.gridWidth; x++) {
        let terrain = 'grass';
        if (Math.random() < 0.08) terrain = 'water';
        else if (Math.random() < 0.12) terrain = 'trees';

        row.push({
          x, y,
          covered: true,
          flagged: false,
          oracleFlag: false,
          crater: false,
          road: false,
          terrain,
          danger: false,
          dangerType: null, // 'mine', 'dragon_nest', 'goblin_portal', 'trap', 'chest', 'wigwam'
          adjacentDangers: 0,
          building: null,
          burnt: false
        });
      }
      this.grid.push(row);
    }

    // Keep at center
    const kx = Math.floor(this.gridWidth / 2);
    const ky = Math.floor(this.gridHeight / 2);
    const keepTile = this.grid[ky][kx];
    keepTile.terrain = 'grass';
    keepTile.covered = false;
    keepTile.road = true;
    keepTile.building = {
      type: 'keep',
      hp: this.techsUnlocked.includes('keep_upgrade') ? 1500 : 1000,
      maxHp: this.techsUnlocked.includes('keep_upgrade') ? 1500 : 1000,
      level: 1
    };

    // 3x3 surrounding starting tiles
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = kx + dx;
        const ny = ky + dy;
        if (this.isValidTile(nx, ny)) {
          this.grid[ny][nx].covered = false;
          this.grid[ny][nx].terrain = 'grass';
          if (Math.abs(dx) + Math.abs(dy) === 1) {
            this.grid[ny][nx].road = true; // Paved roads around Keep
          }
        }
      }
    }

    // Spawn Workers
    for (let i = 0; i < this.workersTotal; i++) {
      this.workers.push({
        x: kx * this.tileSize + 8 + Math.random() * 24,
        y: ky * this.tileSize + 8 + Math.random() * 24,
        targetX: kx * this.tileSize,
        targetY: ky * this.tileSize,
        facing: 1,
        walkAnim: 0
      });
    }

    // Spawn Sappers
    for (let i = 0; i < this.sappers; i++) {
      this.sappersList.push({
        x: kx * this.tileSize + 8 + Math.random() * 24,
        y: ky * this.tileSize + 8 + Math.random() * 24,
        targetX: kx * this.tileSize,
        targetY: ky * this.tileSize,
        facing: 1,
        walkAnim: 0
      });
    }

    // Danger density & generation
    const dangerDensity = 0.14 + (this.level * 0.005);
    const totalTiles = this.gridWidth * this.gridHeight;
    let dangerCount = Math.floor(totalTiles * dangerDensity);

    // 1. Dragon Nests
    let dragonsToPlace = this.dragonsTarget;
    if (this.mode !== 'dragon' && Math.random() < 0.3) dragonsToPlace = 1;

    while (dragonsToPlace > 0) {
      const rx = Math.floor(Math.random() * this.gridWidth);
      const ry = Math.floor(Math.random() * this.gridHeight);
      const distToKeep = Math.hypot(rx - kx, ry - ky);
      if (distToKeep > 5 && !this.grid[ry][rx].danger && this.grid[ry][rx].covered) {
        this.grid[ry][rx].danger = true;
        this.grid[ry][rx].dangerType = 'dragon_nest';
        this.grid[ry][rx].terrain = 'grass';
        dragonsToPlace--;
        dangerCount--;
      }
    }

    // 2. Goblin Portals
    const portalCount = Math.min(4, 1 + Math.floor(this.level / 4));
    for (let p = 0; p < portalCount; p++) {
      let placed = false;
      while (!placed) {
        const rx = Math.floor(Math.random() * this.gridWidth);
        const ry = Math.floor(Math.random() * this.gridHeight);
        const distToKeep = Math.hypot(rx - kx, ry - ky);
        if (distToKeep > 4 && !this.grid[ry][rx].danger && this.grid[ry][rx].covered) {
          this.grid[ry][rx].danger = true;
          this.grid[ry][rx].dangerType = 'goblin_portal';
          this.grid[ry][rx].terrain = 'grass';
          placed = true;
          dangerCount--;
        }
      }
    }

    // 3. Civilization 1 Native Tribal Villages (Wigwams)
    const wigwamCount = Math.max(2, Math.floor(this.level / 2.5));
    for (let w = 0; w < wigwamCount; w++) {
      let placed = false;
      while (!placed) {
        const rx = Math.floor(Math.random() * this.gridWidth);
        const ry = Math.floor(Math.random() * this.gridHeight);
        const distToKeep = Math.hypot(rx - kx, ry - ky);
        if (distToKeep > 3 && !this.grid[ry][rx].danger && this.grid[ry][rx].covered && this.grid[ry][rx].terrain !== 'water') {
          this.grid[ry][rx].dangerType = 'wigwam';
          placed = true;
        }
      }
    }

    // 4. Treasure Chests
    const chestCount = Math.max(3, Math.floor(this.level * 1.2));
    for (let c = 0; c < chestCount; c++) {
      let placed = false;
      while (!placed) {
        const rx = Math.floor(Math.random() * this.gridWidth);
        const ry = Math.floor(Math.random() * this.gridHeight);
        if (!this.grid[ry][rx].danger && this.grid[ry][rx].covered && this.grid[ry][rx].terrain !== 'water' && this.grid[ry][rx].dangerType !== 'wigwam') {
          this.grid[ry][rx].dangerType = 'chest';
          placed = true;
        }
      }
    }

    // 5. Mines & Traps for remaining danger quota
    while (dangerCount > 0) {
      const rx = Math.floor(Math.random() * this.gridWidth);
      const ry = Math.floor(Math.random() * this.gridHeight);
      const distToKeep = Math.hypot(rx - kx, ry - ky);
      if (distToKeep > 2 && !this.grid[ry][rx].danger && this.grid[ry][rx].covered) {
        this.grid[ry][rx].danger = true;
        this.grid[ry][rx].dangerType = 'mine';
        dangerCount--;
      }
    }

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
    const kx = Math.floor(this.gridWidth / 2) * this.tileSize;
    const ky = Math.floor(this.gridHeight / 2) * this.tileSize;
    this.camX = this.canvas.width / 2 - kx * this.zoom;
    this.camY = this.canvas.height / 2 - ky * this.zoom;
  }

  // --- Controls & Interaction (PPM Flag Fix) ---
  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1 || e.shiftKey) {
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
      } else {
        this.hoverTile = null;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isPanning = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handlePointerDown(e.clientX, e.clientY, 2);
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      this.setZoom(this.zoom * zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Touch controls
    let touchStartDist = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        this.panStartX = t.clientX - this.camX;
        this.panStartY = t.clientY - this.camY;
        this.touchStartTime = Date.now();
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        this.camX = t.clientX - this.panStartX;
        this.camY = t.clientY - this.panStartY;
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStartDist > 0) {
          const factor = dist / touchStartDist;
          this.setZoom(this.zoom * factor);
          touchStartDist = dist;
        }
      }
    });

    this.canvas.addEventListener('touchend', (e) => {
      if (Date.now() - this.touchStartTime < 250) {
        const t = e.changedTouches[0];
        this.handlePointerDown(t.clientX, t.clientY, this.flagMode ? 2 : 0);
      }
    });
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

    document.getElementById('zoomLevelText').textContent = Math.round(this.zoom * 100) + '%';
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

    // Right-click or Flag mode: ALWAYS TOGGLES & REMOVES CLEANLY
    if (button === 2 || (button === 0 && this.flagMode)) {
      if (tile.covered) {
        if (tile.flagged || tile.oracleFlag) {
          tile.flagged = false;
          tile.oracleFlag = false;
          sfx.playFlag();
        } else {
          tile.flagged = true;
          sfx.playFlag();
        }
      } else if (!tile.covered && tile.adjacentDangers > 0) {
        // Right-click chord on revealed numbers!
        this.chordTile(tx, ty);
      }
      return;
    }

    // Cast active Royal Power!
    if (this.activePower) {
      this.executePowerOnTile(tx, ty, this.activePower);
      return;
    }

    // Left-click with Building selected: Construct building!
    if (this.selectedBuildingType) {
      this.attemptBuild(tx, ty, this.selectedBuildingType);
      return;
    }

    // Left-click on Covered Tile: Dig / Uncover
    if (tile.covered) {
      if (tile.flagged || tile.oracleFlag) return; // Protected by flag
      this.uncoverTile(tx, ty);
    } else {
      if (tile.adjacentDangers > 0) {
        this.chordTile(tx, ty);
      }
    }
  }

  // --- Sapper Uncover & Civilization 1 Tribal Contact ---
  uncoverTile(tx, ty) {
    const tile = this.grid[ty][tx];
    if (!tile.covered || tile.flagged || tile.oracleFlag) return;

    tile.covered = false;
    sfx.playDig();

    const alchemyBonus = this.techsUnlocked.includes('alchemy') ? 1.25 : 1.0;
    this.resources += Math.round(2 * alchemyBonus);

    // Check for Danger & Events
    if (tile.danger) {
      if (tile.dangerType === 'dragon_nest') {
        this.spawnDragon(tx, ty);
        this.notify(t('dragonAwakened'), '🐉');
        sfx.playDragonRoar();
      } else if (tile.dangerType === 'goblin_portal') {
        this.activatePortal(tx, ty);
        this.notify(t('portalSpawned'), '🌀');
      } else {
        // Mine or Trap: SKUCHA!
        this.handleHazardDetonation(tx, ty);
      }
    } else if (tile.dangerType === 'chest') {
      const bonusGold = Math.round((60 + Math.floor(Math.random() * 40)) * alchemyBonus);
      const gotSeal = Math.random() < 0.5 ? 1 : 0;
      this.resources += bonusGold;
      if (gotSeal) {
        this.royalSeals += gotSeal;
        localStorage.setItem('ks_seals', this.royalSeals);
      }
      this.chestsCollected++;
      sfx.playChest();
      this.notify(t('chestFound', { gold: bonusGold, seals: gotSeal }), '💎');
    } else if (tile.dangerType === 'wigwam') {
      // Civilization 1 Native Tribal Village Contact!
      sfx.playVictory();
      const giftRoll = Math.floor(Math.random() * 4);
      let giftName = '';
      if (giftRoll === 0) {
        this.royalSeals += 2;
        localStorage.setItem('ks_seals', this.royalSeals);
        giftName = t('giftSeals');
      } else if (giftRoll === 1) {
        this.resources += 80;
        giftName = t('giftGold');
      } else if (giftRoll === 2) {
        this.soldiersMax += 2;
        this.soldiersTotal++;
        this.natives.push({
          x: tx * this.tileSize + 10,
          y: ty * this.tileSize + 10,
          targetX: tx * this.tileSize,
          targetY: ty * this.tileSize,
          hp: 140,
          facing: 1
        });
        giftName = t('giftWarriors');
      } else {
        let marked = 0;
        for (let r = 1; r <= 6 && marked < 4; r++) {
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              const nx = tx + dx;
              const ny = ty + dy;
              if (this.isValidTile(nx, ny) && this.grid[ny][nx].danger && !this.grid[ny][nx].oracleFlag && this.grid[ny][nx].covered) {
                this.grid[ny][nx].oracleFlag = true;
                marked++;
                if (marked >= 4) break;
              }
            }
            if (marked >= 4) break;
          }
        }
        giftName = t('giftMap');
      }
      this.notify(t('nativeVillageFound', { gift: giftName }), '🏕️');
    }

    if (tile.adjacentDangers === 0 && !tile.danger && !tile.crater) {
      sfx.playCascade();
      this.floodFillReveal(tx, ty);
    }

    this.checkVictoryCondition();
    this.updateUI();
  }

  handleHazardDetonation(tx, ty) {
    const tile = this.grid[ty][tx];
    tile.danger = false;
    tile.crater = true;
    tile.covered = false;

    const win = document.getElementById('appWindow');
    if (win) {
      win.classList.remove('screen-shake');
      void win.offsetWidth;
      win.classList.add('screen-shake');
    }

    sfx.playExplosion();
    this.createExplosion(tx * this.tileSize + 20, ty * this.tileSize + 20);

    if (this.hasBlastShield) {
      this.hasBlastShield = false;
      sfx.playShield();
      this.notify(t('sapperSavedByArmor'), '🛡️');
      this.updateUI();
      return;
    }

    if (this.techsUnlocked.includes('resFlakArmor') && Math.random() < 0.5) {
      sfx.playShield();
      this.notify("🛡️ Pancerz przeciwodłamkowy ocalił życie sapera!", '🛡️');
      this.updateUI();
      return;
    }

    if (this.sappers > 0) {
      this.sappers--;
      if (this.sappersList.length > 0) {
        this.sappersList.pop();
      }
      this.notify(t('sapperCasualty', { remaining: this.sappers }), '💥');

      if (this.sappers === 0) {
        this.notify(t('noSappersWarning'), '⚠️');
      }
    } else {
      const kx = Math.floor(this.gridWidth / 2);
      const ky = Math.floor(this.gridHeight / 2);
      const keep = this.grid[ky][kx].building;
      if (keep) {
        keep.hp -= 250;
        this.notify("💥 Brak wolnych saperów! Eksplozja uszkodziła Zamek (-250 HP)!", '🏰');
        if (keep.hp <= 0) {
          this.triggerDefeat();
        }
      }
    }

    this.recalculateAdjacentNumbers();
  }

  recruitSapper() {
    const cost = this.techsUnlocked.includes('resSapperAcademy') ? 30 : 40;
    if (this.resources < cost) {
      this.notify("⚠️ Brak zasobów na zaciąg sapera (Potrzeba: " + cost + " 💰)!", '💰');
      return;
    }
    if (this.sappers >= this.sappersMax) {
      this.notify("⚠️ Korpus saperski ma już pełen stan (" + this.sappersMax + ")!", '⛑️');
      return;
    }

    this.resources -= cost;
    this.sappers++;
    const kx = Math.floor(this.gridWidth / 2);
    const ky = Math.floor(this.gridHeight / 2);
    this.sappersList.push({
      x: kx * this.tileSize + 8 + Math.random() * 20,
      y: ky * this.tileSize + 8 + Math.random() * 20,
      targetX: kx * this.tileSize,
      targetY: ky * this.tileSize,
      facing: 1
    });

    sfx.playRecruit();
    this.notify(t('sapperRecruited', { cost }), '⛑️');
    this.updateUI();
  }

  // --- Royal Powers System ---
  activatePower(powerKey) {
    if (this.powerCooldowns[powerKey] > 0) {
      this.notify(t('powerCooldown', { sec: this.powerCooldowns[powerKey] }), '⏳');
      return;
    }

    if (powerKey === 'shield') {
      this.hasBlastShield = true;
      sfx.playShield();
      this.startPowerCooldown('shield');
      this.notify("🛡️ Pancerz saperski aktywny! Następna skucha nie przyniesie ofiar.", '🛡️');
      this.updateUI();
      return;
    }

    this.activePower = powerKey;
    document.querySelectorAll('.power-card').forEach(c => c.classList.remove('active'));
    const card = document.getElementById('powerCard' + powerKey.charAt(0).toUpperCase() + powerKey.slice(1));
    if (card) card.classList.add('active');

    this.notify(t('powerActiveHint') + t('power' + powerKey.charAt(0).toUpperCase() + powerKey.slice(1)), '✨');
  }

  startPowerCooldown(powerKey) {
    let cd = this.powerBaseCooldowns[powerKey] || 25;
    if (this.techsUnlocked.includes('resFocusRegen')) {
      cd = Math.round(cd * 0.65);
    }
    this.powerCooldowns[powerKey] = cd;
    this.activePower = null;
    document.querySelectorAll('.power-card').forEach(c => c.classList.remove('active'));
  }

  executePowerOnTile(tx, ty, powerKey) {
    const tile = this.grid[ty][tx];

    if (powerKey === 'oracle') {
      if (!tile.covered) {
        this.notify("Wybierz zakryte pole dla Wyroczni!", "🔮");
        return;
      }
      sfx.playSpell();
      if (tile.danger) {
        tile.oracleFlag = true;
        this.notify("🔮 Wyrocznia ostrzega: Na tym polu czai się śmiertelne zagrożenie! (Złota flaga)", "🔮");
      } else {
        tile.covered = false;
        this.resources += 5;
        this.notify("🔮 Wyrocznia: Pole jest bezpieczne!", "✨");
        if (tile.adjacentDangers === 0) this.floodFillReveal(tx, ty);
      }
      this.startPowerCooldown('oracle');

    } else if (powerKey === 'falcon') {
      sfx.playSpell();
      this.falcons.push({
        x: this.camX - 50,
        y: this.camY - 50,
        targetX: tx * this.tileSize,
        targetY: ty * this.tileSize,
        speed: 280
      });

      let cleared = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = tx + dx;
          const ny = ty + dy;
          if (this.isValidTile(nx, ny)) {
            const nTile = this.grid[ny][nx];
            if (nTile.covered) {
              if (nTile.danger) {
                nTile.oracleFlag = true;
              } else if (cleared < 2) {
                nTile.covered = false;
                cleared++;
              }
            }
          }
        }
      }
      this.notify("🦅 Królewski sokół zbadał obszar i oznaczył ukryte miny!", "🦅");
      this.startPowerCooldown('falcon');

    } else if (powerKey === 'bombard') {
      if (!tile.covered) {
        this.notify("Wybierz zakryte pole do ostrzału katapulty!", "💣");
        return;
      }
      sfx.playBombardment();
      this.catapultStones.push({
        x: tx * this.tileSize + 80,
        y: ty * this.tileSize - 200,
        targetX: tx * this.tileSize + 20,
        targetY: ty * this.tileSize + 20,
        speed: 360,
        tileX: tx,
        tileY: ty
      });
      this.startPowerCooldown('bombard');

    } else if (powerKey === 'probe') {
      if (!tile.covered) return;
      sfx.playDig();
      if (tile.danger) {
        if (Math.random() < 0.8) {
          tile.danger = false;
          tile.crater = true;
          tile.covered = false;
          this.resources += 30;
          sfx.playShield();
          this.notify(t('sapperDefused', { gold: 30 }), "🧲");
          this.recalculateAdjacentNumbers();
        } else {
          this.handleHazardDetonation(tx, ty);
        }
      } else {
        tile.covered = false;
        if (tile.adjacentDangers === 0) this.floodFillReveal(tx, ty);
      }
      this.startPowerCooldown('probe');
    }

    this.checkVictoryCondition();
    this.updateUI();
  }

  floodFillReveal(startX, startY) {
    const queue = [[startX, startY]];
    const visited = new Set();
    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
      const [cx, cy] = queue.shift();

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;

          if (this.isValidTile(nx, ny)) {
            const nTile = this.grid[ny][nx];
            const key = `${nx},${ny}`;

            if (nTile.covered && !nTile.flagged && !nTile.oracleFlag && !visited.has(key)) {
              visited.add(key);
              nTile.covered = false;
              this.resources += 1;

              if (nTile.dangerType === 'chest') {
                this.resources += 50;
                this.chestsCollected++;
              }

              if (nTile.adjacentDangers === 0 && !nTile.danger && !nTile.crater) {
                queue.push([nx, ny]);
              }
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
              this.uncoverTile(nx, ny);
            }
          }
        }
      }
    }
  }

  // --- Building System (Civilization 1 Wonder & Settler) ---
  attemptBuild(tx, ty, type) {
    const tile = this.grid[ty][tx];
    const cost = this.buildingCosts[type] || 50;

    if (tile.covered) {
      this.notify("⚠️ Musisz najpierw odkryć i zabezpieczyć ten teren!", "⚠️");
      return;
    }
    if (tile.building) {
      this.notify("⚠️ To pole jest już zabudowane!", "⚠️");
      return;
    }
    if (tile.terrain === 'water') {
      this.notify("⚠️ Nie można budować na wodzie!", "⚠️");
      return;
    }
    if (this.resources < cost) {
      this.notify("⚠️ Niewystarczająca ilość zasobów!", "💰");
      return;
    }
    if (this.workersIdle <= 0 && type !== 'house') {
      this.notify("⚠️ Wszyscy robotnicy są zajęci!", "👷");
      return;
    }

    this.resources -= cost;

    if (type === 'settler') {
      // Dispatches a wandering Settler unit!
      this.settlers.push({
        x: tx * this.tileSize + 10,
        y: ty * this.tileSize + 10,
        targetX: tx * this.tileSize,
        targetY: ty * this.tileSize,
        facing: 1
      });
      tile.road = true;
      sfx.playRecruit();
      this.notify("🐎 Wóz Osadników wyruszył w drogę budować nowe trakty!", "🐎");
    } else {
      tile.building = {
        type,
        hp: type === 'wall' ? 300 : (type === 'wonder' ? 500 : 200),
        maxHp: type === 'wall' ? 300 : (type === 'wonder' ? 500 : 200),
        level: 1,
        lastActionTime: performance.now()
      };

      sfx.playBuild();
      this.notify(`${t('btnBuild')}: ${t('building' + type.charAt(0).toUpperCase() + type.slice(1))}`, "🔨");

      if (type === 'house') {
        this.workersTotal += 2;
        this.workersIdle += 2;
        this.workers.push({
          x: tx * this.tileSize + 10,
          y: ty * this.tileSize + 10,
          targetX: tx * this.tileSize,
          targetY: ty * this.tileSize,
          facing: 1
        });
      } else if (type === 'barracks') {
        this.soldiersMax += 5;
      }
    }

    this.selectedBuildingType = null;
    document.querySelectorAll('.build-card').forEach(el => el.classList.remove('selected'));
    document.getElementById('buildPalette').style.display = 'none';
    this.updateUI();
  }

  // --- Entities & Combat ---
  spawnDragon(tx, ty) {
    this.dragons.push({
      x: tx * this.tileSize,
      y: ty * this.tileSize,
      hp: 400 + this.level * 80,
      maxHp: 400 + this.level * 80,
      speed: 1.2,
      targetBuilding: null,
      lastAttack: performance.now(),
      wingAngle: 0,
      state: 'flying'
    });
  }

  activatePortal(tx, ty) {
    this.portals.push({
      x: tx,
      y: ty,
      timer: 20,
      active: true
    });
  }

  spawnGoblin(x, y) {
    this.goblins.push({
      x: x * this.tileSize,
      y: y * this.tileSize,
      hp: 60,
      maxHp: 60,
      speed: 0.9,
      targetX: Math.floor(this.gridWidth / 2) * this.tileSize,
      targetY: Math.floor(this.gridHeight / 2) * this.tileSize,
      facing: 1
    });
  }

  createExplosion(px, py) {
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 1.0,
        color: ['#ff5722', '#ffeb3b', '#e91e63', '#212121'][Math.floor(Math.random() * 4)],
        size: Math.random() * 5 + 2
      });
    }
  }

  // 1-second simulation tick
  simulationTick() {
    if (this.isGameOver) return;
    this.elapsedSeconds++;

    // Income & Wonder effects
    let income = 1;
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const b = this.grid[y][x].building;
        if (!b) continue;

        if (b.type === 'house') {
          income += 1;
        } else if (b.type === 'farm') {
          income += 2;
        } else if (b.type === 'market') {
          let houseBonus = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (this.isValidTile(nx, ny) && this.grid[ny][nx].building?.type === 'house') {
                houseBonus += 2;
              }
            }
          }
          income += houseBonus;
        } else if (b.type === 'barracks') {
          if (this.soldiersTotal < this.soldiersMax && this.resources >= 20) {
            this.soldiersTotal++;
            this.resources -= 5;
            this.soldiers.push({
              x: x * this.tileSize + 10,
              y: y * this.tileSize + 10,
              targetX: x * this.tileSize,
              targetY: y * this.tileSize,
              hp: 100,
              facing: 1
            });
          }
        } else if (b.type === 'wonder') {
          // Civ 1 Wonder of the World: discovers 1 safe tile every 15s!
          if (this.elapsedSeconds % 15 === 0) {
            this.wonderRevealSafeTile();
          }
        }
      }
    }

    this.resources += income;

    // Portal countdowns
    this.portals.forEach(p => {
      p.timer--;
      if (p.timer <= 0) {
        p.timer = 25;
        this.spawnGoblin(p.x, p.y);
        this.notify(t('portalSpawned'), '👹');
      }
    });

    // Reduce power cooldowns
    Object.keys(this.powerCooldowns).forEach(k => {
      if (this.powerCooldowns[k] > 0) {
        this.powerCooldowns[k]--;
      }
    });

    this.updateUI();
  }

  wonderRevealSafeTile() {
    const candidates = [];
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const tile = this.grid[y][x];
        if (tile.covered && !tile.danger) {
          candidates.push({ x, y });
        }
      }
    }
    if (candidates.length > 0) {
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      sfx.playSpell();
      this.uncoverTile(pick.x, pick.y);
      this.notify("🏛️ Cud Świata rozświetla mgłę i ujawnia bezpieczną krainę!", "🏛️");
    }
  }

  // --- Dynamic Autonomous Unit Movement on Open Fields ---
  updateWanderingUnits(dt, now) {
    const openTiles = [];
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const t = this.grid[y][x];
        if (!t.covered && t.terrain !== 'water' && !t.crater) {
          openTiles.push({ x, y, road: t.road, building: t.building });
        }
      }
    }
    if (openTiles.length === 0) return;

    // Perimeter tiles adjacent to fog of war (for Sappers)
    const frontierTiles = [];
    for (const t of openTiles) {
      let isEdge = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = t.x + dx;
          const ny = t.y + dy;
          if (this.isValidTile(nx, ny) && this.grid[ny][nx].covered) {
            isEdge = true;
            break;
          }
        }
        if (isEdge) break;
      }
      if (isEdge) frontierTiles.push(t);
    }

    const moveEntity = (u, speed, pool) => {
      const targetPool = (pool && pool.length > 0) ? pool : openTiles;
      if (!u.targetX || (Math.hypot(u.targetX - u.x, u.targetY - u.y) < 6)) {
        if (!u.waitTimer) u.waitTimer = now + 1500 + Math.random() * 3000;
        if (now > u.waitTimer) {
          const dest = targetPool[Math.floor(Math.random() * targetPool.length)];
          u.targetX = dest.x * this.tileSize + 8 + Math.random() * 20;
          u.targetY = dest.y * this.tileSize + 8 + Math.random() * 20;
          u.waitTimer = null;
        }
      } else {
        const dx = u.targetX - u.x;
        const dy = u.targetY - u.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 2) {
          u.x += (dx / dist) * speed * dt;
          u.y += (dy / dist) * speed * dt;
          u.walkAnim = (u.walkAnim || 0) + dt * 10;
          u.facing = dx >= 0 ? 1 : -1;
        }
      }
    };

    // Workers wander across fields
    this.workers.forEach(w => moveEntity(w, 36, openTiles));

    // Sappers patrol the frontier perimeter
    this.sappersList.forEach(s => moveEntity(s, 32, frontierTiles.length > 0 ? frontierTiles : openTiles));

    // Soldiers patrol or charge monsters
    this.soldiers.forEach(s => {
      let enemy = this.goblins[0] || (this.dragons.length > 0 ? this.dragons[0] : null);
      if (enemy) {
        s.targetX = enemy.x;
        s.targetY = enemy.y;
        const dx = enemy.x - s.x;
        const dy = enemy.y - s.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 28) {
          if (!s.lastAttack || now - s.lastAttack > 800) {
            s.lastAttack = now;
            enemy.hp -= 20;
            this.createExplosion(enemy.x, enemy.y);
            sfx.playArrow();
          }
        } else {
          s.x += (dx / dist) * 60 * dt;
          s.y += (dy / dist) * 60 * dt;
          s.facing = dx >= 0 ? 1 : -1;
        }
      } else {
        moveEntity(s, 42, openTiles);
      }
    });

    // Native Warriors attack dragons or patrol
    this.natives.forEach(n => {
      let enemy = this.dragons[0] || this.goblins[0];
      if (enemy && Math.hypot(enemy.x - n.x, enemy.y - n.y) < 220) {
        if (!n.lastAttack || now - n.lastAttack > 1100) {
          n.lastAttack = now;
          this.projectiles.push({
            x: n.x,
            y: n.y,
            target: enemy,
            speed: 320,
            damage: 25
          });
          sfx.playArrow();
        }
      } else {
        moveEntity(n, 38, openTiles);
      }
    });

    // Settlers pave roads
    this.settlers.forEach(st => {
      moveEntity(st, 32, openTiles);
      const tx = Math.floor(st.x / this.tileSize);
      const ty = Math.floor(st.y / this.tileSize);
      if (this.isValidTile(tx, ty) && !this.grid[ty][tx].covered && !this.grid[ty][tx].road && this.grid[ty][tx].terrain === 'grass') {
        if (Math.random() < 0.05) {
          this.grid[ty][tx].road = true;
        }
      }
    });
  }

  // --- Main Animation & Physics Loop ---
  gameLoop(currentTime) {
    const dt = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    this.updateEntities(dt, currentTime);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  updateEntities(dt, now) {
    if (this.isGameOver) return;

    // Autonomous wandering of all living people
    this.updateWanderingUnits(dt, now);

    // Watchtowers fire arrows
    const doubleDmg = this.techsUnlocked.includes('ballista');
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const b = this.grid[y][x].building;
        if (b && b.type === 'watchtower' && now - b.lastActionTime > 1400) {
          const towerPx = x * this.tileSize + 20;
          const towerPy = y * this.tileSize + 20;

          let target = this.dragons[0];
          let isDragon = true;
          if (!target && this.goblins.length > 0) {
            target = this.goblins[0];
            isDragon = false;
          }

          if (target) {
            const dist = Math.hypot(target.x - towerPx, target.y - towerPy);
            if (dist < 240) {
              b.lastActionTime = now;
              this.projectiles.push({
                x: towerPx,
                y: towerPy,
                target: target,
                speed: 340,
                damage: (doubleDmg && isDragon) ? 45 : 22
              });
              sfx.playArrow();
            }
          }
        }
      }
    }

    // Projectiles flying
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 14) {
        p.target.hp -= p.damage;
        this.createExplosion(p.x, p.y);
        this.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * p.speed * dt;
        p.y += (dy / dist) * p.speed * dt;
      }
    }

    // Catapult boulders
    for (let i = this.catapultStones.length - 1; i >= 0; i--) {
      const s = this.catapultStones[i];
      const dx = s.targetX - s.x;
      const dy = s.targetY - s.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 12) {
        this.catapultStones.splice(i, 1);
        const tile = this.grid[s.tileY][s.tileX];
        tile.danger = false;
        tile.crater = true;
        tile.covered = false;
        this.createExplosion(s.targetX, s.targetY);
        this.notify("💣 Pocisk katapulty zneutralizował cel!", "💣");
        this.recalculateAdjacentNumbers();
      } else {
        s.x += (dx / dist) * s.speed * dt;
        s.y += (dy / dist) * s.speed * dt;
      }
    }

    // Falcons
    for (let i = this.falcons.length - 1; i >= 0; i--) {
      const f = this.falcons[i];
      const dx = f.targetX - f.x;
      const dy = f.targetY - f.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 16) {
        this.falcons.splice(i, 1);
      } else {
        f.x += (dx / dist) * f.speed * dt;
        f.y += (dy / dist) * f.speed * dt;
      }
    }

    // Dragon flight & Fire breath
    for (let i = this.dragons.length - 1; i >= 0; i--) {
      const dragon = this.dragons[i];
      if (dragon.hp <= 0) {
        this.createExplosion(dragon.x, dragon.y);
        this.dragons.splice(i, 1);
        this.dragonsSlain++;
        this.royalSeals += 2;
        this.resources += 200;
        localStorage.setItem('ks_seals', this.royalSeals);
        sfx.playVictory();
        this.notify(t('dragonSlain'), '🏆');
        this.checkVictoryCondition();
        continue;
      }

      const keepX = Math.floor(this.gridWidth / 2) * this.tileSize;
      const keepY = Math.floor(this.gridHeight / 2) * this.tileSize;
      const distToKeep = Math.hypot(keepX - dragon.x, keepY - dragon.y);

      if (distToKeep > 90) {
        dragon.x += ((keepX - dragon.x) / distToKeep) * 45 * dt;
        dragon.y += ((keepY - dragon.y) / distToKeep) * 45 * dt;
      }

      if (now - dragon.lastAttack > 2200) {
        dragon.lastAttack = now;
        sfx.playFireBreath();

        const targetX = keepX + (Math.random() - 0.5) * 70;
        const targetY = keepY + (Math.random() - 0.5) * 70;
        for (let p = 0; p < 15; p++) {
          this.particles.push({
            x: dragon.x + 25,
            y: dragon.y + 15,
            vx: (targetX - dragon.x) * 0.02 + (Math.random() - 0.5) * 2,
            vy: (targetY - dragon.y) * 0.02 + (Math.random() - 0.5) * 2,
            life: 0.8,
            color: '#ff3d00',
            size: Math.random() * 6 + 3
          });
        }

        const btx = Math.floor(targetX / this.tileSize);
        const bty = Math.floor(targetY / this.tileSize);
        if (this.isValidTile(btx, bty) && this.grid[bty][btx].building) {
          const b = this.grid[bty][btx].building;
          b.hp -= 40;
          this.grid[bty][btx].burnt = true;
          if (b.hp <= 0) {
            if (b.type === 'keep') {
              this.triggerDefeat();
            }
            this.grid[bty][btx].building = null;
            this.notify(t('buildingDestroyed'), '🔥');
          }
        }
      }
    }

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // --- Rendering Graphics ---
  render() {
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
            this.ctx.drawImage(Sprites.cache.flag, px, py);
          } else {
            this.ctx.drawImage(Sprites.cache.covered, px, py);
          }
        } else {
          // Terrain
          if (tile.crater) {
            this.ctx.drawImage(Sprites.cache.crater, px, py);
          } else if (tile.terrain === 'water') {
            this.ctx.drawImage(Sprites.cache.water, px, py);
          } else if (tile.terrain === 'trees') {
            this.ctx.drawImage(Sprites.cache.trees, px, py);
          } else {
            if (tile.road) {
              this.ctx.drawImage(Sprites.cache.road, px, py);
            } else {
              this.ctx.drawImage(Sprites.cache.grass, px, py);
            }
          }

          if (tile.burnt) {
            this.ctx.fillStyle = 'rgba(62, 39, 35, 0.4)';
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
          }

          // Special Tiles
          if (tile.dangerType === 'goblin_portal') {
            this.ctx.drawImage(Sprites.cache.portal, px, py);
          } else if (tile.dangerType === 'chest') {
            this.ctx.drawImage(Sprites.cache.chest, px, py);
          } else if (tile.dangerType === 'wigwam') {
            this.ctx.drawImage(Sprites.cache.wigwam, px, py);
          }

          // Buildings
          if (tile.building) {
            const bSprite = Sprites.cache[tile.building.type];
            if (bSprite) {
              this.ctx.drawImage(bSprite, px, py);
            }
            if (tile.building.hp < tile.building.maxHp) {
              const hpPct = Math.max(0, tile.building.hp / tile.building.maxHp);
              this.ctx.fillStyle = '#d32f2f';
              this.ctx.fillRect(px + 4, py + 2, 32, 4);
              this.ctx.fillStyle = '#4caf50';
              this.ctx.fillRect(px + 4, py + 2, 32 * hpPct, 4);
            }
          } else if (tile.adjacentDangers > 0 && !tile.danger && !tile.crater) {
            this.renderMinesweeperNumber(tile.adjacentDangers, px, py);
          }
        }
      }
    }

    // 2. Draw Living Characters (with smooth step bobbing & facing direction)
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
    this.soldiers.forEach(s => drawChar(Sprites.cache.soldier, s));
    this.settlers.forEach(st => drawChar(Sprites.cache.settler, st));
    this.natives.forEach(n => drawChar(Sprites.cache.native, n));
    this.goblins.forEach(g => drawChar(Sprites.cache.goblin, g));

    // 3. Projectiles
    this.ctx.strokeStyle = '#4e342e';
    this.ctx.lineWidth = 2;
    this.projectiles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffeb3b';
      this.ctx.fill();
    });

    this.catapultStones.forEach(s => {
      this.ctx.fillStyle = '#424242';
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, 7, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#ff5722';
      this.ctx.beginPath();
      this.ctx.arc(s.x + 2, s.y - 2, 4, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.falcons.forEach(f => {
      this.ctx.drawImage(Sprites.cache.falcon, f.x, f.y);
    });

    // 4. Dragon & Boss HP Bar
    this.dragons.forEach(d => {
      this.ctx.drawImage(Sprites.cache.dragon, d.x - 36, d.y - 36);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(d.x - 28, d.y - 42, 56, 7);
      this.ctx.fillStyle = '#f44336';
      this.ctx.fillRect(d.x - 27, d.y - 41, 54 * (d.hp / d.maxHp), 5);
    });

    // 5. Fire Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 6. Build Ghost Cursor
    if (this.selectedBuildingType && this.hoverTile) {
      const gpx = this.hoverTile.x * this.tileSize;
      const gpy = this.hoverTile.y * this.tileSize;
      this.ctx.fillStyle = 'rgba(76, 175, 80, 0.4)';
      this.ctx.fillRect(gpx, gpy, this.tileSize, this.tileSize);
      const ghostSprite = Sprites.cache[this.selectedBuildingType];
      if (ghostSprite) {
        this.ctx.globalAlpha = 0.6;
        this.ctx.drawImage(ghostSprite, gpx, gpy);
        this.ctx.globalAlpha = 1.0;
      }
    }

    // 7. Active Power Target Reticle
    if (this.activePower && this.hoverTile) {
      const gpx = this.hoverTile.x * this.tileSize;
      const gpy = this.hoverTile.y * this.tileSize;
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(gpx + 2, gpy + 2, this.tileSize - 4, this.tileSize - 4);
    }

    this.ctx.restore();
  }

  renderMinesweeperNumber(num, px, py) {
    const colors = [
      '',
      '#0000ff', // 1: Blue
      '#008000', // 2: Green
      '#ff0000', // 3: Red
      '#000080', // 4: Dark Navy
      '#800000', // 5: Maroon
      '#008080', // 6: Teal
      '#000000', // 7: Black
      '#808080'  // 8: Gray
    ];
    this.ctx.font = 'bold 20px "Courier New", monospace';
    this.ctx.fillStyle = colors[num] || '#000';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(num.toString(), px + this.tileSize / 2, py + this.tileSize / 2 + 1);
  }

  // --- Victory / Defeat Conditions ---
  checkVictoryCondition() {
    if (this.isGameOver) return;

    let won = false;

    if (this.mode === 'dragon') {
      if (this.dragonsSlain >= this.dragonsTarget) won = true;
    } else if (this.mode === 'reclaim') {
      let uncovered = 0;
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          if (!this.grid[y][x].covered) uncovered++;
        }
      }
      if (uncovered >= this.uncoveredTarget) won = true;
    } else if (this.mode === 'treasury') {
      if (this.chestsCollected >= this.chestsTarget) won = true;
    }

    if (won) {
      this.triggerVictory();
    }
  }

  triggerVictory() {
    this.isGameOver = true;
    this.isVictory = true;
    sfx.playVictory();

    const sealsEarned = 2 + Math.floor(this.level / 4);
    this.royalSeals += sealsEarned;
    localStorage.setItem('ks_seals', this.royalSeals);

    if (this.level >= (this.progress[this.mode] || 1)) {
      this.progress[this.mode] = Math.min(20, this.level + 1);
      localStorage.setItem('ks_prog', JSON.stringify(this.progress));
    }

    document.getElementById('endgameTitle').textContent = t('victoryTitle');
    document.getElementById('endgameTitle').style.color = '#2e7d32';
    document.getElementById('endgameDesc').textContent = t('victoryDesc');
    document.getElementById('rewardSeals').textContent = `+${sealsEarned} 👑`;
    document.getElementById('modalGameOver').style.display = 'flex';
  }

  triggerDefeat() {
    this.isGameOver = true;
    this.isVictory = false;
    sfx.playDefeat();

    document.getElementById('endgameTitle').textContent = t('defeatTitle');
    document.getElementById('endgameTitle').style.color = '#c62828';
    document.getElementById('endgameDesc').textContent = t('defeatDesc');
    document.getElementById('rewardSeals').textContent = `0 👑`;
    document.getElementById('modalGameOver').style.display = 'flex';
  }

  notify(msg, icon = '📢') {
    const ticker = document.getElementById('eventTicker');
    document.getElementById('tickerIcon').textContent = icon;
    document.getElementById('tickerText').textContent = msg;
    ticker.style.display = 'flex';
    clearTimeout(this.tickerTimer);
    this.tickerTimer = setTimeout(() => {
      ticker.style.display = 'none';
    }, 4500);
  }

  updateUI() {
    document.getElementById('resCounter').textContent = this.formatLED(this.resources);

    let uncoveredCount = 0;
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        if (!this.grid[y][x].covered) uncoveredCount++;
      }
    }
    document.getElementById('uncoveredCounter').textContent = this.formatLED(uncoveredCount);

    const mins = Math.floor(this.elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (this.elapsedSeconds % 60).toString().padStart(2, '0');
    document.getElementById('levelTimer').textContent = `${mins}:${secs}`;

    document.getElementById('workersCount').textContent = `${this.workersIdle}/${this.workersTotal}`;
    document.getElementById('soldiersCount').textContent = `${this.soldiersTotal}/${this.soldiersMax}`;
    document.getElementById('sappersCount').textContent = `${this.sappers}/${this.sappersMax}`;
    document.getElementById('shieldIndicator').style.display = this.hasBlastShield ? 'flex' : 'none';

    document.getElementById('menuSealsBadge').textContent = this.royalSeals;
    document.getElementById('researchSealsCount').textContent = this.royalSeals;

    ['oracle', 'falcon', 'shield', 'bombard', 'probe'].forEach(p => {
      const cdEl = document.getElementById('cd' + p.charAt(0).toUpperCase() + p.slice(1));
      const card = document.getElementById('powerCard' + p.charAt(0).toUpperCase() + p.slice(1));
      if (cdEl && card) {
        if (this.powerCooldowns[p] > 0) {
          cdEl.textContent = this.powerCooldowns[p] + 's';
          card.classList.add('cooldown');
        } else {
          cdEl.textContent = t('powerReady');
          card.classList.remove('cooldown');
        }
      }
    });

    const modeKey = this.getModeNameKey();
    document.getElementById('missionTitle').textContent = `${t(modeKey)} - ${t('levelLabel')} ${this.level}`;
    if (this.mode === 'dragon') {
      document.getElementById('missionSub').textContent = `${this.dragonsSlain}/${this.dragonsTarget} ${t('slain')}`;
    } else if (this.mode === 'reclaim') {
      document.getElementById('missionSub').textContent = `${uncoveredCount}/${this.uncoveredTarget}`;
    } else {
      document.getElementById('missionSub').textContent = `${this.chestsCollected}/${this.chestsTarget}`;
    }
  }

  formatLED(val) {
    return Math.max(0, Math.min(9999, Math.floor(val))).toString().padStart(4, '0');
  }

  getModeNameKey() {
    switch (this.mode) {
      case 'dragon': return 'questDragonHunt';
      case 'reclaim': return 'questReclaimRealm';
      case 'treasury': return 'questRoyalTreasury';
      case 'siege': return 'questRivalKingdoms';
      default: return 'questDragonHunt';
    }
  }

  setupUI() {
    const quickLang = document.getElementById('quickLangSelect');
    quickLang.value = getLang();
    quickLang.addEventListener('change', (e) => {
      setLang(e.target.value);
      this.updateUI();
    });

    const btnRecruit = document.getElementById('btnQuickRecruitSapper');
    if (btnRecruit) {
      btnRecruit.addEventListener('click', () => this.recruitSapper());
    }

    const btnBuild = document.getElementById('btnBuildToggle');
    const palette = document.getElementById('buildPalette');
    btnBuild.addEventListener('click', () => {
      const show = palette.style.display !== 'flex';
      palette.style.display = show ? 'flex' : 'none';
      btnBuild.classList.toggle('active', show);
      if (show) {
        document.getElementById('powersPalette').style.display = 'none';
        document.getElementById('btnPowersToggle').classList.remove('active');
        this.activePower = null;
      } else {
        this.selectedBuildingType = null;
      }
    });

    document.getElementById('btnClosePalette').addEventListener('click', () => {
      palette.style.display = 'none';
      btnBuild.classList.remove('active', false);
      this.selectedBuildingType = null;
    });

    document.querySelectorAll('.build-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.build-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedBuildingType = card.getAttribute('data-build');
      });
    });

    const btnPowers = document.getElementById('btnPowersToggle');
    const powersPalette = document.getElementById('powersPalette');
    btnPowers.addEventListener('click', () => {
      const show = powersPalette.style.display !== 'flex';
      powersPalette.style.display = show ? 'flex' : 'none';
      btnPowers.classList.toggle('active', show);
      if (show) {
        palette.style.display = 'none';
        btnBuild.classList.remove('active');
        this.selectedBuildingType = null;
      } else {
        this.activePower = null;
      }
    });

    document.getElementById('btnClosePowers').addEventListener('click', () => {
      powersPalette.style.display = 'none';
      btnPowers.classList.remove('active');
      this.activePower = null;
    });

    document.querySelectorAll('.power-card').forEach(card => {
      card.addEventListener('click', () => {
        const pKey = card.getAttribute('data-power');
        this.activatePower(pKey);
      });
    });

    const btnFlag = document.getElementById('btnToggleFlagMode');
    btnFlag.addEventListener('click', () => {
      this.flagMode = !this.flagMode;
      btnFlag.classList.toggle('active', this.flagMode);
      btnFlag.style.background = this.flagMode ? '#ffd54f' : '';
    });

    document.getElementById('btnZoomIn').addEventListener('click', () => this.setZoom(this.zoom * 1.2));
    document.getElementById('btnZoomOut').addEventListener('click', () => this.setZoom(this.zoom * 0.8));

    document.getElementById('menuPlay').addEventListener('click', () => this.openQuestsModal());
    document.getElementById('missionBadge').addEventListener('click', () => this.openQuestsModal());

    document.getElementById('menuResearch').addEventListener('click', () => this.openResearchModal());

    document.getElementById('menuSettings').addEventListener('click', () => {
      document.getElementById('settingLangSelect').value = getLang();
      document.getElementById('modalSettings').style.display = 'flex';
    });

    document.getElementById('settingLangSelect').addEventListener('change', (e) => {
      setLang(e.target.value);
      quickLang.value = e.target.value;
      this.updateUI();
    });

    document.getElementById('settingSoundToggle').addEventListener('change', (e) => {
      sfx.setMuted(!e.target.checked);
    });

    document.getElementById('menuHelp').addEventListener('click', () => {
      document.getElementById('modalHelp').style.display = 'flex';
    });
    document.getElementById('btnHelpToggle').addEventListener('click', () => {
      document.getElementById('modalHelp').style.display = 'flex';
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
      });
    });

    document.getElementById('btnEndgameAction').addEventListener('click', () => {
      document.getElementById('modalGameOver').style.display = 'none';
      if (this.isVictory) {
        this.openQuestsModal();
      } else {
        this.startLevel(this.mode, this.level);
      }
    });

    window.onLanguageChanged = () => {
      this.updateUI();
      if (document.getElementById('modalResearch').style.display === 'flex') {
        this.renderResearchGrid();
      }
    };
  }

  // --- Quests & Level Selector ---
  openQuestsModal() {
    const modal = document.getElementById('modalQuests');
    modal.style.display = 'flex';

    document.querySelectorAll('.quest-item').forEach(item => {
      const qMode = item.getAttribute('data-mode');
      const maxUnlocked = this.progress[qMode] || 1;
      const progressLabel = item.querySelector('.quest-progress');
      if (progressLabel) progressLabel.textContent = `${maxUnlocked}/20 ${t('slain') ? 'ukończono' : 'completed'}`;

      item.onclick = () => {
        document.querySelectorAll('.quest-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        this.renderLevelGrid(qMode);
      };
    });

    this.renderLevelGrid(this.mode);
  }

  renderLevelGrid(qMode) {
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';
    const maxUnlocked = this.progress[qMode] || 1;

    let selectedLevel = Math.min(this.level, maxUnlocked);

    for (let i = 1; i <= 20; i++) {
      const box = document.createElement('div');
      box.className = 'level-box';
      box.textContent = i;

      if (i < maxUnlocked) {
        box.classList.add('completed');
        box.innerHTML = `${i} <span style="font-size:9px">⭐</span>`;
      } else if (i === maxUnlocked) {
        box.classList.add('available');
      } else {
        box.classList.add('locked');
      }

      if (i === selectedLevel) {
        box.classList.add('selected');
      }

      if (i <= maxUnlocked) {
        box.onclick = () => {
          document.querySelectorAll('.level-box').forEach(b => b.classList.remove('selected'));
          box.classList.add('selected');
          selectedLevel = i;
          this.updateLevelPreview(qMode, i);
        };
      }

      grid.appendChild(box);
    }

    this.updateLevelPreview(qMode, selectedLevel);

    document.getElementById('btnStartLevel').onclick = () => {
      document.getElementById('modalQuests').style.display = 'none';
      this.startLevel(qMode, selectedLevel);
    };
  }

  updateLevelPreview(qMode, lvl) {
    const title = document.getElementById('questModalTitle');
    const desc = document.getElementById('questModalDesc');

    let modeTitleKey = 'questDragonHunt';
    let goalKey = 'levelGoalDragon';
    let count = Math.min(5, Math.ceil(lvl / 3));

    if (qMode === 'reclaim') {
      modeTitleKey = 'questReclaimRealm';
      goalKey = 'levelGoalReclaim';
      count = 80 + lvl * 25;
    } else if (qMode === 'treasury') {
      modeTitleKey = 'questRoyalTreasury';
      goalKey = 'levelGoalTreasury';
      count = Math.max(2, Math.floor(lvl / 2));
    }

    title.textContent = `${t(modeTitleKey)} - ${t('levelLabel')} ${lvl}`;
    desc.textContent = t(goalKey, { count, target: count });
  }

  // --- Research Tech Tree ---
  openResearchModal() {
    const modal = document.getElementById('modalResearch');
    modal.style.display = 'flex';
    this.renderResearchGrid();
  }

  renderResearchGrid() {
    const grid = document.getElementById('researchGrid');
    grid.innerHTML = '';

    this.techDefinitions.forEach(tech => {
      const node = document.createElement('div');
      node.className = 'tech-node';
      const isUnlocked = this.techsUnlocked.includes(tech.id);
      if (isUnlocked) node.classList.add('unlocked');

      node.innerHTML = `
        <div style="font-size: 20px; margin-bottom: 4px;">${tech.icon}</div>
        <div class="node-title">${t(tech.nameKey)}</div>
        <div class="node-cost">${isUnlocked ? t('alreadyUnlocked') : `👑 ${tech.cost} Pieczęci`}</div>
      `;

      node.onclick = () => {
        document.querySelectorAll('.tech-node').forEach(n => n.classList.remove('selected'));
        node.classList.add('selected');
        this.showTechDetail(tech);
      };

      grid.appendChild(node);
    });

    document.getElementById('techDetailCard').style.display = 'none';
  }

  showTechDetail(tech) {
    const card = document.getElementById('techDetailCard');
    card.style.display = 'block';

    document.getElementById('techDetailTitle').textContent = `${tech.icon} ${t(tech.nameKey)}`;
    document.getElementById('techDetailDesc').textContent = t(tech.descKey);

    const isUnlocked = this.techsUnlocked.includes(tech.id);
    const btnUnlock = document.getElementById('btnUnlockTech');
    const statusLabel = document.getElementById('techStatusLabel');

    if (isUnlocked) {
      btnUnlock.style.display = 'none';
      statusLabel.textContent = `✔ ${t('alreadyUnlocked')}`;
      statusLabel.style.color = '#2e7d32';
    } else {
      btnUnlock.style.display = 'inline-block';
      statusLabel.textContent = '';
      btnUnlock.textContent = t('unlockCost', { cost: tech.cost });

      const canAfford = this.royalSeals >= tech.cost;
      btnUnlock.disabled = !canAfford;
      btnUnlock.style.opacity = canAfford ? '1' : '0.5';

      btnUnlock.onclick = () => {
        if (this.royalSeals >= tech.cost) {
          this.royalSeals -= tech.cost;
          this.techsUnlocked.push(tech.id);
          localStorage.setItem('ks_seals', this.royalSeals);
          localStorage.setItem('ks_techs', JSON.stringify(this.techsUnlocked));
          sfx.playBuild();
          this.renderResearchGrid();
          this.showTechDetail(tech);
          this.updateUI();
        }
      };
    }
  }
}

// Start game instance on window load
window.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  window.game = new KeepsweeperGame();
});
