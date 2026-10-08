// Keepsweeper Pixel Art & Procedural Sprite Generator
// 40px High-Detail Retro Sprites (Civilization 1 & Classic Fantasy Aesthetic)

const Sprites = {
  tileSize: 48, // Expanded larger tile grid size in px (48x48)

  makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  },

  init() {
    this.cache = {};

    // Tiles (40x40)
    this.cache.covered = this.drawCoveredTile();
    this.cache.flag = this.drawFlagTile();
    this.cache.golden_flag = this.drawGoldenFlag();
    this.cache.grass = this.drawGrassTile();
    this.cache.water = this.drawWaterTile();
    this.cache.trees = this.drawTreesTile();
    this.cache.road = this.drawRoadTile();
    this.cache.crater = this.drawCrater();
    this.cache.portal = this.drawPortal();
    this.cache.chest = this.drawChest();
    this.cache.wigwam = this.drawWigwam(); // Civ 1 Native Village / Hut

    // Buildings (40x40)
    this.cache.keep = this.drawKeep();
    this.cache.house = this.drawHouse();
    this.cache.barracks = this.drawBarracks();
    this.cache.watchtower = this.drawWatchtower();
    this.cache.market = this.drawMarket();
    this.cache.farm = this.drawFarm();
    this.cache.wall = this.drawWall();
    this.cache.wonder = this.drawWonder(); // Civ 1 Wonder of the World

    // Living Characters & Units (24x24 high detail)
    this.cache.worker = this.drawWorker();
    this.cache.sapper = this.drawSapper();
    this.cache.soldier = this.drawSoldier();
    this.cache.settler = this.drawSettler(); // Civ 1 Settler
    this.cache.native = this.drawNativeWarrior(); // Civ 1 Native Archer
    this.cache.goblin = this.drawGoblin();

    // Monsters & Flying Units
    this.cache.falcon = this.drawFalcon();
    this.cache.dragon = this.drawDragon();
    // Nature, Lakes, Seas & Dragon Caves
    this.cache.dragon_cave = this.drawDragonCave();
    this.cache.lake = this.drawLakeTile();
    this.cache.sea = this.drawSeaTile();
    this.cache.ship = this.drawShip();
    this.cache.dolphin = this.drawDolphin();

    // Colonization Settlement Evolution Tiers
    this.cache.settlement_camp = this.drawCampSettlement();
    this.cache.settlement_hamlet = this.drawHamletSettlement();
    this.cache.settlement_township = this.drawTownshipSettlement();
    this.cache.settlement_citadel = this.drawCitadelSettlement();

    // Classic Windows 95 Saper Pure Retro Engine Sprites
    this.cache.classic_covered = this.drawClassicCoveredTile();
    this.cache.classic_revealed = this.drawClassicRevealedTile();
    this.cache.classic_mine = this.drawClassicMine();
    this.cache.classic_detonated = this.drawClassicDetonatedMine();
    this.cache.classic_misflagged = this.drawClassicMisflagged();
    this.cache.classic_flag = this.drawClassicFlag();
  },

  // 1. Windows 95 Beveled Covered Tile (40x40)
  drawCoveredTile() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 0, s, s);

    // Bevel highlights & shadows
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, s, 3);
    ctx.fillRect(0, 0, 3, s);

    ctx.fillStyle = '#808080';
    ctx.fillRect(s - 3, 0, 3, s);
    ctx.fillRect(0, s - 3, s, 3);

    ctx.fillStyle = '#000000';
    ctx.fillRect(s - 1, 0, 1, s);
    ctx.fillRect(0, s - 1, s, 1);

    return canvas;
  },

  // Red Flag marker - Perfectly Centered on 48x48 tile
  drawFlagTile() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.covered || this.drawCoveredTile(), 0, 0);

    // Pole centered at x = 20
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(20, 8, 3, 27);
    // Base centered around x = 24
    ctx.fillStyle = '#212121';
    ctx.fillRect(14, 34, 16, 5);
    ctx.fillStyle = '#424242';
    ctx.fillRect(16, 32, 12, 2);

    // Red Banner extending rightwards (x: 23 to 39)
    ctx.fillStyle = '#d50000';
    ctx.beginPath();
    ctx.moveTo(23, 8);
    ctx.lineTo(39, 16);
    ctx.lineTo(23, 24);
    ctx.closePath();
    ctx.fill();

    // Gold crest star in banner
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(26, 14, 4, 4);

    return canvas;
  },

  // Golden Flag (Oracle True Sight Marker) - Centered
  drawGoldenFlag() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.covered || this.drawCoveredTile(), 0, 0);

    // Golden staff centered at x = 20
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(20, 7, 3, 28);
    // Base
    ctx.fillStyle = '#212121';
    ctx.fillRect(14, 34, 16, 5);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(16, 32, 12, 2);

    // Ornate Golden Pennant
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.moveTo(23, 7);
    ctx.lineTo(41, 16);
    ctx.lineTo(23, 25);
    ctx.closePath();
    ctx.fill();

    // Eye of Horus / Oracle Crystal
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(28, 16, 3, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  },

  // Grass meadow tile (Civ 1 Lush Plains)
  drawGrassTile() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.fillStyle = '#8bc34a';
    ctx.fillRect(0, 0, s, s);

    // Meadow flowers & tufts
    ctx.fillStyle = '#7cb342';
    ctx.fillRect(5, 7, 3, 3);
    ctx.fillRect(22, 16, 3, 3);
    ctx.fillRect(30, 9, 3, 3);
    ctx.fillRect(12, 28, 3, 3);
    ctx.fillRect(28, 30, 3, 3);

    // Little flowers (daisies & buttercups)
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(8, 20, 2, 2);
    ctx.fillRect(33, 22, 2, 2);

    ctx.strokeStyle = '#689f38';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, s - 1, s - 1);

    return canvas;
  },

  // Water tile
  drawWaterTile() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.fillStyle = '#3b9be5';
    ctx.fillRect(0, 0, s, s);

    ctx.fillStyle = '#90caf9';
    ctx.fillRect(4, 9, 8, 2);
    ctx.fillRect(22, 16, 10, 2);
    ctx.fillRect(10, 27, 8, 2);

    ctx.fillStyle = '#1e88e5';
    ctx.fillRect(14, 11, 8, 2);
    ctx.fillRect(3, 30, 8, 2);

    return canvas;
  },

  // Trees / Deep Forest tile
  drawTreesTile() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.grass || this.drawGrassTile(), 0, 0);

    // Trunks
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(18, 24, 4, 12);
    ctx.fillRect(8, 26, 3, 10);
    ctx.fillRect(29, 26, 3, 10);

    // Center Large Tree
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(20, 16, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#388e3c';
    ctx.beginPath();
    ctx.arc(17, 13, 9, 0, Math.PI * 2);
    ctx.fill();

    // Left Tree
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.arc(9, 19, 8, 0, Math.PI * 2);
    ctx.fill();

    // Right Tree
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(31, 20, 8, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  },

  // Road / Dirt Pathway (Civ 1 Road Connection)
  drawRoadTile() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.grass || this.drawGrassTile(), 0, 0);

    // Dirt road cross / patch
    ctx.fillStyle = '#d7ccc8';
    ctx.fillRect(12, 0, 16, s);
    ctx.fillRect(0, 12, s, 16);

    ctx.fillStyle = '#bcaaa4';
    ctx.fillRect(14, 2, 12, s - 4);
    ctx.fillRect(2, 14, s - 4, 12);

    // Small cobblestone speckles
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(16, 16, 3, 2);
    ctx.fillRect(22, 22, 3, 2);
    ctx.fillRect(18, 26, 3, 2);

    return canvas;
  },

  // Detonated Crater
  drawCrater() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.grass || this.drawGrassTile(), 0, 0);

    // Scorched outer earth
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(20, 20, 16, 0, Math.PI * 2);
    ctx.fill();

    // Blast cavity
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(20, 20, 11, 0, Math.PI * 2);
    ctx.fill();

    // Smoldering embers
    ctx.fillStyle = '#ff5722';
    ctx.fillRect(18, 17, 4, 4);
    ctx.fillStyle = '#ff9800';
    ctx.fillRect(14, 22, 3, 3);
    ctx.fillRect(23, 14, 3, 3);

    return canvas;
  },

  // Wioska Indian / Tubylców (Civ 1 Native Hut / Teepee Village)
  drawWigwam() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.grass || this.drawGrassTile(), 0, 0);

    // Dirt campfire clearing
    ctx.fillStyle = '#a1887f';
    ctx.beginPath();
    ctx.ellipse(20, 26, 15, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Campfire in front
    ctx.fillStyle = '#e65100';
    ctx.fillRect(18, 28, 4, 4);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(19, 27, 2, 2);

    // Main Teepee (Buffalo hide cone)
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath();
    ctx.moveTo(8, 28);
    ctx.lineTo(20, 7);
    ctx.lineTo(32, 28);
    ctx.closePath();
    ctx.fill();

    // Timber poles sticking out of top
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(17, 9);
    ctx.lineTo(23, 2);
    ctx.moveTo(23, 9);
    ctx.lineTo(17, 2);
    ctx.stroke();

    // Geometric tribal pattern (Turquoise & Ochre)
    ctx.fillStyle = '#00838f';
    ctx.fillRect(12, 19, 16, 2);
    ctx.fillStyle = '#d84315';
    ctx.fillRect(14, 22, 12, 2);

    // Teepee flap opening
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.moveTo(17, 28);
    ctx.lineTo(20, 20);
    ctx.lineTo(23, 28);
    ctx.closePath();
    ctx.fill();

    // Small totem pole on side
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(4, 18, 3, 10);
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(3, 19, 5, 2);

    return canvas;
  },

  // Keep / Castle (Civ 1 Capital Palace)
  drawKeep() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    // Stone base
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(5, 12, 30, 24);

    // Shadows
    ctx.fillStyle = '#757575';
    ctx.fillRect(7, 16, 8, 4);
    ctx.fillRect(25, 16, 8, 4);

    // Gate
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(15, 24, 10, 12);
    ctx.fillStyle = '#212121';
    ctx.fillRect(17, 26, 6, 10);

    // Corner towers
    ctx.fillStyle = '#bdbdbd';
    ctx.fillRect(3, 7, 8, 27);
    ctx.fillRect(29, 7, 8, 27);

    // Battlements
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(3, 4, 3, 4);
    ctx.fillRect(8, 4, 3, 4);
    ctx.fillRect(29, 4, 3, 4);
    ctx.fillRect(34, 4, 3, 4);

    // Center spire
    ctx.fillStyle = '#bdbdbd';
    ctx.fillRect(14, 5, 12, 10);

    // Red conical roof
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.moveTo(13, 5);
    ctx.lineTo(20, -1);
    ctx.lineTo(27, 5);
    ctx.closePath();
    ctx.fill();

    // Royal Banner
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(20, 0, 5, 3);

    return canvas;
  },

  // House (Residential Quarter)
  drawHouse() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(7, 15, 26, 21);

    // Timber frame beams
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(7, 15, 3, 21);
    ctx.fillRect(30, 15, 3, 21);
    ctx.fillRect(7, 33, 26, 3);
    ctx.fillRect(18, 15, 3, 21);

    // Wooden door
    ctx.fillStyle = '#795548';
    ctx.fillRect(17, 25, 6, 11);

    // Blue glass windows
    ctx.fillStyle = '#81d4fa';
    ctx.fillRect(10, 19, 5, 5);
    ctx.fillRect(24, 19, 5, 5);

    // Red tile roof
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.moveTo(5, 15);
    ctx.lineTo(20, 4);
    ctx.lineTo(35, 15);
    ctx.closePath();
    ctx.fill();

    // Chimney with puff
    ctx.fillStyle = '#616161';
    ctx.fillRect(26, 4, 4, 7);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(27, 1, 3, 3);

    return canvas;
  },

  // Barracks
  drawBarracks() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.fillStyle = '#78909c';
    ctx.fillRect(5, 13, 30, 23);

    ctx.fillStyle = '#37474f';
    ctx.fillRect(4, 10, 32, 5);

    // Arched portal
    ctx.fillStyle = '#263238';
    ctx.fillRect(14, 21, 12, 15);

    // Crossed Swords emblem
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(11, 14, 18, 2);
    ctx.fillRect(19, 10, 2, 10);

    // Torches
    ctx.fillStyle = '#ff9800';
    ctx.fillRect(8, 20, 3, 4);
    ctx.fillRect(29, 20, 3, 4);

    return canvas;
  },

  // Watchtower
  drawWatchtower() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    // Stone shaft
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(13, 10, 14, 26);
    ctx.fillStyle = '#757575';
    ctx.fillRect(23, 10, 4, 26);

    // Parapet
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(9, 5, 22, 8);

    // Arrow slit
    ctx.fillStyle = '#212121';
    ctx.fillRect(18, 18, 4, 6);

    // Archer stationed on top
    ctx.fillStyle = '#1565c0';
    ctx.fillRect(18, 2, 5, 5);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(23, 1, 2, 6);

    return canvas;
  },

  // Market
  drawMarket() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(6, 20, 28, 16);
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(5, 19, 30, 4);

    // Striped Awning
    const colors = ['#1976d2', '#ffffff', '#1976d2', '#ffffff', '#1976d2'];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = colors[i];
      ctx.fillRect(6 + i * 5.6, 7, 6, 12);
    }

    // Goods on display
    ctx.fillStyle = '#e53935';
    ctx.fillRect(9, 23, 4, 4);
    ctx.fillStyle = '#fbc02d';
    ctx.fillRect(17, 23, 5, 4);
    ctx.fillStyle = '#43a047';
    ctx.fillRect(26, 23, 4, 4);

    return canvas;
  },

  // Farm / Mill
  drawFarm() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.fillStyle = '#fdd835';
    ctx.fillRect(5, 20, 30, 16);

    ctx.fillStyle = '#fbc02d';
    for (let x = 7; x < 33; x += 5) {
      ctx.fillRect(x, 20, 2, 14);
    }

    // Windmill
    ctx.fillStyle = '#efebe9';
    ctx.fillRect(14, 10, 12, 18);

    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.moveTo(11, 10);
    ctx.lineTo(20, 4);
    ctx.lineTo(29, 10);
    ctx.closePath();
    ctx.fill();

    // Windmill sails
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(19, 4, 2, 12);
    ctx.fillRect(13, 9, 14, 2);

    return canvas;
  },

  // Stone Wall
  drawWall() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.fillStyle = '#78909c';
    ctx.fillRect(3, 8, 34, 28);

    // Crenellations
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(3, 3, 7, 6);
    ctx.fillRect(16, 3, 8, 6);
    ctx.fillRect(30, 3, 7, 6);

    ctx.fillStyle = '#455a64';
    ctx.fillRect(3, 17, 34, 2);
    ctx.fillRect(3, 26, 34, 2);
    ctx.fillRect(14, 8, 2, 9);
    ctx.fillRect(26, 8, 2, 9);

    return canvas;
  },

  // Cud Świata (Civ 1 Wonder - Colossus / Ancient Obelisk)
  drawWonder() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.grass || this.drawGrassTile(), 0, 0);

    // Marble steps podium
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(6, 30, 28, 6);
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(9, 26, 22, 5);

    // Golden Colossus / Obelisk monolith
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.moveTo(14, 26);
    ctx.lineTo(18, 5);
    ctx.lineTo(22, 5);
    ctx.lineTo(26, 26);
    ctx.closePath();
    ctx.fill();

    // Pyramidion golden tip with glowing gem
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.moveTo(17, 5);
    ctx.lineTo(20, 1);
    ctx.lineTo(23, 5);
    ctx.closePath();
    ctx.fill();

    // Arcane glyph runes
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(19, 10, 2, 3);
    ctx.fillRect(19, 16, 2, 3);
    ctx.fillRect(19, 22, 2, 3);

    return canvas;
  },

  // Monster Portal
  drawPortal() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.grass || this.drawGrassTile(), 0, 0);

    ctx.fillStyle = '#4a148c';
    ctx.beginPath();
    ctx.arc(20, 20, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ab47bc';
    ctx.beginPath();
    ctx.arc(20, 20, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e1bee7';
    ctx.beginPath();
    ctx.arc(20, 20, 5, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  },

  // Treasure Chest
  drawChest() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.grass || this.drawGrassTile(), 0, 0);

    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(9, 13, 22, 17);

    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(9, 13, 3, 17);
    ctx.fillRect(28, 13, 3, 17);
    ctx.fillRect(9, 19, 22, 3);

    ctx.fillStyle = '#ffb300';
    ctx.fillRect(18, 18, 5, 5);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(25, 10, 3, 3);

    return canvas;
  },

  // --- Living Characters (24x24 px Detailed Pixel Art) ---

  // 1. Worker (Tunic, pickaxe, boots)
  drawWorker() {
    const { canvas, ctx } = this.makeCanvas(24, 24);

    // Head
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(9, 3, 6, 6);
    // Cap
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(9, 2, 6, 3);

    // Blue Tunic
    ctx.fillStyle = '#1e88e5';
    ctx.fillRect(8, 9, 8, 8);

    // Pickaxe / Hammer
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(16, 6, 3, 10);
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(15, 5, 6, 3);

    // Legs & Boots
    ctx.fillStyle = '#424242';
    ctx.fillRect(8, 17, 3, 6);
    ctx.fillRect(13, 17, 3, 6);

    return canvas;
  },

  // 2. Sapper (Armored helmet, flak jacket, glowing probe lance)
  drawSapper() {
    const { canvas, ctx } = this.makeCanvas(24, 24);

    // Armored Pickelhaube Helmet
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(8, 2, 8, 6);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(11, 0, 2, 3);

    // Visor
    ctx.fillStyle = '#212121';
    ctx.fillRect(9, 5, 6, 2);

    // Flak armor vest
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(7, 8, 10, 9);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(7, 13, 10, 2);

    // Metal detector lance with glowing radar tip
    ctx.fillStyle = '#37474f';
    ctx.fillRect(17, 5, 2, 14);
    ctx.fillStyle = '#00e676';
    ctx.fillRect(16, 18, 4, 3);

    // Tool satchel
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(4, 9, 3, 6);

    // Boots
    ctx.fillStyle = '#263238';
    ctx.fillRect(8, 17, 3, 6);
    ctx.fillRect(13, 17, 3, 6);

    return canvas;
  },

  // 3. Knight / Soldier (Cuirass, plume, sword & shield)
  drawSoldier() {
    const { canvas, ctx } = this.makeCanvas(24, 24);

    // Steel helm
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(8, 2, 8, 6);
    ctx.fillStyle = '#d50000'; // Red plume
    ctx.fillRect(11, 0, 3, 3);

    // Steel plate
    ctx.fillStyle = '#78909c';
    ctx.fillRect(7, 8, 10, 9);

    // Kite Shield (Gold cross)
    ctx.fillStyle = '#c62828';
    ctx.fillRect(3, 8, 5, 9);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(5, 10, 2, 5);

    // Broadsword
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(17, 4, 3, 12);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(16, 14, 5, 2);

    // Greaves
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(8, 17, 3, 6);
    ctx.fillRect(13, 17, 3, 6);

    return canvas;
  },

  // 4. Osadnik (Civ 1 Settler - pioneer with cart pack & lantern)
  drawSettler() {
    const { canvas, ctx } = this.makeCanvas(24, 24);

    // Pioneer brim hat
    ctx.fillStyle = '#795548';
    ctx.fillRect(7, 3, 10, 3);
    ctx.fillRect(9, 1, 6, 3);

    // Head
    ctx.fillStyle = '#ffcc80';
    ctx.fillRect(9, 5, 6, 5);

    // Green pioneer cloak
    ctx.fillStyle = '#388e3c';
    ctx.fillRect(7, 10, 10, 8);

    // Big expedition rucksack
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(3, 8, 5, 9);

    // Lantern held in hand
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(17, 11, 4, 5);
    ctx.fillStyle = '#424242';
    ctx.fillRect(18, 9, 2, 2);

    // Boots
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(8, 18, 3, 5);
    ctx.fillRect(13, 18, 3, 5);

    return canvas;
  },

  // 5. Indianin / Wojownik Tubylczy (Civ 1 Native Warrior - Headdress & Bow)
  drawNativeWarrior() {
    const { canvas, ctx } = this.makeCanvas(24, 24);

    // Head
    ctx.fillStyle = '#d7a15c';
    ctx.fillRect(9, 4, 6, 6);

    // Eagle feather headdress
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 1, 8, 3);
    ctx.fillStyle = '#d50000';
    ctx.fillRect(10, 0, 2, 4);
    ctx.fillStyle = '#00bcd4';
    ctx.fillRect(13, 0, 2, 4);

    // Red warpaint stripe
    ctx.fillStyle = '#c62828';
    ctx.fillRect(9, 7, 6, 1);

    // Buckskin tunic with turquoise beadwork
    ctx.fillStyle = '#a1887f';
    ctx.fillRect(8, 10, 8, 8);
    ctx.fillStyle = '#00838f';
    ctx.fillRect(8, 11, 8, 2);

    // Wooden hunting bow
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(18, 12, 6, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Moccasins
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(8, 18, 3, 5);
    ctx.fillRect(13, 18, 3, 5);

    return canvas;
  },

  // 6. Goblin Raider
  drawGoblin() {
    const { canvas, ctx } = this.makeCanvas(24, 24);

    // Green skin head & big pointy ears
    ctx.fillStyle = '#43a047';
    ctx.fillRect(8, 4, 8, 6);
    ctx.fillRect(5, 5, 3, 3);
    ctx.fillRect(16, 5, 3, 3);

    // Red glowing eyes
    ctx.fillStyle = '#d50000';
    ctx.fillRect(9, 6, 2, 2);
    ctx.fillRect(13, 6, 2, 2);

    // Rags
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(7, 10, 10, 7);

    // Spiked club
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(17, 7, 4, 9);
    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(16, 7, 2, 2);

    // Feet
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(8, 17, 3, 5);
    ctx.fillRect(13, 17, 3, 5);

    return canvas;
  },

  // 7. Royal Falcon
  drawFalcon() {
    const { canvas, ctx } = this.makeCanvas(28, 28);

    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.moveTo(14, 14);
    ctx.lineTo(1, 4);
    ctx.lineTo(9, 16);
    ctx.lineTo(14, 20);
    ctx.lineTo(19, 16);
    ctx.lineTo(27, 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.ellipse(14, 14, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#efebe9';
    ctx.fillRect(13, 5, 3, 4);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(14, 3, 3, 3);

    return canvas;
  },

  // 8. Colossal Red Dragon (72x72 px)
  drawDragon() {
    const { canvas, ctx } = this.makeCanvas(72, 72);

    // Crimson body
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.ellipse(36, 40, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden underbelly scales
    ctx.fillStyle = '#fbc02d';
    ctx.beginPath();
    ctx.ellipse(36, 44, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Serpentine tail
    ctx.strokeStyle = '#b71c1c';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(20, 40);
    ctx.quadraticCurveTo(8, 40, 6, 28);
    ctx.stroke();

    // Tail blade
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.moveTo(6, 26);
    ctx.lineTo(2, 30);
    ctx.lineTo(7, 34);
    ctx.closePath();
    ctx.fill();

    // Long Neck
    ctx.strokeStyle = '#b71c1c';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(48, 38);
    ctx.quadraticCurveTo(56, 32, 60, 24);
    ctx.stroke();

    // Dragon head
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.ellipse(62, 22, 10, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.moveTo(60, 17);
    ctx.lineTo(54, 9);
    ctx.lineTo(58, 16);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(63, 20, 3, 3);

    // Majestic Wings
    ctx.fillStyle = '#e53935';
    // Left
    ctx.beginPath();
    ctx.moveTo(32, 34);
    ctx.lineTo(8, 10);
    ctx.lineTo(18, 32);
    ctx.lineTo(28, 36);
    ctx.closePath();
    ctx.fill();

    // Right
    ctx.beginPath();
    ctx.moveTo(40, 34);
    ctx.lineTo(56, 8);
    ctx.lineTo(50, 32);
    ctx.lineTo(42, 36);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#8e0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, 34);
    ctx.lineTo(8, 10);
    ctx.moveTo(40, 34);
    ctx.lineTo(56, 8);
    ctx.stroke();

    return canvas;
  },

  // 9. Volcanic Dragon Cave (40x40)
  drawDragonCave() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    // Mountain rock base
    ctx.fillStyle = '#424242';
    ctx.beginPath();
    ctx.moveTo(4, 38);
    ctx.lineTo(12, 10);
    ctx.lineTo(26, 6);
    ctx.lineTo(36, 38);
    ctx.closePath();
    ctx.fill();

    // Rocky highlights and cracks
    ctx.fillStyle = '#616161';
    ctx.fillRect(10, 12, 6, 8);
    ctx.fillRect(24, 10, 8, 12);
    ctx.fillStyle = '#212121';
    ctx.fillRect(18, 14, 2, 8);

    // Dark mysterious cavern entrance
    ctx.fillStyle = '#1a0000';
    ctx.beginPath();
    ctx.ellipse(20, 28, 9, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing fiery dragon eyes inside the dark cave!
    ctx.fillStyle = '#ff3d00';
    ctx.fillRect(16, 26, 2, 3);
    ctx.fillRect(22, 26, 2, 3);
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(16, 27, 1, 1);
    ctx.fillRect(22, 27, 1, 1);

    // Golden treasure glints around mouth
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(12, 34, 3, 3);
    ctx.fillRect(26, 33, 4, 3);

    // Volcanic smoke plume at peak
    ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
    ctx.beginPath();
    ctx.arc(22, 5, 4, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  },

  // 10. Natural Inland Lake (40x40)
  drawLakeTile() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    // Sand / bank rim
    ctx.fillStyle = '#d7ccc8';
    ctx.fillRect(0, 0, s, s);

    // Deep fresh water
    ctx.fillStyle = '#0288d1';
    ctx.beginPath();
    ctx.ellipse(20, 20, 17, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Deep water core
    ctx.fillStyle = '#01579b';
    ctx.beginPath();
    ctx.ellipse(20, 20, 11, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Water ripple reflections
    ctx.fillStyle = '#81d4fa';
    ctx.fillRect(12, 14, 8, 2);
    ctx.fillRect(18, 22, 10, 2);
    ctx.fillRect(14, 26, 6, 2);

    return canvas;
  },

  // 11. Coastal Sea Shore (40x40)
  drawSeaTile() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.fillStyle = '#0277bd';
    ctx.fillRect(0, 0, s, s);

    // Ocean waves foam
    ctx.fillStyle = '#e1f5fe';
    ctx.fillRect(2, 6, 12, 2);
    ctx.fillRect(22, 14, 14, 2);
    ctx.fillRect(6, 26, 16, 2);
    ctx.fillRect(24, 34, 10, 2);

    return canvas;
  },

  // 12. Settlement Evolution Tier 1: Pioneer Camp (Colonization Style)
  drawCampSettlement() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.grass || this.drawGrassTile(), 0, 0);

    // Pioneer Log Fire & Camp
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(17, 26, 6, 3);
    ctx.fillStyle = '#ff6d00';
    ctx.beginPath();
    ctx.moveTo(17, 26);
    ctx.lineTo(20, 20);
    ctx.lineTo(23, 26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(19, 23, 2, 3);

    // Main Canvas Pioneer Tent
    ctx.fillStyle = '#efebe9';
    ctx.beginPath();
    ctx.moveTo(6, 28);
    ctx.lineTo(15, 10);
    ctx.lineTo(24, 28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tent flap entrance
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.moveTo(12, 28);
    ctx.lineTo(15, 16);
    ctx.lineTo(18, 28);
    ctx.closePath();
    ctx.fill();

    // Supply crate & banner
    ctx.fillStyle = '#795548';
    ctx.fillRect(26, 22, 9, 8);
    ctx.fillStyle = '#1976d2';
    ctx.fillRect(32, 8, 2, 14);
    ctx.fillRect(26, 8, 6, 5);

    return canvas;
  },

  // Settlement Evolution Tier 2: Forest Hamlet (Osada Leśna)
  drawHamletSettlement() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    ctx.drawImage(this.cache.grass || this.drawGrassTile(), 0, 0);

    // Wooden timber palisade fence
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(2, 34, 36, 4);

    // Pioneer Timber Longhouse
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(8, 16, 24, 16);

    // Thatch / Shingle Gable Roof
    ctx.fillStyle = '#bcaaa4';
    ctx.beginPath();
    ctx.moveTo(4, 16);
    ctx.lineTo(20, 6);
    ctx.lineTo(36, 16);
    ctx.closePath();
    ctx.fill();

    // Wooden door & windows
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(17, 22, 6, 10);
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(10, 20, 4, 4);
    ctx.fillRect(26, 20, 4, 4);

    // Water well
    ctx.fillStyle = '#78909c';
    ctx.fillRect(3, 24, 5, 5);

    return canvas;
  },

  // Settlement Evolution Tier 3: Township (Miasteczko Handlowe)
  drawTownshipSettlement() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    // Paved stone plaza base
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(0, 0, s, s);

    // Left Townhouse (Stone)
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(3, 14, 15, 22);
    ctx.fillStyle = '#b71c1c';
    ctx.fillRect(2, 8, 17, 6); // Red roof

    // Right Townhouse
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(21, 12, 16, 24);
    ctx.fillStyle = '#1565c0';
    ctx.fillRect(20, 6, 18, 6); // Blue roof

    // Center Belltower
    ctx.fillStyle = '#78909c';
    ctx.fillRect(15, 4, 10, 16);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(18, 2, 4, 4); // Golden spire

    // Arched market gateway
    ctx.fillStyle = '#37474f';
    ctx.fillRect(16, 24, 8, 14);

    return canvas;
  },

  // Settlement Evolution Tier 4: Royal Citadel / Grand Fortress (Królewska Twierdza)
  drawCitadelSettlement() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);

    // Solid Granite base
    ctx.fillStyle = '#455a64';
    ctx.fillRect(0, 0, s, s);

    // Mighty Battlements & Curtains
    ctx.fillStyle = '#78909c';
    ctx.fillRect(4, 12, 32, 24);

    // Great Bastion Towers
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(2, 6, 10, 30);
    ctx.fillRect(28, 6, 10, 30);

    // Crenellations
    ctx.fillStyle = '#37474f';
    ctx.fillRect(2, 4, 3, 3);
    ctx.fillRect(8, 4, 4, 3);
    ctx.fillRect(28, 4, 4, 3);
    ctx.fillRect(35, 4, 3, 3);

    // Grand Keep Sanctuary
    ctx.fillStyle = '#90a4ae';
    ctx.fillRect(12, 4, 16, 20);

    // Portcullis & Iron Gate
    ctx.fillStyle = '#212121';
    ctx.fillRect(16, 24, 8, 14);

    // Golden Royal Lion Heraldry
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(18, 12, 4, 6);
    // Royal Banners atop towers
    ctx.fillStyle = '#d50000';
    ctx.fillRect(5, 0, 5, 4);
    ctx.fillRect(30, 0, 5, 4);

    return canvas;
  },

  // --- Classic Windows 95 Pure Saper Sprites ---
  drawClassicCoveredTile() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 0, s, s);
    // Classic 3D Bevel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, s, 3);
    ctx.fillRect(0, 0, 3, s);
    ctx.fillStyle = '#808080';
    ctx.fillRect(s - 3, 0, 3, s);
    ctx.fillRect(0, s - 3, s, 3);
    return canvas;
  },

  drawClassicRevealedTile() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, s - 1, s - 1);
    return canvas;
  },

  drawClassicMine() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);
    ctx.drawImage(this.drawClassicRevealedTile(), 0, 0);

    // Black spherical naval mine with spikes
    const cx = s / 2;
    const cy = s / 2;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();

    // Spikes (horizontal, vertical, diagonal)
    ctx.fillRect(cx - 13, cy - 2, 26, 4);
    ctx.fillRect(cx - 2, cy - 13, 4, 26);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-12, -2, 24, 4);
    ctx.fillRect(-2, -12, 4, 24);
    ctx.restore();

    // White specular highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 4, cy - 4, 3, 3);

    return canvas;
  },

  drawClassicDetonatedMine() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);
    // Red explosion background
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, s - 1, s - 1);

    const cx = s / 2;
    const cy = s / 2;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 13, cy - 2, 26, 4);
    ctx.fillRect(cx - 2, cy - 13, 4, 26);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 4, cy - 4, 3, 3);
    return canvas;
  },

  drawClassicMisflagged() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);
    ctx.drawImage(this.drawClassicMine(), 0, 0);
    // Big Red 'X' over mine
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(6, 6);
    ctx.lineTo(s - 6, s - 6);
    ctx.moveTo(s - 6, 6);
    ctx.lineTo(6, s - 6);
    ctx.stroke();
    return canvas;
  },

  drawClassicFlag() {
    const s = this.tileSize;
    const { canvas, ctx } = this.makeCanvas(s, s);
    ctx.drawImage(this.drawClassicCoveredTile(), 0, 0);

    // Classic black pole centered at x = 20
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, 8, 3, 26);
    ctx.fillRect(14, 32, 16, 5);
    ctx.fillRect(18, 29, 8, 3);

    // Red flag extending rightwards
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(23, 8);
    ctx.lineTo(38, 15);
    ctx.lineTo(23, 22);
    ctx.closePath();
    ctx.fill();

    return canvas;
  },

  // 10. Living Ocean: Oceanic Sailing Ship / Caravel (36x36)
  drawShip() {
    const { canvas, ctx } = this.makeCanvas(36, 36);

    // Wooden Hull
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.moveTo(4, 24);
    ctx.lineTo(32, 24);
    ctx.lineTo(28, 31);
    ctx.lineTo(8, 31);
    ctx.closePath();
    ctx.fill();

    // Dark trim
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(6, 23, 24, 2);

    // Main Mast
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(17, 6, 2, 18);
    // Fore Mast
    ctx.fillRect(9, 10, 2, 14);

    // White Billowing Sails
    ctx.fillStyle = '#ffffff';
    // Main Sail
    ctx.beginPath();
    ctx.moveTo(19, 7);
    ctx.quadraticCurveTo(28, 13, 19, 19);
    ctx.lineTo(19, 7);
    ctx.fill();
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fore Sail
    ctx.beginPath();
    ctx.moveTo(11, 11);
    ctx.quadraticCurveTo(18, 15, 11, 20);
    ctx.lineTo(11, 11);
    ctx.fill();

    // Red Cross of the Navigator on Main Sail
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(22, 11, 2, 5);
    ctx.fillRect(20, 13, 6, 2);

    // Pennant Flag on Top Mast
    ctx.fillStyle = '#fbc02d';
    ctx.beginPath();
    ctx.moveTo(18, 6);
    ctx.lineTo(24, 8);
    ctx.lineTo(18, 10);
    ctx.closePath();
    ctx.fill();

    return canvas;
  },

  // 11. Living Ocean: Jumping Dolphin (28x28)
  drawDolphin() {
    const { canvas, ctx } = this.makeCanvas(28, 28);

    // Sleek Dolphin Body (Curved arc in jump)
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.ellipse(14, 14, 11, 5, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // White/Light Grey Underbelly
    ctx.fillStyle = '#eceff1';
    ctx.beginPath();
    ctx.ellipse(14, 16, 8, 3, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Dorsal Fin
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.moveTo(12, 10);
    ctx.lineTo(15, 6);
    ctx.lineTo(16, 11);
    ctx.closePath();
    ctx.fill();

    // Fluke / Tail
    ctx.beginPath();
    ctx.moveTo(4, 21);
    ctx.lineTo(1, 24);
    ctx.lineTo(3, 19);
    ctx.closePath();
    ctx.fill();

    // Beak / Snout
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.moveTo(22, 9);
    ctx.lineTo(26, 8);
    ctx.lineTo(23, 11);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(20, 10, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(21, 10, 1, 1);

    return canvas;
  }
};
